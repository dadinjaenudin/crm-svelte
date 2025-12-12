import db from '../config/database.js';

// Get all members
export const getAllMembers = (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const members = stmt.all(...params);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message
    });
  }
};

// Get single member
export const getMemberById = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
    const member = stmt.get(id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching member',
      error: error.message
    });
  }
};

// Create member
export const createMember = (req, res) => {
  try {
    const { id, name, email, phone, address, join_date, tier_level, status } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO members (id, name, email, phone, address, join_date, tier_level, status, total_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    
    stmt.run(id, name, email, phone, address, join_date, tier_level, status);
    
    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: newMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating member',
      error: error.message
    });
  }
};

// Update member
export const updateMember = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, join_date, tier_level, status } = req.body;
    
    const stmt = db.prepare(`
      UPDATE members 
      SET name = ?, email = ?, phone = ?, address = ?, join_date = ?, 
          tier_level = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(name, email, phone, address, join_date, tier_level, status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    const updatedMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    });
  }
};

// Delete member
export const deleteMember = (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM members WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting member',
      error: error.message
    });
  }
};

// Get member statistics
export const getMemberStats = (req, res) => {
  try {
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    const activeMembers = db.prepare('SELECT COUNT(*) as count FROM members WHERE status = ?').get('Active').count;
    const totalPoints = db.prepare('SELECT SUM(total_points) as total FROM members').get().total || 0;
    
    const tierDistribution = {
      Bronze: db.prepare('SELECT COUNT(*) as count FROM members WHERE tier_level = ?').get('Bronze').count,
      Silver: db.prepare('SELECT COUNT(*) as count FROM members WHERE tier_level = ?').get('Silver').count,
      Gold: db.prepare('SELECT COUNT(*) as count FROM members WHERE tier_level = ?').get('Gold').count,
      Platinum: db.prepare('SELECT COUNT(*) as count FROM members WHERE tier_level = ?').get('Platinum').count
    };
    
    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalPoints,
        avgPoints: totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0,
        tierDistribution
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
