<script lang="ts">
	import { members, pointTransactions, vouchers, redeemTransactions } from '$lib/stores/data';
	import { onMount } from 'svelte';
	
	let reportType: 'member' | 'points' | 'voucher' | 'redeem' = 'member';
	let dateFrom = '';
	let dateTo = '';
	
	let memberStats = {
		total: 0,
		active: 0,
		inactive: 0,
		byTier: {
			bronze: 0,
			silver: 0,
			gold: 0,
			platinum: 0
		},
		totalPoints: 0,
		avgPoints: 0
	};
	
	let pointsStats = {
		totalEarned: 0,
		totalRedeemed: 0,
		totalExpired: 0,
		totalAdjustment: 0,
		netPoints: 0,
		transactions: 0
	};
	
	let voucherStats = {
		total: 0,
		active: 0,
		inactive: 0,
		expired: 0,
		totalStock: 0,
		totalRedeemed: 0
	};
	
	let redeemStats = {
		total: 0,
		pending: 0,
		completed: 0,
		used: 0,
		cancelled: 0,
		totalPointsUsed: 0
	};
	
	let topMembers: any[] = [];
	let topVouchers: any[] = [];
	let recentTransactions: any[] = [];
	
	onMount(() => {
		calculateStats();
	});
	
	function calculateStats() {
		// Member Stats
		memberStats.total = $members.length;
		memberStats.active = $members.filter(m => m.status === 'Active').length;
		memberStats.inactive = $members.filter(m => m.status === 'Inactive').length;
		
		$members.forEach(member => {
			memberStats.totalPoints += member.totalPoints;
			
			switch(member.tierLevel.toLowerCase()) {
				case 'bronze': memberStats.byTier.bronze++; break;
				case 'silver': memberStats.byTier.silver++; break;
				case 'gold': memberStats.byTier.gold++; break;
				case 'platinum': memberStats.byTier.platinum++; break;
			}
		});
		
		memberStats.avgPoints = memberStats.total > 0 ? Math.round(memberStats.totalPoints / memberStats.total) : 0;
		
		// Points Stats
		$pointTransactions.forEach(transaction => {
			pointsStats.transactions++;
			
			if (transaction.points > 0) {
				pointsStats.totalEarned += transaction.points;
			} else {
				if (transaction.type === 'redeem') {
					pointsStats.totalRedeemed += Math.abs(transaction.points);
				} else if (transaction.type === 'expire') {
					pointsStats.totalExpired += Math.abs(transaction.points);
				}
			}
			
			if (transaction.type === 'adjustment') {
				pointsStats.totalAdjustment += transaction.points;
			}
		});
		
		pointsStats.netPoints = pointsStats.totalEarned - pointsStats.totalRedeemed - pointsStats.totalExpired;
		
		// Voucher Stats
		voucherStats.total = $vouchers.length;
		voucherStats.active = $vouchers.filter(v => v.status === 'Active').length;
		voucherStats.inactive = $vouchers.filter(v => v.status === 'Inactive').length;
		voucherStats.expired = $vouchers.filter(v => v.status === 'Expired').length;
		voucherStats.totalStock = $vouchers.reduce((sum, v) => sum + v.stock, 0);
		voucherStats.totalRedeemed = $redeemTransactions.length;
		
		// Redeem Stats
		redeemStats.total = $redeemTransactions.length;
		redeemStats.pending = $redeemTransactions.filter(r => r.status === 'Pending').length;
		redeemStats.completed = $redeemTransactions.filter(r => r.status === 'Completed').length;
		redeemStats.used = $redeemTransactions.filter(r => r.status === 'Used').length;
		redeemStats.cancelled = $redeemTransactions.filter(r => r.status === 'Cancelled').length;
		redeemStats.totalPointsUsed = $redeemTransactions.reduce((sum, r) => sum + r.pointsUsed, 0);
		
		// Top Members
		topMembers = $members
			.slice()
			.sort((a, b) => b.totalPoints - a.totalPoints)
			.slice(0, 10);
		
		// Top Vouchers (most redeemed)
		const voucherRedeemCount: { [key: string]: { voucher: any, count: number } } = {};
		
		$redeemTransactions.forEach(redeem => {
			if (!voucherRedeemCount[redeem.voucherId]) {
				const voucher = $vouchers.find(v => v.id === redeem.voucherId);
				voucherRedeemCount[redeem.voucherId] = {
					voucher: voucher || { name: redeem.voucherName, code: 'N/A' },
					count: 0
				};
			}
			voucherRedeemCount[redeem.voucherId].count++;
		});
		
		topVouchers = Object.values(voucherRedeemCount)
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
		
		// Recent Transactions
		recentTransactions = $pointTransactions
			.slice()
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 10);
	}
	
	function formatNumber(num: number) {
		return new Intl.NumberFormat('id-ID').format(num);
	}
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
	
	function exportReport() {
		alert('Fitur export report akan segera tersedia!');
	}
	
	function printReport() {
		window.print();
	}
</script>

<svelte:head>
	<title>Reports - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>📈 Reports & Analytics</h1>
		<div class="header-actions">
			<button class="btn btn-secondary" on:click={printReport}>
				🖨️ Print
			</button>
			<button class="btn btn-success" on:click={exportReport}>
				📥 Export
			</button>
		</div>
	</div>
	
	<!-- Report Type Selector -->
	<div class="card">
		<div class="report-tabs">
			<button 
				class="tab-btn" 
				class:active={reportType === 'member'}
				on:click={() => reportType = 'member'}
			>
				👥 Member Report
			</button>
			<button 
				class="tab-btn" 
				class:active={reportType === 'points'}
				on:click={() => reportType = 'points'}
			>
				⭐ Points Report
			</button>
			<button 
				class="tab-btn" 
				class:active={reportType === 'voucher'}
				on:click={() => reportType = 'voucher'}
			>
				🎫 Voucher Report
			</button>
			<button 
				class="tab-btn" 
				class:active={reportType === 'redeem'}
				on:click={() => reportType = 'redeem'}
			>
				🎁 Redeem Report
			</button>
		</div>
	</div>
	
	<!-- Member Report -->
	{#if reportType === 'member'}
		<div class="grid grid-4">
			<div class="stat-card" style="border-left-color: #3b82f6;">
				<h3>Total Member</h3>
				<div class="value">{memberStats.total}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #10b981;">
				<h3>Member Aktif</h3>
				<div class="value">{memberStats.active}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #f59e0b;">
				<h3>Total Poin</h3>
				<div class="value">{formatNumber(memberStats.totalPoints)}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #ef4444;">
				<h3>Rata-rata Poin</h3>
				<div class="value">{formatNumber(memberStats.avgPoints)}</div>
			</div>
		</div>
		
		<div class="grid grid-2">
			<!-- Member by Tier -->
			<div class="card">
				<h2>Distribusi Member Berdasarkan Tier</h2>
				<div class="chart-container">
					<div class="bar-chart">
						<div class="bar-item">
							<div class="bar-label">Bronze</div>
							<div class="bar-wrapper">
								<div class="bar bar-bronze" style="width: {(memberStats.byTier.bronze / memberStats.total) * 100}%"></div>
								<span class="bar-value">{memberStats.byTier.bronze}</span>
							</div>
						</div>
						
						<div class="bar-item">
							<div class="bar-label">Silver</div>
							<div class="bar-wrapper">
								<div class="bar bar-silver" style="width: {(memberStats.byTier.silver / memberStats.total) * 100}%"></div>
								<span class="bar-value">{memberStats.byTier.silver}</span>
							</div>
						</div>
						
						<div class="bar-item">
							<div class="bar-label">Gold</div>
							<div class="bar-wrapper">
								<div class="bar bar-gold" style="width: {(memberStats.byTier.gold / memberStats.total) * 100}%"></div>
								<span class="bar-value">{memberStats.byTier.gold}</span>
							</div>
						</div>
						
						<div class="bar-item">
							<div class="bar-label">Platinum</div>
							<div class="bar-wrapper">
								<div class="bar bar-platinum" style="width: {(memberStats.byTier.platinum / memberStats.total) * 100}%"></div>
								<span class="bar-value">{memberStats.byTier.platinum}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Top Members -->
			<div class="card">
				<h2>Top 10 Member (Berdasarkan Poin)</h2>
				<div class="ranking-list">
					{#each topMembers as member, index}
						<div class="ranking-item">
							<div class="rank">#{index + 1}</div>
							<div class="rank-info">
								<strong>{member.name}</strong>
								<span class="rank-detail">{member.email}</span>
							</div>
							<div class="rank-value">
								<strong>{formatNumber(member.totalPoints)}</strong>
								<span class="badge badge-success">{member.tierLevel}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Points Report -->
	{#if reportType === 'points'}
		<div class="grid grid-4">
			<div class="stat-card" style="border-left-color: #10b981;">
				<h3>Total Poin Diterbitkan</h3>
				<div class="value">{formatNumber(pointsStats.totalEarned)}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #f59e0b;">
				<h3>Total Poin Diredeem</h3>
				<div class="value">{formatNumber(pointsStats.totalRedeemed)}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #ef4444;">
				<h3>Total Poin Kadaluarsa</h3>
				<div class="value">{formatNumber(pointsStats.totalExpired)}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #3b82f6;">
				<h3>Poin Bersih</h3>
				<div class="value">{formatNumber(pointsStats.netPoints)}</div>
			</div>
		</div>
		
		<div class="card">
			<h2>10 Transaksi Poin Terbaru</h2>
			<div class="table-responsive">
				<table class="table">
					<thead>
						<tr>
							<th>Tanggal</th>
							<th>Member</th>
							<th>Tipe</th>
							<th>Poin</th>
							<th>Deskripsi</th>
						</tr>
					</thead>
					<tbody>
						{#each recentTransactions as transaction}
							<tr>
								<td>{formatDate(transaction.date)}</td>
								<td><strong>{transaction.memberName}</strong></td>
								<td>
									<span class="badge badge-{transaction.type === 'earn' ? 'success' : transaction.type === 'redeem' ? 'warning' : 'danger'}">
										{transaction.type}
									</span>
								</td>
								<td>
									<strong class:positive={transaction.points > 0} class:negative={transaction.points < 0}>
										{transaction.points > 0 ? '+' : ''}{formatNumber(transaction.points)}
									</strong>
								</td>
								<td>{transaction.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
	
	<!-- Voucher Report -->
	{#if reportType === 'voucher'}
		<div class="grid grid-4">
			<div class="stat-card" style="border-left-color: #3b82f6;">
				<h3>Total Voucher</h3>
				<div class="value">{voucherStats.total}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #10b981;">
				<h3>Voucher Aktif</h3>
				<div class="value">{voucherStats.active}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #f59e0b;">
				<h3>Total Stok</h3>
				<div class="value">{voucherStats.totalStock}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #ef4444;">
				<h3>Total Diredeem</h3>
				<div class="value">{voucherStats.totalRedeemed}</div>
			</div>
		</div>
		
		<div class="card">
			<h2>Top 10 Voucher Paling Populer</h2>
			<div class="ranking-list">
				{#each topVouchers as item, index}
					<div class="ranking-item">
						<div class="rank">#{index + 1}</div>
						<div class="rank-info">
							<strong>{item.voucher.name}</strong>
							<span class="rank-detail">{item.voucher.code}</span>
						</div>
						<div class="rank-value">
							<strong>{item.count} kali diredeem</strong>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Redeem Report -->
	{#if reportType === 'redeem'}
		<div class="grid grid-4">
			<div class="stat-card" style="border-left-color: #3b82f6;">
				<h3>Total Redeem</h3>
				<div class="value">{redeemStats.total}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #10b981;">
				<h3>Completed</h3>
				<div class="value">{redeemStats.completed}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #f59e0b;">
				<h3>Terpakai</h3>
				<div class="value">{redeemStats.used}</div>
			</div>
			
			<div class="stat-card" style="border-left-color: #ef4444;">
				<h3>Total Poin Digunakan</h3>
				<div class="value">{formatNumber(redeemStats.totalPointsUsed)}</div>
			</div>
		</div>
		
		<div class="card">
			<h2>Status Distribusi Redeem</h2>
			<div class="chart-container">
				<div class="bar-chart">
					<div class="bar-item">
						<div class="bar-label">Pending</div>
						<div class="bar-wrapper">
							<div class="bar" style="width: {(redeemStats.pending / redeemStats.total) * 100}%; background: #f59e0b;"></div>
							<span class="bar-value">{redeemStats.pending}</span>
						</div>
					</div>
					
					<div class="bar-item">
						<div class="bar-label">Completed</div>
						<div class="bar-wrapper">
							<div class="bar" style="width: {(redeemStats.completed / redeemStats.total) * 100}%; background: #10b981;"></div>
							<span class="bar-value">{redeemStats.completed}</span>
						</div>
					</div>
					
					<div class="bar-item">
						<div class="bar-label">Used</div>
						<div class="bar-wrapper">
							<div class="bar" style="width: {(redeemStats.used / redeemStats.total) * 100}%; background: #3b82f6;"></div>
							<span class="bar-value">{redeemStats.used}</span>
						</div>
					</div>
					
					<div class="bar-item">
						<div class="bar-label">Cancelled</div>
						<div class="bar-wrapper">
							<div class="bar" style="width: {(redeemStats.cancelled / redeemStats.total) * 100}%; background: #ef4444;"></div>
							<span class="bar-value">{redeemStats.cancelled}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

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
	
	.header-actions {
		display: flex;
		gap: 10px;
	}
	
	.report-tabs {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	
	.tab-btn {
		padding: 12px 24px;
		border: none;
		background: #f3f4f6;
		color: #6b7280;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.3s ease;
	}
	
	.tab-btn:hover {
		background: #e5e7eb;
	}
	
	.tab-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.chart-container {
		margin-top: 20px;
	}
	
	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	
	.bar-item {
		display: flex;
		align-items: center;
		gap: 15px;
	}
	
	.bar-label {
		min-width: 80px;
		font-weight: 600;
		color: var(--dark-color);
	}
	
	.bar-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.bar {
		height: 30px;
		border-radius: 6px;
		transition: all 0.3s ease;
		min-width: 2px;
	}
	
	.bar-bronze {
		background: #cd7f32;
	}
	
	.bar-silver {
		background: #c0c0c0;
	}
	
	.bar-gold {
		background: #ffd700;
	}
	
	.bar-platinum {
		background: #e5e4e2;
	}
	
	.bar-value {
		font-weight: 700;
		color: var(--dark-color);
		min-width: 30px;
	}
	
	.ranking-list {
		margin-top: 20px;
	}
	
	.ranking-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px;
		border-bottom: 1px solid var(--border-color);
	}
	
	.ranking-item:last-child {
		border-bottom: none;
	}
	
	.rank {
		font-size: 20px;
		font-weight: 700;
		color: #d1d5db;
		min-width: 40px;
	}
	
	.rank-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	
	.rank-detail {
		font-size: 12px;
		color: #6b7280;
	}
	
	.rank-value {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
	}
	
	.positive {
		color: var(--secondary-color);
	}
	
	.negative {
		color: var(--danger-color);
	}
	
	.table-responsive {
		overflow-x: auto;
	}
	
	@media print {
		.page-header .header-actions {
			display: none;
		}
		
		.report-tabs {
			display: none;
		}
	}
	
	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}
		
		.header-actions {
			width: 100%;
		}
		
		.header-actions .btn {
			flex: 1;
		}
		
		.bar-item {
			flex-direction: column;
			align-items: stretch;
		}
		
		.bar-label {
			min-width: auto;
		}
	}
</style>
