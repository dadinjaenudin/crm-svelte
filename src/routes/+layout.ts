import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import api from '$lib/services/api';

export const ssr = false; // Disable SSR for authentication

export async function load({ url }) {
	if (browser) {
		// Get token from localStorage
		const token = localStorage.getItem('accessToken');
		
		// Set token getter for API
		if (token) {
			api.setTokenGetter(() => localStorage.getItem('accessToken'));
		}
		
		// Public routes that don't require authentication
		const publicRoutes = ['/login'];
		
		// Check if current route is public
		const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));
		
		// If not authenticated and trying to access protected route, redirect to login
		if (!token && !isPublicRoute) {
			goto('/login');
			return {};
		}
		
		// If authenticated and trying to access login page, redirect to dashboard
		if (token && isPublicRoute) {
			goto('/');
			return {};
		}
	}
	
	return {};
}
