<script lang="ts">
	import { members, addMember, updateMember, deleteMember } from '$lib/stores/data';
	import type { Member } from '$lib/types';
	
	let showModal = false;
	let editMode = false;
	let searchQuery = '';
	let filterStatus: 'All' | 'Active' | 'Inactive' = 'All';
	
	let formData: Member = {
		id: '',
		name: '',
		email: '',
		phone: '',
		address: '',
		joinDate: new Date().toISOString().split('T')[0],
		totalPoints: 0,
		tierLevel: 'Bronze',
		status: 'Active'
	};
	
	$: filteredMembers = $members.filter(member => {
		const matchSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		                   member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
		                   member.phone.includes(searchQuery);
		const matchStatus = filterStatus === 'All' || member.status === filterStatus;
		return matchSearch && matchStatus;
	});
	
	function openAddModal() {
		editMode = false;
		formData = {
			id: 'M' + String(Date.now()).slice(-6),
			name: '',
			email: '',
			phone: '',
			address: '',
			joinDate: new Date().toISOString().split('T')[0],
			totalPoints: 0,
			tierLevel: 'Bronze',
			status: 'Active'
		};
		showModal = true;
	}
	
	function openEditModal(member: Member) {
		editMode = true;
		formData = { ...member };
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
	}
	
	function handleSubmit() {
		if (editMode) {
			updateMember(formData.id, formData);
		} else {
			addMember(formData);
		}
		closeModal();
	}
	
	function handleDelete(id: string) {
		if (confirm('Apakah Anda yakin ingin menghapus member ini?')) {
			deleteMember(id);
		}
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
	
	function getTierColor(tier: string) {
		switch(tier) {
			case 'Platinum': return 'info';
			case 'Gold': return 'warning';
			case 'Silver': return 'secondary';
			default: return 'success';
		}
	}
</script>

<svelte:head>
	<title>Member Management - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>👥 Member Management</h1>
		<button class="btn btn-primary" on:click={openAddModal}>
			➕ Tambah Member Baru
		</button>
	</div>
	
	<!-- Search and Filter -->
	<div class="card">
		<div class="filter-section">
			<div class="search-box">
				<input 
					type="text" 
					placeholder="🔍 Cari nama, email, atau telepon..." 
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
					class="btn" 
					style="background: #6b7280; color: white;"
					class:active={filterStatus === 'Inactive'}
					on:click={() => filterStatus = 'Inactive'}
				>
					Tidak Aktif
				</button>
			</div>
		</div>
	</div>
	
	<!-- Members Table -->
	<div class="card">
		<div class="table-responsive">
			<table class="table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nama</th>
						<th>Email</th>
						<th>Telepon</th>
						<th>Tanggal Gabung</th>
						<th>Total Poin</th>
						<th>Tier</th>
						<th>Status</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredMembers as member}
						<tr>
							<td>{member.id}</td>
							<td><strong>{member.name}</strong></td>
							<td>{member.email}</td>
							<td>{member.phone}</td>
							<td>{formatDate(member.joinDate)}</td>
							<td><strong>{member.totalPoints.toLocaleString('id-ID')}</strong></td>
							<td>
								<span class="badge badge-{getTierColor(member.tierLevel)}">
									{member.tierLevel}
								</span>
							</td>
							<td>
								<span class="badge badge-{member.status === 'Active' ? 'success' : 'danger'}">
									{member.status}
								</span>
							</td>
							<td>
								<div class="action-buttons">
									<button class="btn-icon btn-primary" on:click={() => openEditModal(member)} title="Edit">
										✏️
									</button>
									<button class="btn-icon btn-danger" on:click={() => handleDelete(member.id)} title="Hapus">
										🗑️
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		{#if filteredMembers.length === 0}
			<div class="empty-state">
				<p>Tidak ada member yang ditemukan.</p>
			</div>
		{/if}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{editMode ? 'Edit Member' : 'Tambah Member Baru'}</h2>
				<button class="close-btn" on:click={closeModal}>&times;</button>
			</div>
			
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-group">
					<label>ID Member</label>
					<input type="text" bind:value={formData.id} disabled />
				</div>
				
				<div class="form-group">
					<label>Nama Lengkap *</label>
					<input type="text" bind:value={formData.name} required />
				</div>
				
				<div class="form-group">
					<label>Email *</label>
					<input type="email" bind:value={formData.email} required />
				</div>
				
				<div class="form-group">
					<label>Nomor Telepon *</label>
					<input type="tel" bind:value={formData.phone} required />
				</div>
				
				<div class="form-group">
					<label>Alamat</label>
					<textarea bind:value={formData.address} rows="3"></textarea>
				</div>
				
				<div class="form-group">
					<label>Tanggal Bergabung</label>
					<input type="date" bind:value={formData.joinDate} required />
				</div>
				
				<div class="form-group">
					<label>Tier Level</label>
					<select bind:value={formData.tierLevel}>
						<option value="Bronze">Bronze</option>
						<option value="Silver">Silver</option>
						<option value="Gold">Gold</option>
						<option value="Platinum">Platinum</option>
					</select>
				</div>
				
				<div class="form-group">
					<label>Status</label>
					<select bind:value={formData.status}>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
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
	
	.btn-icon {
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.3s ease;
	}
	
	.btn-icon.btn-primary {
		background-color: var(--primary-color);
	}
	
	.btn-icon.btn-danger {
		background-color: var(--danger-color);
	}
	
	.btn-icon:hover {
		opacity: 0.8;
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
	}
</style>
