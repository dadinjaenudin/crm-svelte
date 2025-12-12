import db from '../config/database.js';

export const getAllRedeemTransactions = (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT rt.*, m.name as member_name, v.name as voucher_name, v.code as voucher_code
      FROM redeem_transactions rt
      JOIN members m ON rt.member_id = m.id
      JOIN vouchers v ON rt.voucher_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'All') {
      query += ' AND rt.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (m.name LIKE ? OR v.name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ' ORDER BY rt.redeem_date DESC, rt.created_at DESC';
    
    const stmt = db.prepare(query);
    const transactions = stmt.all(...params);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching redeem transactions',
      error: error.message
    });
  }
};

export const createRedeemTransaction = (req, res) => {
  try {
    const { id, memberId, voucherId, pointsUsed, redeemDate, status } = req.body;
    
    // Get member and voucher info
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(voucherId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }
    
    // Validate points and stock
    if (member.total_points < pointsUsed) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }
    
    if (voucher.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Voucher out of stock'
      });
    }
    
    // Start transaction
    const insertRedeem = db.prepare(`
      INSERT INTO redeem_transactions (id, member_id, voucher_id, points_used, redeem_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const updateMemberPoints = db.prepare(`
      UPDATE members SET total_points = total_points - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const updateVoucherStock = db.prepare(`
      UPDATE vouchers SET stock = stock - 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const insertPointTxn = db.prepare(`
      INSERT INTO point_transactions (id, member_id, type, points, description, date, reference_id)
      VALUES (?, ?, 'redeem', ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      insertRedeem.run(id, memberId, voucherId, pointsUsed, redeemDate, status);
      updateMemberPoints.run(pointsUsed, memberId);
      updateVoucherStock.run(voucherId);
      
      // Create point transaction
      const ptId = 'PT' + String(Date.now()).slice(-6);
      insertPointTxn.run(ptId, memberId, -pointsUsed, `Penukaran voucher ${voucher.name}`, redeemDate, id);
    });
    
    transaction();
    
    const newRedeem = db.prepare(`
      SELECT rt.*, m.name as member_name, v.name as voucher_name
      FROM redeem_transactions rt
      JOIN members m ON rt.member_id = m.id
      JOIN vouchers v ON rt.voucher_id = v.id
      WHERE rt.id = ?
    `).get(id);
    
    res.status(201).json({
      success: true,
      message: 'Redeem transaction created successfully',
      data: newRedeem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating redeem transaction',
      error: error.message
    });
  }
};

export const updateRedeemStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, usedDate } = req.body;
    
    const stmt = db.prepare(`
      UPDATE redeem_transactions 
      SET status = ?, used_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(status, usedDate || null, id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Redeem transaction not found'
      });
    }
    
    const updated = db.prepare(`
      SELECT rt.*, m.name as member_name, v.name as voucher_name
      FROM redeem_transactions rt
      JOIN members m ON rt.member_id = m.id
      JOIN vouchers v ON rt.voucher_id = v.id
      WHERE rt.id = ?
    `).get(id);
    
    res.json({
      success: true,
      message: 'Redeem status updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating redeem status',
      error: error.message
    });
  }
};

export const getRedeemStats = (req, res) => {
  try {
    const totalRedeems = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions').get().count;
    const pendingCount = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions WHERE status = ?').get('Pending').count;
    const completedCount = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions WHERE status = ?').get('Completed').count;
    const usedCount = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions WHERE status = ?').get('Used').count;
    const cancelledCount = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions WHERE status = ?').get('Cancelled').count;
    const totalPointsUsed = db.prepare('SELECT SUM(points_used) as total FROM redeem_transactions').get().total || 0;
    
    res.json({
      success: true,
      data: {
        totalRedeems,
        pendingCount,
        completedCount,
        usedCount,
        cancelledCount,
        totalPointsUsed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
