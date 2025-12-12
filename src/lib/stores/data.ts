import { writable } from 'svelte/store';
import type { Member, PointTransaction, Voucher, RedeemTransaction } from '$lib/types';

// Mock Data
const initialMembers: Member[] = [
	{
		id: 'M001',
		name: 'Budi Santoso',
		email: 'budi@email.com',
		phone: '081234567890',
		address: 'Jl. Sudirman No. 123, Jakarta',
		joinDate: '2024-01-15',
		totalPoints: 1500,
		tierLevel: 'Gold',
		status: 'Active'
	},
	{
		id: 'M002',
		name: 'Siti Nurhaliza',
		email: 'siti@email.com',
		phone: '081234567891',
		address: 'Jl. Thamrin No. 45, Jakarta',
		joinDate: '2024-02-20',
		totalPoints: 800,
		tierLevel: 'Silver',
		status: 'Active'
	},
	{
		id: 'M003',
		name: 'Ahmad Wijaya',
		email: 'ahmad@email.com',
		phone: '081234567892',
		address: 'Jl. Gatot Subroto No. 67, Jakarta',
		joinDate: '2024-03-10',
		totalPoints: 2500,
		tierLevel: 'Platinum',
		status: 'Active'
	},
	{
		id: 'M004',
		name: 'Dewi Lestari',
		email: 'dewi@email.com',
		phone: '081234567893',
		address: 'Jl. Rasuna Said No. 89, Jakarta',
		joinDate: '2024-04-05',
		totalPoints: 400,
		tierLevel: 'Bronze',
		status: 'Active'
	},
	{
		id: 'M005',
		name: 'Rudi Hartono',
		email: 'rudi@email.com',
		phone: '081234567894',
		address: 'Jl. HR Rasuna Said No. 12, Jakarta',
		joinDate: '2024-05-12',
		totalPoints: 600,
		tierLevel: 'Silver',
		status: 'Inactive'
	}
];

const initialPointTransactions: PointTransaction[] = [
	{
		id: 'PT001',
		memberId: 'M001',
		memberName: 'Budi Santoso',
		type: 'earn',
		points: 500,
		description: 'Pembelian produk senilai Rp 5.000.000',
		date: '2024-12-01'
	},
	{
		id: 'PT002',
		memberId: 'M001',
		memberName: 'Budi Santoso',
		type: 'redeem',
		points: -200,
		description: 'Penukaran voucher diskon 20%',
		date: '2024-12-05',
		referenceId: 'R001'
	},
	{
		id: 'PT003',
		memberId: 'M002',
		memberName: 'Siti Nurhaliza',
		type: 'earn',
		points: 300,
		description: 'Pembelian produk senilai Rp 3.000.000',
		date: '2024-12-03'
	},
	{
		id: 'PT004',
		memberId: 'M003',
		memberName: 'Ahmad Wijaya',
		type: 'earn',
		points: 1000,
		description: 'Pembelian produk senilai Rp 10.000.000',
		date: '2024-12-07'
	},
	{
		id: 'PT005',
		memberId: 'M004',
		memberName: 'Dewi Lestari',
		type: 'adjustment',
		points: 100,
		description: 'Penyesuaian poin bonus ulang tahun',
		date: '2024-12-10'
	}
];

const initialVouchers: Voucher[] = [
	{
		id: 'V001',
		code: 'DISKON20',
		name: 'Diskon 20%',
		description: 'Dapatkan diskon 20% untuk pembelian minimal Rp 500.000',
		discountType: 'percentage',
		discountValue: 20,
		minPurchase: 500000,
		maxDiscount: 100000,
		pointsCost: 200,
		stock: 50,
		validFrom: '2024-12-01',
		validTo: '2024-12-31',
		status: 'Active'
	},
	{
		id: 'V002',
		code: 'CASHBACK50K',
		name: 'Cashback Rp 50.000',
		description: 'Cashback Rp 50.000 untuk pembelian minimal Rp 1.000.000',
		discountType: 'fixed',
		discountValue: 50000,
		minPurchase: 1000000,
		pointsCost: 300,
		stock: 30,
		validFrom: '2024-12-01',
		validTo: '2024-12-31',
		status: 'Active'
	},
	{
		id: 'V003',
		code: 'GRATIS100K',
		name: 'Voucher Gratis Rp 100.000',
		description: 'Voucher belanja gratis senilai Rp 100.000',
		discountType: 'fixed',
		discountValue: 100000,
		minPurchase: 0,
		pointsCost: 500,
		stock: 20,
		validFrom: '2024-12-01',
		validTo: '2024-12-31',
		status: 'Active'
	},
	{
		id: 'V004',
		code: 'DISKON15',
		name: 'Diskon 15%',
		description: 'Diskon 15% untuk semua produk',
		discountType: 'percentage',
		discountValue: 15,
		minPurchase: 300000,
		maxDiscount: 75000,
		pointsCost: 150,
		stock: 100,
		validFrom: '2024-12-01',
		validTo: '2024-12-31',
		status: 'Active'
	}
];

const initialRedeemTransactions: RedeemTransaction[] = [
	{
		id: 'R001',
		memberId: 'M001',
		memberName: 'Budi Santoso',
		voucherId: 'V001',
		voucherName: 'Diskon 20%',
		pointsUsed: 200,
		redeemDate: '2024-12-05',
		status: 'Used',
		usedDate: '2024-12-06'
	},
	{
		id: 'R002',
		memberId: 'M002',
		memberName: 'Siti Nurhaliza',
		voucherId: 'V004',
		voucherName: 'Diskon 15%',
		pointsUsed: 150,
		redeemDate: '2024-12-08',
		status: 'Completed'
	},
	{
		id: 'R003',
		memberId: 'M003',
		memberName: 'Ahmad Wijaya',
		voucherId: 'V002',
		voucherName: 'Cashback Rp 50.000',
		pointsUsed: 300,
		redeemDate: '2024-12-10',
		status: 'Completed'
	}
];

// Create stores
export const members = writable<Member[]>(initialMembers);
export const pointTransactions = writable<PointTransaction[]>(initialPointTransactions);
export const vouchers = writable<Voucher[]>(initialVouchers);
export const redeemTransactions = writable<RedeemTransaction[]>(initialRedeemTransactions);

// Helper functions
export function addMember(member: Member) {
	members.update(m => [...m, member]);
}

export function updateMember(id: string, updatedMember: Member) {
	members.update(m => m.map(member => member.id === id ? updatedMember : member));
}

export function deleteMember(id: string) {
	members.update(m => m.filter(member => member.id !== id));
}

export function addPointTransaction(transaction: PointTransaction) {
	pointTransactions.update(t => [...t, transaction]);
	
	// Update member points
	members.update(m => m.map(member => {
		if (member.id === transaction.memberId) {
			return {
				...member,
				totalPoints: member.totalPoints + transaction.points
			};
		}
		return member;
	}));
}

export function addVoucher(voucher: Voucher) {
	vouchers.update(v => [...v, voucher]);
}

export function updateVoucher(id: string, updatedVoucher: Voucher) {
	vouchers.update(v => v.map(voucher => voucher.id === id ? updatedVoucher : voucher));
}

export function deleteVoucher(id: string) {
	vouchers.update(v => v.filter(voucher => voucher.id !== id));
}

export function addRedeemTransaction(transaction: RedeemTransaction) {
	redeemTransactions.update(r => [...r, transaction]);
	
	// Deduct points from member
	members.update(m => m.map(member => {
		if (member.id === transaction.memberId) {
			return {
				...member,
				totalPoints: member.totalPoints - transaction.pointsUsed
			};
		}
		return member;
	}));
	
	// Reduce voucher stock
	vouchers.update(v => v.map(voucher => {
		if (voucher.id === transaction.voucherId) {
			return {
				...voucher,
				stock: voucher.stock - 1
			};
		}
		return voucher;
	}));
}

export function updateRedeemStatus(id: string, status: RedeemTransaction['status'], usedDate?: string) {
	redeemTransactions.update(r => r.map(transaction => {
		if (transaction.id === id) {
			return {
				...transaction,
				status,
				usedDate
			};
		}
		return transaction;
	}));
}
