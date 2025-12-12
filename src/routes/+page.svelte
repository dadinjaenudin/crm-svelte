<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/services/api';
	
	let stats = {
		totalMembers: 0,
		activeMembers: 0,
		totalPoints: 0,
		totalVouchers: 0,
		totalRedemptions: 0,
		monthlyNewMembers: 0
	};
	
	let recentTransactions: any[] = [];
	let topMembers: any[] = [];
	let loading = false;
	
	onMount(async () => {
		loading = true;
		try {
			// Load all stats
			const [memberStats, pointStats, voucherStats, redeemStats] = await Promise.all([
				api.getMemberStats(),
				api.getPointStats(),
				api.getVoucherStats(),
				api.getRedeemStats()
			]);
			
			if (memberStats.success && memberStats.data) {
				stats.totalMembers = memberStats.data.totalMembers || 0;
				stats.activeMembers = memberStats.data.activeMembers || 0;
				stats.totalPoints = memberStats.data.totalPoints || 0;
			}
			
			if (pointStats.success && pointStats.data) {
				// Additional point stats if needed
			}
			
			if (voucherStats.success && voucherStats.data) {
				stats.totalVouchers = voucherStats.data.activeVouchers || 0;
			}
			
			if (redeemStats.success && redeemStats.data) {
				stats.totalRedemptions = redeemStats.data.totalRedeems || 0;
			}
			
			// Load recent transactions
			const pointsResponse = await api.getPointTransactions();
			if (pointsResponse.success && pointsResponse.data) {
				recentTransactions = pointsResponse.data
					.slice()
					.sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
					.slice(0, 5)
					.map((t: any) => ({
						memberName: t.member_name || 'Unknown',
						description: t.description || '',
						date: t.transaction_date,
						points: t.points
					}));
			}
			
			// Load top members
			const membersResponse = await api.getMembers('Active');
			if (membersResponse.success && membersResponse.data) {
				topMembers = membersResponse.data
					.slice()
					.sort((a: any, b: any) => b.total_points - a.total_points)
					.slice(0, 5)
					.map((m: any) => ({
						name: m.name,
						email: m.email,
						tierLevel: m.tier_level,
						totalPoints: m.total_points
					}));
			}
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
		} finally {
			loading = false;
		}
	});
	
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
	
	function formatNumber(num: number) {
		return new Intl.NumberFormat('id-ID').format(num);
	}
</script>

<svelte:head>
	<title>Dashboard - CRM System</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>📊 Dashboard</h1>
		<p>Selamat datang di sistem Customer Relationship Management</p>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-4">
		<div class="stat-card" style="border-left-color: #3b82f6;">
			<h3>Total Member</h3>
			<div class="value">{stats.totalMembers}</div>
			<div class="stat-footer">
				<span class="badge badge-info">{stats.activeMembers} Aktif</span>
			</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #10b981;">
			<h3>Total Poin</h3>
			<div class="value">{formatNumber(stats.totalPoints)}</div>
			<div class="stat-footer">
				<span class="stat-label">Poin tersedia</span>
			</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #f59e0b;">
			<h3>Voucher Aktif</h3>
			<div class="value">{stats.totalVouchers}</div>
			<div class="stat-footer">
				<span class="stat-label">Tersedia</span>
			</div>
		</div>
		
		<div class="stat-card" style="border-left-color: #ef4444;">
			<h3>Total Redeem</h3>
			<div class="value">{stats.totalRedemptions}</div>
			<div class="stat-footer">
				<span class="stat-label">Transaksi</span>
			</div>
		</div>
	</div>
	
	<!-- Content Grid -->
	<div class="grid grid-2" style="margin-top: 30px;">
		<!-- Recent Transactions -->
		<div class="card">
			<h2>📋 Transaksi Poin Terbaru</h2>
			<div class="transactions-list">
				{#each recentTransactions as transaction}
					<div class="transaction-item">
						<div class="transaction-info">
							<strong>{transaction.memberName}</strong>
							<span class="transaction-desc">{transaction.description}</span>
							<span class="transaction-date">{formatDate(transaction.date)}</span>
						</div>
						<div class="transaction-points" class:positive={transaction.points > 0} class:negative={transaction.points < 0}>
							{transaction.points > 0 ? '+' : ''}{formatNumber(transaction.points)}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Top Members -->
		<div class="card">
			<h2>🏆 Top Member Berdasarkan Poin</h2>
			<div class="members-list">
				{#each topMembers as member, index}
					<div class="member-item">
						<div class="member-rank">#{index + 1}</div>
						<div class="member-info">
							<strong>{member.name}</strong>
							<span class="member-email">{member.email}</span>
						</div>
						<div class="member-points">
							<span class="badge badge-{member.tierLevel === 'Platinum' ? 'info' : member.tierLevel === 'Gold' ? 'warning' : 'success'}">
								{member.tierLevel}
							</span>
							<strong>{formatNumber(member.totalPoints)} poin</strong>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Quick Actions -->
	<div class="card" style="margin-top: 20px;">
		<h2>⚡ Quick Actions</h2>
		<div class="quick-actions">
			<a href="/members" class="action-btn">
				<span class="action-icon">👥</span>
				<span class="action-label">Kelola Member</span>
			</a>
			<a href="/points" class="action-btn">
				<span class="action-icon">⭐</span>
				<span class="action-label">Kelola Poin</span>
			</a>
			<a href="/vouchers" class="action-btn">
				<span class="action-icon">🎫</span>
				<span class="action-label">Kelola Voucher</span>
			</a>
			<a href="/redeem" class="action-btn">
				<span class="action-icon">🎁</span>
				<span class="action-label">Proses Redeem</span>
			</a>
			<a href="/reports" class="action-btn">
				<span class="action-icon">📈</span>
				<span class="action-label">Lihat Report</span>
			</a>
		</div>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: 30px;
	}
	
	.page-header h1 {
		font-size: 32px;
		color: var(--dark-color);
		margin-bottom: 5px;
	}
	
	.page-header p {
		color: #6b7280;
		font-size: 16px;
	}
	
	.stat-footer {
		margin-top: 12px;
	}
	
	.stat-label {
		color: #6b7280;
		font-size: 14px;
	}
	
	.transactions-list,
	.members-list {
		margin-top: 20px;
	}
	
	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid var(--border-color);
	}
	
	.transaction-item:last-child {
		border-bottom: none;
	}
	
	.transaction-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	
	.transaction-desc {
		color: #6b7280;
		font-size: 14px;
	}
	
	.transaction-date {
		color: #9ca3af;
		font-size: 12px;
	}
	
	.transaction-points {
		font-size: 18px;
		font-weight: 700;
	}
	
	.transaction-points.positive {
		color: var(--secondary-color);
	}
	
	.transaction-points.negative {
		color: var(--danger-color);
	}
	
	.member-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		border-bottom: 1px solid var(--border-color);
	}
	
	.member-item:last-child {
		border-bottom: none;
	}
	
	.member-rank {
		font-size: 24px;
		font-weight: 700;
		color: #d1d5db;
		min-width: 40px;
	}
	
	.member-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	
	.member-email {
		color: #6b7280;
		font-size: 14px;
	}
	
	.member-points {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
	}
	
	.quick-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 15px;
		margin-top: 20px;
	}
	
	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 25px 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 12px;
		transition: all 0.3s ease;
	}
	
	.action-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
	}
	
	.action-icon {
		font-size: 36px;
	}
	
	.action-label {
		font-weight: 600;
		font-size: 14px;
	}
</style>
