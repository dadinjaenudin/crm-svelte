<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import api from '$lib/services/api';
	import { onMount } from 'svelte';
	
	let username = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;
	
	// Redirect if already logged in
	onMount(() => {
		let isAuthenticated = false;
		auth.subscribe(state => isAuthenticated = state.isAuthenticated)();
		
		if (isAuthenticated) {
			goto('/');
		}
	});
	
	async function handleLogin(event: Event) {
		event.preventDefault();
		error = '';
		loading = true;
		
		try {
			const response = await api.login(username, password);
			
			if (response.success && response.data) {
				const { user, accessToken, refreshToken } = response.data;
				
				// Set token getter for API service
				api.setTokenGetter(() => accessToken);
				
				// Update auth store
				auth.login(user, accessToken, refreshToken);
				
				// Redirect to dashboard
				goto('/');
			} else {
				error = response.message || 'Login failed';
			}
		} catch (err: any) {
			error = err.message || 'Login failed. Please check your credentials.';
		} finally {
			loading = false;
		}
	}
	
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Login - CRM System</title>
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<h1>🔐 CRM System</h1>
			<p>Welcome back! Please login to your account.</p>
		</div>
		
		{#if error}
			<div class="alert alert-error">
				⚠️ {error}
			</div>
		{/if}
		
		<form on:submit={handleLogin}>
			<div class="form-group">
				<label for="username">Username or Email</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Enter your username or email"
					required
					disabled={loading}
					autocomplete="username"
				/>
			</div>
			
			<div class="form-group">
				<label for="password">Password</label>
				<div class="password-input-wrapper">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Enter your password"
						required
						disabled={loading}
						autocomplete="current-password"
					/>
					<button
						type="button"
						class="toggle-password"
						on:click={togglePasswordVisibility}
						tabindex="-1"
					>
						{showPassword ? '👁️' : '👁️‍🗨️'}
					</button>
				</div>
			</div>
			
			<button type="submit" class="btn btn-primary btn-block" disabled={loading}>
				{#if loading}
					⏳ Logging in...
				{:else}
					🚀 Login
				{/if}
			</button>
		</form>
		
		<div class="login-footer">
			<div class="demo-credentials">
				<h4>📝 Demo Credentials:</h4>
				<div class="credentials-grid">
					<div class="credential-item">
						<strong>Admin:</strong>
						<span>username: <code>admin</code> / password: <code>admin123</code></span>
					</div>
					<div class="credential-item">
						<strong>Staff:</strong>
						<span>username: <code>staff1</code> / password: <code>staff123</code></span>
					</div>
					<div class="credential-item">
						<strong>Member:</strong>
						<span>username: <code>member1</code> / password: <code>member123</code></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}
	
	.login-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		padding: 40px;
		max-width: 450px;
		width: 100%;
	}
	
	.login-header {
		text-align: center;
		margin-bottom: 30px;
	}
	
	.login-header h1 {
		font-size: 32px;
		color: var(--dark-color);
		margin-bottom: 10px;
	}
	
	.login-header p {
		color: #6b7280;
		font-size: 14px;
	}
	
	.form-group {
		margin-bottom: 20px;
	}
	
	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: var(--dark-color);
	}
	
	.form-group input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		transition: all 0.3s ease;
	}
	
	.form-group input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.form-group input:disabled {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}
	
	.password-input-wrapper {
		position: relative;
	}
	
	.password-input-wrapper input {
		padding-right: 50px;
	}
	
	.toggle-password {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		font-size: 20px;
		cursor: pointer;
		padding: 4px;
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}
	
	.toggle-password:hover {
		opacity: 1;
	}
	
	.btn-block {
		width: 100%;
		margin-top: 10px;
		padding: 14px;
		font-size: 16px;
		font-weight: 600;
	}
	
	.alert {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 14px;
	}
	
	.alert-error {
		background-color: #fee2e2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}
	
	.login-footer {
		margin-top: 30px;
		padding-top: 30px;
		border-top: 1px solid #e5e7eb;
	}
	
	.demo-credentials {
		background: #f9fafb;
		padding: 20px;
		border-radius: 8px;
	}
	
	.demo-credentials h4 {
		margin-bottom: 15px;
		color: var(--dark-color);
		font-size: 14px;
	}
	
	.credentials-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.credential-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
	}
	
	.credential-item strong {
		color: var(--dark-color);
	}
	
	.credential-item span {
		color: #6b7280;
	}
	
	.credential-item code {
		background: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		color: var(--primary-color);
		font-size: 12px;
	}
	
	@media (max-width: 480px) {
		.login-card {
			padding: 30px 20px;
		}
		
		.login-header h1 {
			font-size: 28px;
		}
	}
</style>
