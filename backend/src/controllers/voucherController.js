import db from '../config/database.js';

export const getAllVouchers = (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM vouchers WHERE 1=1';
    const params = [];
    
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const vouchers = stmt.all(...params);
    
    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vouchers',
      error: error.message
    });
  }
};

export const getVoucherById = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM vouchers WHERE id = ?');
    const voucher = stmt.get(id);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }
    
    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching voucher',
      error: error.message
    });
  }
};

export const createVoucher = (req, res) => {
  try {
    const { id, code, name, description, discountType, discountValue, minPurchase, maxDiscount, pointsCost, stock, validFrom, validTo, status } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO vouchers (id, code, name, description, discount_type, discount_value, min_purchase, max_discount, points_cost, stock, valid_from, valid_to, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, code, name, description, discountType, discountValue, minPurchase, maxDiscount, pointsCost, stock, validFrom, validTo, status);
    
    const newVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: newVoucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating voucher',
      error: error.message
    });
  }
};

export const updateVoucher = (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, discountType, discountValue, minPurchase, maxDiscount, pointsCost, stock, validFrom, validTo, status } = req.body;
    
    const stmt = db.prepare(`
      UPDATE vouchers 
      SET code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?, 
          min_purchase = ?, max_discount = ?, points_cost = ?, stock = ?, 
          valid_from = ?, valid_to = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(code, name, description, discountType, discountValue, minPurchase, maxDiscount, pointsCost, stock, validFrom, validTo, status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }
    
    const updatedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    
    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: updatedVoucher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating voucher',
      error: error.message
    });
  }
};

export const deleteVoucher = (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM vouchers WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting voucher',
      error: error.message
    });
  }
};

export const getVoucherStats = (req, res) => {
  try {
    const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers').get().count;
    const activeVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers WHERE status = ?').get('Active').count;
    const totalStock = db.prepare('SELECT SUM(stock) as total FROM vouchers').get().total || 0;
    const totalRedeemed = db.prepare('SELECT COUNT(*) as count FROM redeem_transactions').get().count;
    
    res.json({
      success: true,
      data: {
        totalVouchers,
        activeVouchers,
        totalStock,
        totalRedeemed
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
