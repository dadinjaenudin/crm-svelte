<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/services/api';
	import type { Voucher } from '$lib/types';
	
	let vouchers: any[] = [];
	let loading = false;
	let showModal = false;
	let editMode = false;
	let searchQuery = '';
	let filterStatus: 'All' | 'Active' | 'Inactive' | 'Expired' = 'All';
	
	let formData: any = {
		id: '',
		code: '',
		name: '',
		description: '',
		type: 'percentage',
		discount_value: 0,
		points_cost: 0,
		stock: 0,
		start_date: new Date().toISOString().split('T')[0],
		end_date: '',
		status: 'Active'
	};
	
	$: filteredVouchers = vouchers.filter(voucher => {
		const matchSearch = (voucher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
		                   (voucher.code || '').toLowerCase().includes(searchQuery.toLowerCase());
		const matchStatus = filterStatus === 'All' || voucher.status === filterStatus;
		return matchSearch && matchStatus;
	});
	
	onMount(() => {
		loadVouchers();
	});
	
	async function loadVouchers() {
		loading = true;
		try {
			const response = await api.getVouchers(
				filterStatus === 'All' ? undefined : filterStatus
			);
			if (response.success && response.data) {
				vouchers = response.data;
			}
		} catch (err) {
			console.error('Failed to load vouchers:', err);
		} finally {
			loading = false;
		}
	}
	
	function openAddModal() {
		editMode = false;
		formData = {
			id: 'V' + String(Date.now()).slice(-6),
			code: '',
			name: '',
			description: '',
			type: 'percentage',
			discount_value: 0,
			points_cost: 0,
			stock: 0,
			start_date: new Date().toISOString().split('T')[0],
			end_date: '',
			status: 'Active'
		};
		showModal = true;
	}
	
	function openEditModal(voucher: any) {
		editMode = true;
		formData = {
			id: voucher.id,
			code: voucher.code,
			name: voucher.name,
			description: voucher.description,
			type: voucher.type,
			discount_value: voucher.discount_value,
			points_cost: voucher.points_cost,
			stock: voucher.stock,
			start_date: voucher.start_date,
			end_date: voucher.end_date,
			status: voucher.status
		};
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
	}
	
	async function handleSubmit() {
		loading = true;
		try {
			if (editMode) {
				await api.updateVoucher(formData.id, formData);
			} else {
				await api.createVoucher(formData);
			}
			await loadVouchers();
			closeModal();
		} catch (err) {
			alert('Gagal menyimpan voucher!');
			console.error(err);
		} finally {
			loading = false;
		}
	}
	
	async function handleDelete(id: string) {
		if (confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
			loading = true;
			try {
				await api.deleteVoucher(id);
				await loadVouchers();
			} catch (err) {
				alert('Gagal menghapus voucher!');
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
	
	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
	
	function getDiscountDisplay(voucher: any) {
		const type = voucher.type || voucher.discount_type;
		const value = voucher.discount_value;
		if (type === 'percentage') {
			return `${value}%`;
		} else {
			return formatCurrency(value);
		}
	}
	
	$: activeVouchers = vouchers.filter(v => v.status === 'Active').length;
	$: totalStock = vouchers.reduce((sum, v) => sum + v.stock, 0);
</script>

<svelte:head>
	<title>Voucher Management - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>🎫 Voucher Management</h1>
		<button class="btn btn-primary" on:click={openAddModal}>
			➕ Tambah Voucher Baru
		</button>
	</div>
	
	<!-- Stats -->
	<div class="grid grid-3">
		<div class="stat-card" style="border-left-color: #10b981;">
			<h3>Voucher Aktif</h3>
			<div class="value">{activeVouchers}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #3b82f6;">
			<h3>Total Voucher</h3>
			<div class="value">{vouchers.length}</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #f59e0b;">
			<h3>Total Stok</h3>
			<div class="value">{totalStock}</div>
		</div>
	</div>
	
	<!-- Search and Filter -->
	<div class="card">
		<div class="filter-section">
			<div class="search-box">
				<input 
					type="text" 
					placeholder="🔍 Cari nama atau kode voucher..." 
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
					class="btn btn-success" 
					class:active={filterStatus === 'Active'}
					on:click={() => filterStatus = 'Active'}
				>
					Aktif
				</button>
				<button 
					class="btn btn-danger" 
					class:active={filterStatus === 'Inactive'}
					on:click={() => filterStatus = 'Inactive'}
				>
					Tidak Aktif
				</button>
				<button 
					class="btn" 
					style="background: #6b7280; color: white;"
					class:active={filterStatus === 'Expired'}
					on:click={() => filterStatus = 'Expired'}
				>
					Kadaluarsa
				</button>
			</div>
		</div>
	</div>
	
	<!-- Vouchers Grid -->
	<div class="vouchers-grid">
		{#each filteredVouchers as voucher}
			<div class="voucher-card">
				<div class="voucher-header">
					<div class="voucher-badge">
						<span class="badge badge-{voucher.status === 'Active' ? 'success' : voucher.status === 'Expired' ? 'danger' : 'warning'}">
							{voucher.status}
						</span>
					</div>
					<div class="voucher-actions">
						<button class="btn-icon btn-primary" on:click={() => openEditModal(voucher)} title="Edit">
							✏️
						</button>
						<button class="btn-icon btn-danger" on:click={() => handleDelete(voucher.id)} title="Hapus">
							🗑️
						</button>
					</div>
				</div>
				
				<div class="voucher-body">
					<div class="voucher-code">{voucher.code}</div>
					<h3 class="voucher-name">{voucher.name}</h3>
					<p class="voucher-desc">{voucher.description}</p>
					
					<div class="voucher-info">
						<div class="info-item">
							<span class="info-label">Diskon:</span>
							<span class="info-value discount-value">{getDiscountDisplay(voucher)}</span>
						</div>
						
						<div class="info-item">
							<span class="info-label">Biaya Poin:</span>
							<span class="info-value points-value">{voucher.points_cost} poin</span>
						</div>
						
						<div class="info-item">
							<span class="info-label">Stok:</span>
							<span class="info-value">{voucher.stock}</span>
						</div>
						
						<div class="info-item">
							<span class="info-label">Berlaku:</span>
							<span class="info-value">{formatDate(voucher.start_date || voucher.valid_from)} - {formatDate(voucher.end_date || voucher.valid_to)}</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	
	{#if filteredVouchers.length === 0}
		<div class="card">
			<div class="empty-state">
				<p>Tidak ada voucher yang ditemukan.</p>
			</div>
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{editMode ? 'Edit Voucher' : 'Tambah Voucher Baru'}</h2>
				<button class="close-btn" on:click={closeModal}>&times;</button>
			</div>
			
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-group">
					<label>ID Voucher</label>
					<input type="text" bind:value={formData.id} disabled />
				</div>
				
				<div class="form-group">
					<label>Kode Voucher *</label>
					<input type="text" bind:value={formData.code} required placeholder="Contoh: DISKON20" />
				</div>
				
				<div class="form-group">
					<label>Nama Voucher *</label>
					<input type="text" bind:value={formData.name} required placeholder="Contoh: Diskon 20%" />
				</div>
				
				<div class="form-group">
					<label>Deskripsi</label>
					<textarea bind:value={formData.description} rows="2" placeholder="Deskripsi voucher"></textarea>
				</div>
				
				<div class="form-group">
					<label>Tipe Diskon *</label>
					<select bind:value={formData.type} required>
						<option value="percentage">Persentase (%)</option>
						<option value="fixed">Nominal Tetap (Rp)</option>
					</select>
				</div>
				
				<div class="form-group">
					<label>Nilai Diskon *</label>
					<input 
						type="number" 
						bind:value={formData.discount_value} 
						required 
						min="0"
						placeholder={formData.type === 'percentage' ? 'Contoh: 20' : 'Contoh: 50000'}
					/>
					<small style="color: #6b7280;">
						{formData.type === 'percentage' ? 'Masukkan angka tanpa simbol %' : 'Masukkan nominal dalam Rupiah'}
					</small>
				</div>
				
				<div class="form-group">
					<label>Biaya Poin *</label>
					<input type="number" bind:value={formData.points_cost} required min="0" />
				</div>
				
				<div class="form-group">
					<label>Stok *</label>
					<input type="number" bind:value={formData.stock} required min="0" />
				</div>
				
				<div class="form-group">
					<label>Berlaku Dari *</label>
					<input type="date" bind:value={formData.start_date} required />
				</div>
				
				<div class="form-group">
					<label>Berlaku Sampai *</label>
					<input type="date" bind:value={formData.end_date} required />
				</div>
				
				<div class="form-group">
					<label>Status</label>
					<select bind:value={formData.status}>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
						<option value="Expired">Expired</option>
					</select>
				</div>
				
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" on:click={closeModal}>
						Batal
					</button>
					<button type="submit" class="btn btn-primary">
						{editMode ? 'Update' : 'Simpan'}
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
	
	.vouchers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}
	
	.voucher-card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}
	
	.voucher-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}
	
	.voucher-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.voucher-actions {
		display: flex;
		gap: 8px;
	}
	
	.voucher-body {
		padding: 20px;
	}
	
	.voucher-code {
		display: inline-block;
		background: #f3f4f6;
		padding: 6px 12px;
		border-radius: 6px;
		font-family: 'Courier New', monospace;
		font-weight: 700;
		font-size: 14px;
		color: #1f2937;
		margin-bottom: 10px;
	}
	
	.voucher-name {
		font-size: 20px;
		font-weight: 700;
		color: var(--dark-color);
		margin-bottom: 8px;
	}
	
	.voucher-desc {
		color: #6b7280;
		font-size: 14px;
		margin-bottom: 15px;
		line-height: 1.5;
	}
	
	.voucher-info {
		border-top: 1px solid var(--border-color);
		padding-top: 15px;
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid #f3f4f6;
	}
	
	.info-item:last-child {
		border-bottom: none;
	}
	
	.info-label {
		color: #6b7280;
		font-size: 13px;
	}
	
	.info-value {
		font-weight: 600;
		color: var(--dark-color);
		font-size: 13px;
	}
	
	.discount-value {
		color: var(--secondary-color);
		font-size: 16px;
	}
	
	.points-value {
		color: var(--primary-color);
	}
	
	.btn-icon {
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.3s ease;
	}
	
	.btn-icon.btn-primary {
		background-color: rgba(255, 255, 255, 0.3);
	}
	
	.btn-icon.btn-danger {
		background-color: rgba(255, 255, 255, 0.3);
	}
	
	.btn-icon:hover {
		background-color: rgba(255, 255, 255, 0.5);
		transform: scale(1.1);
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
		
		.vouchers-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
