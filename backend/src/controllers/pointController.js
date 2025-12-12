import db from '../config/database.js';

export const getAllPointTransactions = (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = `
      SELECT pt.*, m.name as member_name 
      FROM point_transactions pt
      JOIN members m ON pt.member_id = m.id
      WHERE 1=1
    `;
    const params = [];
    
    if (type && type !== 'All') {
      query += ' AND pt.type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (m.name LIKE ? OR pt.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ' ORDER BY pt.date DESC, pt.created_at DESC';
    
    const stmt = db.prepare(query);
    const transactions = stmt.all(...params);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

export const createPointTransaction = (req, res) => {
  try {
    const { id, memberId, type, points, description, date } = req.body;
    
    // Calculate actual points change
    let pointsChange = points;
    if (type === 'redeem' || type === 'expire') {
      pointsChange = -Math.abs(points);
    }
    
    // Start transaction
    const insertStmt = db.prepare(`
      INSERT INTO point_transactions (id, member_id, type, points, description, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const updateStmt = db.prepare(`
      UPDATE members SET total_points = total_points + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const transaction = db.transaction(() => {
      insertStmt.run(id, memberId, type, pointsChange, description, date);
      updateStmt.run(pointsChange, memberId);
    });
    
    transaction();
    
    const member = db.prepare('SELECT name FROM members WHERE id = ?').get(memberId);
    const newTransaction = db.prepare('SELECT * FROM point_transactions WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        ...newTransaction,
        member_name: member.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

export const getPointStats = (req, res) => {
  try {
    const totalEarned = db.prepare('SELECT SUM(points) as total FROM point_transactions WHERE points > 0').get().total || 0;
    const totalRedeemed = Math.abs(db.prepare('SELECT SUM(points) as total FROM point_transactions WHERE points < 0').get().total || 0);
    const transactionCount = db.prepare('SELECT COUNT(*) as count FROM point_transactions').get().count;
    
    res.json({
      success: true,
      data: {
        totalEarned,
        totalRedeemed,
        netPoints: totalEarned - totalRedeemed,
        transactionCount
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
