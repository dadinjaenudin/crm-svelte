import express from 'express';
import * as memberController from '../controllers/memberController.js';
import * as pointController from '../controllers/pointController.js';
import * as voucherController from '../controllers/voucherController.js';
import * as redeemController from '../controllers/redeemController.js';

const router = express.Router();

// Member routes
router.get('/members', memberController.getAllMembers);
router.get('/members/stats', memberController.getMemberStats);
router.get('/members/:id', memberController.getMemberById);
router.post('/members', memberController.createMember);
router.put('/members/:id', memberController.updateMember);
router.delete('/members/:id', memberController.deleteMember);

// Point transaction routes
router.get('/points', pointController.getAllPointTransactions);
router.get('/points/stats', pointController.getPointStats);
router.post('/points', pointController.createPointTransaction);

// Voucher routes
router.get('/vouchers', voucherController.getAllVouchers);
router.get('/vouchers/stats', voucherController.getVoucherStats);
router.get('/vouchers/:id', voucherController.getVoucherById);
router.post('/vouchers', voucherController.createVoucher);
router.put('/vouchers/:id', voucherController.updateVoucher);
router.delete('/vouchers/:id', voucherController.deleteVoucher);

// Redeem transaction routes
router.get('/redeem', redeemController.getAllRedeemTransactions);
router.get('/redeem/stats', redeemController.getRedeemStats);
router.post('/redeem', redeemController.createRedeemTransaction);
router.patch('/redeem/:id/status', redeemController.updateRedeemStatus);

export default router;
