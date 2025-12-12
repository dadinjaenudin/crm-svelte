export interface Member {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	joinDate: string;
	totalPoints: number;
	tierLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
	status: 'Active' | 'Inactive';
}

export interface PointTransaction {
	id: string;
	memberId: string;
	memberName: string;
	type: 'earn' | 'redeem' | 'expire' | 'adjustment';
	points: number;
	description: string;
	date: string;
	referenceId?: string;
}

export interface Voucher {
	id: string;
	code: string;
	name: string;
	description: string;
	discountType: 'percentage' | 'fixed';
	discountValue: number;
	minPurchase: number;
	maxDiscount?: number;
	pointsCost: number;
	stock: number;
	validFrom: string;
	validTo: string;
	status: 'Active' | 'Inactive' | 'Expired';
}

export interface RedeemTransaction {
	id: string;
	memberId: string;
	memberName: string;
	voucherId: string;
	voucherName: string;
	pointsUsed: number;
	redeemDate: string;
	status: 'Pending' | 'Completed' | 'Cancelled' | 'Used';
	usedDate?: string;
}

export interface DashboardStats {
	totalMembers: number;
	activeMembers: number;
	totalPointsIssued: number;
	totalRedemptions: number;
	monthlyNewMembers: number;
	monthlyPointsEarned: number;
	monthlyRedemptions: number;
}
