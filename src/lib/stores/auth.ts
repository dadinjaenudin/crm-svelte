import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
	id: number;
	username: string;
	email: string;
	full_name: string;
	role: 'admin' | 'staff' | 'member';
	status: string;
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
}

// Initialize from localStorage if in browser
const getInitialState = (): AuthState => {
	if (browser) {
		const storedUser = localStorage.getItem('user');
		const storedAccessToken = localStorage.getItem('accessToken');
		const storedRefreshToken = localStorage.getItem('refreshToken');

		if (storedUser && storedAccessToken) {
			return {
				user: JSON.parse(storedUser),
				accessToken: storedAccessToken,
				refreshToken: storedRefreshToken,
				isAuthenticated: true
			};
		}
	}

	return {
		user: null,
		accessToken: null,
		refreshToken: null,
		isAuthenticated: false
	};
};

// Create auth store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(getInitialState());

	return {
		subscribe,
		
		login: (user: User, accessToken: string, refreshToken: string) => {
			if (browser) {
				localStorage.setItem('user', JSON.stringify(user));
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
			}
			
			set({
				user,
				accessToken,
				refreshToken,
				isAuthenticated: true
			});
		},
		
		logout: () => {
			if (browser) {
				localStorage.removeItem('user');
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
			}
			
			set({
				user: null,
				accessToken: null,
				refreshToken: null,
				isAuthenticated: false
			});
		},
		
		updateToken: (accessToken: string) => {
			if (browser) {
				localStorage.setItem('accessToken', accessToken);
			}
			
			update(state => ({
				...state,
				accessToken
			}));
		},
		
		updateUser: (user: User) => {
			if (browser) {
				localStorage.setItem('user', JSON.stringify(user));
			}
			
			update(state => ({
				...state,
				user
			}));
		}
	};
}

export const auth = createAuthStore();

// Helper to check if user has required role
export function hasRole(allowedRoles: string[]): boolean {
	let currentUser: User | null = null;
	auth.subscribe(state => currentUser = state.user)();
	
	if (!currentUser) return false;
	return allowedRoles.includes(currentUser.role);
}

// Helper to check if user is admin
export function isAdmin(): boolean {
	return hasRole(['admin']);
}

// Helper to check if user is staff or admin
export function isStaffOrAdmin(): boolean {
	return hasRole(['admin', 'staff']);
}
