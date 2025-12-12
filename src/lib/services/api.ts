// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

class ApiService {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			
			const response = await fetch(url, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				}
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

	// Member API
	async getMembers(status?: string, search?: string) {
		let url = '/members?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async getMemberById(id: string) {
		return this.request(`/members/${id}`);
	}

	async createMember(member: any) {
		return this.request('/members', {
			method: 'POST',
			body: JSON.stringify(member)
		});
	}

	async updateMember(id: string, member: any) {
		return this.request(`/members/${id}`, {
			method: 'PUT',
			body: JSON.stringify(member)
		});
	}

	async deleteMember(id: string) {
		return this.request(`/members/${id}`, {
			method: 'DELETE'
		});
	}

	async getMemberStats() {
		return this.request('/members/stats');
	}
	
	async getTotalPoints() {
		return this.getMemberStats();
	}

	// Point API
	async getPointTransactions(type?: string, search?: string) {
		let url = '/points?';
		if (type) url += `type=${type}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async createPointTransaction(transaction: any) {
		return this.request('/points', {
			method: 'POST',
			body: JSON.stringify(transaction)
		});
	}

	async getPointStats() {
		return this.request('/points/stats');
	}

	// Voucher API
	async getVouchers(status?: string, search?: string) {
		let url = '/vouchers?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async getVoucherById(id: string) {
		return this.request(`/vouchers/${id}`);
	}

	async createVoucher(voucher: any) {
		return this.request('/vouchers', {
			method: 'POST',
			body: JSON.stringify(voucher)
		});
	}

	async updateVoucher(id: string, voucher: any) {
		return this.request(`/vouchers/${id}`, {
			method: 'PUT',
			body: JSON.stringify(voucher)
		});
	}

	async deleteVoucher(id: string) {
		return this.request(`/vouchers/${id}`, {
			method: 'DELETE'
		});
	}

	async getVoucherStats() {
		return this.request('/vouchers/stats');
	}

	// Redeem API
	async getRedeemTransactions(status?: string, search?: string) {
		let url = '/redeem?';
		if (status) url += `status=${status}&`;
		if (search) url += `search=${search}`;
		return this.request(url);
	}

	async createRedeemTransaction(transaction: any) {
		return this.request('/redeem', {
			method: 'POST',
			body: JSON.stringify(transaction)
		});
	}

	async updateRedeemStatus(id: string, status: string, usedDate?: string) {
		return this.request(`/redeem/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify({ status, usedDate })
		});
	}

	async getRedeemStats() {
		return this.request('/redeem/stats');
	}
}

export const api = new ApiService(API_BASE_URL);
export default api;
