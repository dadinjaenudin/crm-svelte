import express from 'express';
import * as memberController from '../controllers/memberController.js';
import * as pointController from '../controllers/pointController.js';
import * as voucherController from '../controllers/voucherController.js';
import * as redeemController from '../controllers/redeemController.js';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authController.logout);

// Protected auth routes
router.get('/auth/profile', authenticate, authController.getProfile);
router.post('/auth/change-password', authenticate, authController.changePassword);

// Member routes (Protected - require authentication)
router.get('/members', authenticate, memberController.getAllMembers);
router.get('/members/stats', authenticate, memberController.getMemberStats);
router.get('/members/:id', authenticate, memberController.getMemberById);
router.post('/members', authenticate, authorize('admin', 'staff'), memberController.createMember);
router.put('/members/:id', authenticate, authorize('admin', 'staff'), memberController.updateMember);
router.delete('/members/:id', authenticate, authorize('admin'), memberController.deleteMember);

// Point transaction routes (Protected)
router.get('/points', authenticate, pointController.getAllPointTransactions);
router.get('/points/stats', authenticate, pointController.getPointStats);
router.post('/points', authenticate, authorize('admin', 'staff'), pointController.createPointTransaction);

// Voucher routes (Protected)
router.get('/vouchers', authenticate, voucherController.getAllVouchers);
router.get('/vouchers/stats', authenticate, voucherController.getVoucherStats);
router.get('/vouchers/:id', authenticate, voucherController.getVoucherById);
router.post('/vouchers', authenticate, authorize('admin', 'staff'), voucherController.createVoucher);
router.put('/vouchers/:id', authenticate, authorize('admin', 'staff'), voucherController.updateVoucher);
router.delete('/vouchers/:id', authenticate, authorize('admin'), voucherController.deleteVoucher);

// Redeem transaction routes (Protected)
router.get('/redeem', authenticate, redeemController.getAllRedeemTransactions);
router.get('/redeem/stats', authenticate, redeemController.getRedeemStats);
router.post('/redeem', authenticate, authorize('admin', 'staff'), redeemController.createRedeemTransaction);
router.patch('/redeem/:id/status', authenticate, authorize('admin', 'staff'), redeemController.updateRedeemStatus);

export default router;
