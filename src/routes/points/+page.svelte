<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/services/api';
	import type { PointTransaction, Member } from '$lib/types';
	
	let transactions: any[] = [];
	let members: Member[] = [];
	let loading = false;
	let showModal = false;
	let searchQuery = '';
	let filterType: 'All' | 'earn' | 'redeem' | 'expire' | 'adjustment' = 'All';
	
	let formData = {
		memberId: '',
		type: 'earn',
		points: 0,
		description: ''
	};
	
	$: filteredTransactions = transactions.filter(transaction => {
		const matchSearch = (transaction.member_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
		                   (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase());
		const matchType = filterType === 'All' || transaction.type === filterType;
		return matchSearch && matchType;
	}).sort((a, b) => new Date(b.transaction_date || b.date).getTime() - new Date(a.transaction_date || a.date).getTime());
	
	onMount(() => {
		loadData();
	});
	
	async function loadData() {
		loading = true;
		try {
			const [transactionsRes, membersRes] = await Promise.all([
				api.getPointTransactions(filterType === 'All' ? undefined : filterType),
				api.getMembers('Active')
			]);
			
			if (transactionsRes.success && transactionsRes.data) {
				transactions = transactionsRes.data;
			}
			
			if (membersRes.success && membersRes.data) {
				members = membersRes.data.map((m: any) => ({
					id: m.id,
					name: m.name,
					email: m.email,
					phone: m.phone,
					address: m.address,
					joinDate: m.join_date,
					totalPoints: m.total_points,
					tierLevel: m.tier_level,
					status: m.status
				}));
			}
		} catch (err) {
			console.error('Failed to load data:', err);
		} finally {
			loading = false;
		}
	}
	
	function openAddModal() {
		formData = {
			memberId: '',
			type: 'earn',
			points: 0,
			description: ''
		};
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
	}
	
	async function handleSubmit() {
		const member = members.find(m => m.id === formData.memberId);
		if (!member) {
			alert('Member tidak ditemukan!');
			return;
		}
		
		loading = true;
		try {
			const transaction = {
				id: 'PT' + String(Date.now()).slice(-6),
				memberId: formData.memberId,
				type: formData.type,
				points: formData.points,
				description: formData.description,
				date: new Date().toISOString().split('T')[0]
			};
			
			await api.createPointTransaction(transaction);
			await loadData();
			closeModal();
		} catch (err) {
			alert('Gagal menambahkan transaksi!');
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
	
	function getTypeLabel(type: string) {
		switch(type) {
			case 'earn': return 'Dapat Poin';
			case 'redeem': return 'Redeem';
			case 'expire': return 'Kadaluarsa';
			case 'adjustment': return 'Penyesuaian';
			default: return type;
		}
	}
	
	function getTypeBadge(type: string) {
		switch(type) {
			case 'earn': return 'success';
			case 'redeem': return 'warning';
			case 'expire': return 'danger';
			case 'adjustment': return 'info';
			default: return 'info';
		}
	}
	
	$: totalPointsEarned = transactions
		.filter(t => t.points > 0)
		.reduce((sum, t) => sum + t.points, 0);
	
	$: totalPointsRedeemed = Math.abs(transactions
		.filter(t => t.points < 0)
		.reduce((sum, t) => sum + t.points, 0));
</script>

<svelte:head>
	<title>Poin Management - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>⭐ Poin Management</h1>
		<button class="btn btn-primary" on:click={openAddModal}>
			➕ Tambah Transaksi Poin
		</button>
	</div>
	
	<!-- Stats -->
	<div class="grid grid-3">
		<div class="stat-card" style="border-left-color: #10b981;">
			<h3>Total Poin Diterbitkan</h3>
			<div class="value">{totalPointsEarned.toLocaleString('id-ID')}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #f59e0b;">
			<h3>Total Poin Diredeem</h3>
			<div class="value">{totalPointsRedeemed.toLocaleString('id-ID')}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #3b82f6;">
			<h3>Total Transaksi</h3>
			<div class="value">{transactions.length}</div>
		</div>
	</div>
	
	<!-- Search and Filter -->
	<div class="card">
		<div class="filter-section">
			<div class="search-box">
				<input 
					type="text" 
					placeholder="🔍 Cari nama member atau deskripsi..." 
					bind:value={searchQuery}
				/>
			</div>
			
			<div class="filter-buttons">
				<button 
					class="btn btn-secondary" 
					class:active={filterType === 'All'}
					on:click={() => filterType = 'All'}
				>
					Semua
				</button>
				<button 
					class="btn btn-success" 
					class:active={filterType === 'earn'}
					on:click={() => filterType = 'earn'}
				>
					Dapat Poin
				</button>
				<button 
					class="btn btn-warning" 
					class:active={filterType === 'redeem'}
					on:click={() => filterType = 'redeem'}
				>
					Redeem
				</button>
				<button 
					class="btn btn-danger" 
					class:active={filterType === 'expire'}
					on:click={() => filterType = 'expire'}
				>
					Kadaluarsa
				</button>
				<button 
					class="btn" 
					style="background: #3b82f6; color: white;"
					class:active={filterType === 'adjustment'}
					on:click={() => filterType = 'adjustment'}
				>
					Penyesuaian
				</button>
			</div>
		</div>
	</div>
	
	<!-- Transactions Table -->
	<div class="card">
		<div class="table-responsive">
			<table class="table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Tanggal</th>
						<th>Member</th>
						<th>Tipe</th>
						<th>Poin</th>
						<th>Deskripsi</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredTransactions as transaction}
						<tr>
							<td>{transaction.id}</td>
							<td>{formatDate(transaction.transaction_date || transaction.date)}</td>
							<td>
								<strong>{transaction.member_name || transaction.memberName}</strong>
								<div style="font-size: 12px; color: #6b7280;">{transaction.member_id || transaction.memberId}</div>
							</td>
							<td>
								<span class="badge badge-{getTypeBadge(transaction.type)}">
									{getTypeLabel(transaction.type)}
								</span>
							</td>
							<td>
								<strong class:positive={transaction.points > 0} class:negative={transaction.points < 0}>
									{transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString('id-ID')}
								</strong>
							</td>
							<td>{transaction.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		{#if filteredTransactions.length === 0}
			<div class="empty-state">
				<p>Tidak ada transaksi poin yang ditemukan.</p>
			</div>
		{/if}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Tambah Transaksi Poin</h2>
				<button class="close-btn" on:click={closeModal}>&times;</button>
			</div>
			
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-group">
					<label>Pilih Member *</label>
					<select bind:value={formData.memberId} required>
						<option value="">-- Pilih Member --</option>
						{#each members as member}
							<option value={member.id}>
								{member.name} ({member.id}) - {member.totalPoints.toLocaleString('id-ID')} poin
							</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label>Tipe Transaksi *</label>
					<select bind:value={formData.type} required>
						<option value="earn">Dapat Poin</option>
						<option value="redeem">Redeem</option>
						<option value="expire">Kadaluarsa</option>
						<option value="adjustment">Penyesuaian</option>
					</select>
				</div>
				
				<div class="form-group">
					<label>Jumlah Poin *</label>
					<input 
						type="number" 
						bind:value={formData.points} 
						min="1"
						required 
						placeholder="Masukkan jumlah poin"
					/>
					<small style="color: #6b7280;">
						{#if formData.type === 'redeem' || formData.type === 'expire'}
							Poin akan dikurangi dari saldo member
						{:else}
							Poin akan ditambahkan ke saldo member
						{/if}
					</small>
				</div>
				
				<div class="form-group">
					<label>Deskripsi *</label>
					<textarea 
						bind:value={formData.description} 
						rows="3" 
						required
						placeholder="Contoh: Pembelian produk senilai Rp 1.000.000"
					></textarea>
				</div>
				
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" on:click={closeModal}>
						Batal
					</button>
					<button type="submit" class="btn btn-primary">
						Simpan
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
	
	.positive {
		color: var(--secondary-color);
	}
	
	.negative {
		color: var(--danger-color);
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
	}
</style>
