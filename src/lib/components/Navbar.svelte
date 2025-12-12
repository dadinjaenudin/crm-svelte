<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import api from '$lib/services/api';
	
	let menuOpen = false;
	let userMenuOpen = false;
	
	function toggleMenu() {
		menuOpen = !menuOpen;
	}
	
	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}
	
	async function handleLogout() {
		try {
			await api.logout();
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			auth.logout();
			goto('/login');
		}
	}
	
	// Close user menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu-container')) {
			userMenuOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="navbar">
	<div class="nav-container">
		<div class="nav-brand">
			<h1>🎯 CRM System</h1>
		</div>
		
		<button class="menu-toggle" on:click={toggleMenu}>
			☰
		</button>
		
		<div class="nav-links" class:open={menuOpen}>
			<a href="/" class:active={$page.url.pathname === '/'}>
				📊 Dashboard
			</a>
			<a href="/members" class:active={$page.url.pathname === '/members'}>
				👥 Member
			</a>
			<a href="/points" class:active={$page.url.pathname === '/points'}>
				⭐ Poin
			</a>
			<a href="/vouchers" class:active={$page.url.pathname === '/vouchers'}>
				🎫 Voucher
			</a>
			<a href="/redeem" class:active={$page.url.pathname === '/redeem'}>
				🎁 Redeem
			</a>
			<a href="/reports" class:active={$page.url.pathname === '/reports'}>
				📈 Report
			</a>
		</div>
		
		{#if $auth.isAuthenticated && $auth.user}
			<div class="user-menu-container">
				<button class="user-button" on:click={toggleUserMenu}>
					<span class="user-avatar">{$auth.user.username.charAt(0).toUpperCase()}</span>
					<span class="user-name">{$auth.user.full_name || $auth.user.username}</span>
					<span class="user-role-badge">{$auth.user.role}</span>
				</button>
				
				{#if userMenuOpen}
					<div class="user-dropdown">
						<div class="user-info">
							<strong>{$auth.user.full_name || $auth.user.username}</strong>
							<span>{$auth.user.email}</span>
							<span class="role-tag">{$auth.user.role}</span>
						</div>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item" on:click={handleLogout}>
							🚪 Logout
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.nav-brand h1 {
		color: white;
		font-size: 24px;
		margin: 15px 0;
	}
	
	.menu-toggle {
		display: none;
		background: none;
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
	}
	
	.nav-links {
		display: flex;
		gap: 10px;
	}
	
	.nav-links a {
		color: white;
		text-decoration: none;
		padding: 12px 20px;
		border-radius: 6px;
		transition: all 0.3s ease;
		font-weight: 500;
	}
	
	.nav-links a:hover {
		background: rgba(255, 255, 255, 0.2);
	}
	
	.nav-links a.active {
		background: rgba(255, 255, 255, 0.3);
		font-weight: 600;
	}
	
	.user-menu-container {
		position: relative;
		margin-left: 20px;
	}
	
	.user-button {
		display: flex;
		align-items: center;
		gap: 10px;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		padding: 8px 16px;
		border-radius: 25px;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.user-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}
	
	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: white;
		color: #667eea;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
	}
	
	.user-name {
		font-weight: 500;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.user-role-badge {
		font-size: 11px;
		padding: 3px 8px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 10px;
		text-transform: uppercase;
		font-weight: 600;
	}
	
	.user-dropdown {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		min-width: 250px;
		z-index: 1000;
	}
	
	.user-info {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	
	.user-info strong {
		color: var(--dark-color);
		font-size: 16px;
	}
	
	.user-info span {
		color: #6b7280;
		font-size: 14px;
	}
	
	.user-info .role-tag {
		display: inline-block;
		background: #e0e7ff;
		color: #4f46e5;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		margin-top: 6px;
		width: fit-content;
	}
	
	.dropdown-divider {
		height: 1px;
		background: #e5e7eb;
	}
	
	.dropdown-item {
		width: 100%;
		text-align: left;
		padding: 12px 20px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--dark-color);
		font-size: 14px;
		font-weight: 500;
		transition: background 0.2s ease;
	}
	
	.dropdown-item:hover {
		background: #f3f4f6;
	}
	
	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}
		
		.nav-links {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			flex-direction: column;
			gap: 0;
			display: none;
			padding: 10px 0;
		}
		
		.nav-links.open {
			display: flex;
		}
		
		.nav-links a {
			padding: 15px 20px;
			border-radius: 0;
		}
		
		.user-name {
			display: none;
		}
		
		.user-role-badge {
			display: none;
		}
	}
</style>
