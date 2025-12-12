<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/services/api';
	import type { RedeemTransaction } from '$lib/types';
	
	let redeems: any[] = [];
	let members: any[] = [];
	let vouchers: any[] = [];
	let loading = false;
	let showModal = false;
	let searchQuery = '';
	let filterStatus: 'All' | 'Pending' | 'Completed' | 'Cancelled' | 'Used' = 'All';
	
	let formData = {
		memberId: '',
		voucherId: ''
	};
	
	$: filteredRedeems = redeems.filter(redeem => {
		const memberName = redeem.member_name || '';
		const voucherName = redeem.voucher_name || '';
		const matchSearch = memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
		                   voucherName.toLowerCase().includes(searchQuery.toLowerCase());
		const matchStatus = filterStatus === 'All' || redeem.status === filterStatus;
		return matchSearch && matchStatus;
	}).sort((a, b) => new Date(b.redeem_date).getTime() - new Date(a.redeem_date).getTime());
	
	$: selectedMember = members.find(m => m.id === formData.memberId);
	$: selectedVoucher = vouchers.find(v => v.id === formData.voucherId);
	$: canRedeem = selectedMember && selectedVoucher && 
	               selectedMember.total_points >= selectedVoucher.points_cost &&
	               selectedVoucher.stock > 0;
	
	onMount(() => {
		loadData();
	});
	
	async function loadData() {
		loading = true;
		try {
			const [redeemsRes, membersRes, vouchersRes] = await Promise.all([
				api.getRedeemTransactions(filterStatus === 'All' ? undefined : filterStatus),
				api.getMembers('Active'),
				api.getVouchers('Active')
			]);
			
			if (redeemsRes.success && redeemsRes.data) {
				redeems = redeemsRes.data;
			}
			
			if (membersRes.success && membersRes.data) {
				members = membersRes.data;
			}
			
			if (vouchersRes.success && vouchersRes.data) {
				vouchers = vouchersRes.data;
			}
		} catch (err) {
			console.error('Failed to load data:', err);
		} finally {
			loading = false;
		}
	}
	
	function openRedeemModal() {
		formData = {
			memberId: '',
			voucherId: ''
		};
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
	}
	
	async function handleRedeem() {
		if (!selectedMember || !selectedVoucher) {
			alert('Silakan pilih member dan voucher!');
			return;
		}
		
		if (selectedMember.total_points < selectedVoucher.points_cost) {
			alert('Poin member tidak mencukupi!');
			return;
		}
		
		if (selectedVoucher.stock <= 0) {
			alert('Stok voucher habis!');
			return;
		}
		
		loading = true;
		try {
			const transaction = {
				id: 'R' + String(Date.now()).slice(-6),
				memberId: formData.memberId,
				voucherId: formData.voucherId,
				pointsUsed: selectedVoucher.points_cost,
				redeemDate: new Date().toISOString().split('T')[0],
				status: 'Completed'
			};
			
			await api.createRedeemTransaction(transaction);
			await loadData();
			closeModal();
		} catch (err) {
			alert('Gagal melakukan redeem!');
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	async function handleStatusChange(id: string, newStatus: string) {
		if (confirm(`Ubah status menjadi ${newStatus}?`)) {
			loading = true;
			try {
				const usedDate = newStatus === 'Used' ? new Date().toISOString().split('T')[0] : undefined;
				await api.updateRedeemStatus(id, newStatus, usedDate);
				await loadData();
			} catch (err) {
				alert('Gagal mengubah status!');
				console.error(err);
			} finally {
				loading = false;
			}
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
	
	function getStatusBadge(status: string) {
		switch(status) {
			case 'Completed': return 'success';
			case 'Pending': return 'warning';
			case 'Cancelled': return 'danger';
			case 'Used': return 'info';
			default: return 'info';
		}
	}
	
	$: totalRedeems = redeems.length;
	$: completedRedeems = redeems.filter(r => r.status === 'Completed').length;
	$: usedRedeems = redeems.filter(r => r.status === 'Used').length;
</script>

<svelte:head>
	<title>Redeem Management - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>🎁 Redeem Management</h1>
		<button class="btn btn-primary" on:click={openRedeemModal}>
			➕ Proses Redeem Baru
		</button>
	</div>
	
	<!-- Stats -->
	<div class="grid grid-3">
		<div class="stat-card" style="border-left-color: #3b82f6;">
			<h3>Total Redeem</h3>
			<div class="value">{totalRedeems}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #10b981;">
			<h3>Completed</h3>
			<div class="value">{completedRedeems}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #f59e0b;">
			<h3>Terpakai</h3>
			<div class="value">{usedRedeems}</div>
		</div>
	</div>
	
	<!-- Search and Filter -->
	<div class="card">
		<div class="filter-section">
			<div class="search-box">
				<input 
					type="text" 
					placeholder="🔍 Cari member atau voucher..." 
					bind:value={searchQuery}
				/>
			</div>
			
			<div class="filter-buttons">
				<button 
					class="btn btn-secondary" 
					class:active={filterStatus === 'All'}
					on:click={() => filterStatus = 'All'}
				>
					Semua
				</button>
				<button 
					class="btn btn-warning" 
					class:active={filterStatus === 'Pending'}
					on:click={() => filterStatus = 'Pending'}
				>
					Pending
				</button>
				<button 
					class="btn btn-success" 
					class:active={filterStatus === 'Completed'}
					on:click={() => filterStatus = 'Completed'}
				>
					Completed
				</button>
				<button 
					class="btn" 
					style="background: #3b82f6; color: white;"
					class:active={filterStatus === 'Used'}
					on:click={() => filterStatus = 'Used'}
				>
					Terpakai
				</button>
				<button 
					class="btn btn-danger" 
					class:active={filterStatus === 'Cancelled'}
					on:click={() => filterStatus = 'Cancelled'}
				>
					Cancelled
				</button>
			</div>
		</div>
	</div>
	
	<!-- Redeems Table -->
	<div class="card">
		<div class="table-responsive">
			<table class="table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Tanggal Redeem</th>
						<th>Member</th>
						<th>Voucher</th>
						<th>Poin Digunakan</th>
						<th>Status</th>
						<th>Tanggal Digunakan</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRedeems as redeem}
						<tr>
							<td>{redeem.id}</td>
							<td>{formatDate(redeem.redeem_date)}</td>
							<td>
								<strong>{redeem.member_name}</strong>
								<div style="font-size: 12px; color: #6b7280;">{redeem.member_id}</div>
							</td>
							<td>
								<strong>{redeem.voucher_name}</strong>
								<div style="font-size: 12px; color: #6b7280;">{redeem.voucher_id}</div>
							</td>
							<td><strong>{redeem.points_used.toLocaleString('id-ID')}</strong></td>
							<td>
								<span class="badge badge-{getStatusBadge(redeem.status)}">
									{redeem.status}
								</span>
							</td>
							<td>{redeem.used_date ? formatDate(redeem.used_date) : '-'}</td>
							<td>
								<div class="action-buttons">
									{#if redeem.status === 'Completed'}
										<button 
											class="btn-sm btn-success" 
											on:click={() => handleStatusChange(redeem.id, 'Used')}
											title="Tandai sebagai terpakai"
										>
											✓ Pakai
										</button>
										<button 
											class="btn-sm btn-danger" 
											on:click={() => handleStatusChange(redeem.id, 'Cancelled')}
											title="Batalkan"
										>
											✗ Batal
										</button>
									{:else if redeem.status === 'Pending'}
										<button 
											class="btn-sm btn-success" 
											on:click={() => handleStatusChange(redeem.id, 'Completed')}
											title="Selesaikan"
										>
											✓ Selesai
										</button>
										<button 
											class="btn-sm btn-danger" 
											on:click={() => handleStatusChange(redeem.id, 'Cancelled')}
											title="Batalkan"
										>
											✗ Batal
										</button>
									{:else}
										<span style="color: #9ca3af; font-size: 12px;">Tidak ada aksi</span>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		{#if filteredRedeems.length === 0}
			<div class="empty-state">
				<p>Tidak ada transaksi redeem yang ditemukan.</p>
			</div>
		{/if}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Proses Redeem Voucher</h2>
				<button class="close-btn" on:click={closeModal}>&times;</button>
			</div>
			
			<form on:submit|preventDefault={handleRedeem}>
				<div class="form-group">
					<label>Pilih Member *</label>
					<select bind:value={formData.memberId} required>
						<option value="">-- Pilih Member --</option>
						{#each members.filter(m => m.status === 'Active') as member}
							<option value={member.id}>
								{member.name} ({member.id}) - {member.total_points.toLocaleString('id-ID')} poin
							</option>
						{/each}
					</select>
				</div>
				
				{#if selectedMember}
					<div class="info-box">
						<h4>Informasi Member</h4>
						<div class="info-row">
							<span>Nama:</span>
							<strong>{selectedMember.name}</strong>
						</div>
						<div class="info-row">
							<span>Poin Tersedia:</span>
							<strong class="points">{selectedMember.total_points.toLocaleString('id-ID')} poin</strong>
						</div>
						<div class="info-row">
							<span>Tier:</span>
							<span class="badge badge-success">{selectedMember.tier_level}</span>
						</div>
					</div>
				{/if}
				
				<div class="form-group">
					<label>Pilih Voucher *</label>
					<select bind:value={formData.voucherId} required>
						<option value="">-- Pilih Voucher --</option>
						{#each vouchers.filter(v => v.status === 'Active' && v.stock > 0) as voucher}
							<option value={voucher.id}>
								{voucher.name} - {voucher.points_cost.toLocaleString('id-ID')} poin (Stok: {voucher.stock})
							</option>
						{/each}
					</select>
				</div>
				
				{#if selectedVoucher}
					<div class="info-box">
						<h4>Informasi Voucher</h4>
						<div class="info-row">
							<span>Kode:</span>
							<strong>{selectedVoucher.code}</strong>
						</div>
						<div class="info-row">
							<span>Deskripsi:</span>
							<span>{selectedVoucher.description}</span>
						</div>
						<div class="info-row">
							<span>Biaya Poin:</span>
							<strong class="points">{selectedVoucher.pointsCost.toLocaleString('id-ID')} poin</strong>
						</div>
						<div class="info-row">
							<span>Stok:</span>
							<strong>{selectedVoucher.stock}</strong>
						</div>
					</div>
					
					{#if !canRedeem}
						<div class="alert alert-error">
							{#if selectedMember && selectedMember.totalPoints < selectedVoucher.pointsCost}
								⚠️ Poin member tidak mencukupi untuk menukar voucher ini!
							{:else if selectedVoucher.stock <= 0}
								⚠️ Stok voucher habis!
							{/if}
						</div>
					{:else}
						<div class="alert alert-success">
							✓ Redeem dapat dilakukan
						</div>
					{/if}
				{/if}
				
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" on:click={closeModal}>
						Batal
					</button>
					<button type="submit" class="btn btn-primary" disabled={!canRedeem}>
						Proses Redeem
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
	}
	
	.page-header h1 {
		font-size: 32px;
		color: var(--dark-color);
	}
	
	.filter-section {
		display: flex;
		gap: 20px;
		align-items: center;
		flex-wrap: wrap;
	}
	
	.search-box {
		flex: 1;
		min-width: 300px;
	}
	
	.filter-buttons {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	
	.filter-buttons .btn.active {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	}
	
	.table-responsive {
		overflow-x: auto;
	}
	
	.action-buttons {
		display: flex;
		gap: 8px;
	}
	
	.btn-sm {
		padding: 6px 12px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		font-weight: 500;
		transition: all 0.3s ease;
		white-space: nowrap;
	}
	
	.btn-sm.btn-success {
		background-color: var(--secondary-color);
		color: white;
	}
	
	.btn-sm.btn-danger {
		background-color: var(--danger-color);
		color: white;
	}
	
	.btn-sm:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}
	
	.info-box {
		background: #f9fafb;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 15px;
		margin: 15px 0;
	}
	
	.info-box h4 {
		margin-bottom: 12px;
		color: var(--dark-color);
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.info-row:last-child {
		border-bottom: none;
	}
	
	.info-row span {
		color: #6b7280;
		font-size: 14px;
	}
	
	.info-row strong {
		color: var(--dark-color);
	}
	
	.info-row .points {
		color: var(--primary-color);
		font-weight: 700;
	}
	
	.empty-state {
		text-align: center;
		padding: 40px;
		color: #6b7280;
	}
	
	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 20px;
	}
	
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}
		
		.filter-section {
			flex-direction: column;
			align-items: stretch;
		}
		
		.search-box {
			min-width: auto;
		}
		
		.action-buttons {
			flex-direction: column;
		}
	}
</style>
