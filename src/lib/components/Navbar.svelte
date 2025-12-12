<script lang="ts">
	import { page } from '$app/stores';
	
	let menuOpen = false;
	
	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

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
	}
</style>
