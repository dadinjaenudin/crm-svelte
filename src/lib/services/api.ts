// API Configuration
// Django backend (default: http://localhost:8000/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	results?: T; // Django REST Framework pagination
	count?: number;
	next?: string | null;
	previous?: string | null;
}

class ApiService {
	private baseUrl: string;
	private getToken: (() => string | null) | null = null;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	// Set token getter function
	setTokenGetter(getter: () => string | null) {
		this.getToken = getter;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			
			// Add authorization header if token exists
			const headers: HeadersInit = {
				'Content-Type': 'application/json',
				...options.headers
			};
			
			if (this.getToken) {
				const token = this.getToken();
				if (token) {
					headers['Authorization'] = `Bearer ${token}`;
				}
			}
			
			const response = await fetch(url, {
				...options,
				headers
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Request failed');
			}

			return data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	// Auth API
	async login(username: string, password: string) {
		return this.request('/auth/login/', {
			method: 'POST',
			body: JSON.stringify({ username, password })
		});
	}

	async register(userData: any) {
		return this.request('/auth/register/', {
			method: 'POST',
			body: JSON.stringify(userData)
		});
	}

	async refreshToken(refresh: string) {
		return this.request('/auth/token/refresh/', {
			method: 'POST',
			body: JSON.stringify({ refresh })
		});
	}

	async getProfile() {
		return this.request('/auth/me/');
	}

	async updateProfile(userData: any) {
		return this.request('/auth/profile/', {
			method: 'PUT',
			body: JSON.stringify(userData)
		});
	}

	async changePassword(old_password: string, new_password: string, confirm_password: string) {
		return this.request('/auth/change-password/', {
			method: 'POST',
			body: JSON.stringify({ old_password, new_password, confirm_password })
		});
	}

	async logout() {
		// Django doesn't need logout endpoint for JWT
		// Just remove token from client side
		return Promise.resolve({ success: true, message: 'Logged out successfully' });
	}

	// Member API
	async getMembers(status?: string, search?: string) {
		let url = '/members/?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async getMemberById(id: string) {
		return this.request(`/members/${id}/`);
	}

	async createMember(member: any) {
		return this.request('/members/', {
			method: 'POST',
			body: JSON.stringify(member)
		});
	}

	async updateMember(id: string, member: any) {
		return this.request(`/members/${id}/`, {
			method: 'PUT',
			body: JSON.stringify(member)
		});
	}

	async deleteMember(id: string) {
		return this.request(`/members/${id}/`, {
			method: 'DELETE'
		});
	}

	async getMemberStats() {
		return this.request('/members/statistics/');
	}
	
	async getTotalPoints() {
		return this.getMemberStats();
	}

	// Point API
	async getPointTransactions(type?: string, search?: string) {
		let url = '/points/?';
		if (type) url += `transaction_type=${type}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async createPointTransaction(transaction: any) {
		return this.request('/points/', {
			method: 'POST',
			body: JSON.stringify(transaction)
		});
	}

	async getPointStats() {
		return this.request('/points/statistics/');
	}

	// Voucher API
	async getVouchers(status?: string, search?: string) {
		let url = '/vouchers/?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async getVoucherById(id: string) {
		return this.request(`/vouchers/${id}/`);
	}

	async createVoucher(voucher: any) {
		return this.request('/vouchers/', {
			method: 'POST',
			body: JSON.stringify(voucher)
		});
	}

	async updateVoucher(id: string, voucher: any) {
		return this.request(`/vouchers/${id}/`, {
			method: 'PUT',
			body: JSON.stringify(voucher)
		});
	}

	async deleteVoucher(id: string) {
		return this.request(`/vouchers/${id}/`, {
			method: 'DELETE'
		});
	}

	async getVoucherStats() {
		return this.request('/vouchers/statistics/');
	}

	// Redeem API
	async getRedeemTransactions(status?: string, search?: string) {
		let url = '/redeem/?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async createRedeemTransaction(transaction: any) {
		return this.request('/redeem/', {
			method: 'POST',
			body: JSON.stringify(transaction)
		});
	}

	async updateRedeemStatus(id: string, status: string, used_date?: string) {
		return this.request(`/redeem/${id}/update-status/`, {
			method: 'POST',
			body: JSON.stringify({ status, used_date })
		});
	}

	async getRedeemStats() {
		return this.request('/redeem/statistics/');
	}
}

export const api = new ApiService(API_BASE_URL);
export default api;
