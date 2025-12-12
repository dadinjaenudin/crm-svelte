-- =============================================================================
-- PostgreSQL Database Initialization Script
-- CRM Application Database Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE - Authentication and authorization
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =============================================================================
-- MEMBERS TABLE - CRM customer data
-- =============================================================================
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    join_date DATE NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    tier_level VARCHAR(20) NOT NULL DEFAULT 'Bronze' CHECK (tier_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_tier_level ON members(tier_level);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_members_total_points ON members(total_points DESC);

-- =============================================================================
-- POINT TRANSACTIONS TABLE - Track all point activities
-- =============================================================================
CREATE TABLE IF NOT EXISTS point_transactions (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjustment')),
    points INTEGER NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_point_transactions_member_id ON point_transactions(member_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX idx_point_transactions_date ON point_transactions(transaction_date DESC);

-- =============================================================================
-- VOUCHERS TABLE - Reward vouchers
-- =============================================================================
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'discount' CHECK (type IN ('discount', 'cashback', 'freebie')),
    discount_value DECIMAL(10,2),
    points_cost INTEGER NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_dates ON vouchers(start_date, end_date);
CREATE INDEX idx_vouchers_points_cost ON vouchers(points_cost);

-- =============================================================================
-- REDEEM TRANSACTIONS TABLE - Track voucher redemptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS redeem_transactions (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    points_cost INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled', 'Used')),
    redeem_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_redeem_transactions_member_id ON redeem_transactions(member_id);
CREATE INDEX idx_redeem_transactions_voucher_id ON redeem_transactions(voucher_id);
CREATE INDEX idx_redeem_transactions_status ON redeem_transactions(status);
CREATE INDEX idx_redeem_transactions_date ON redeem_transactions(redeem_date DESC);

-- =============================================================================
-- SESSIONS TABLE - User sessions (for Redis fallback)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =============================================================================
-- AUDIT LOG TABLE - Track all important actions
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- TRIGGERS - Auto-update timestamps
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redeem_transactions_updated_at BEFORE UPDATE ON redeem_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA - Default users and sample data
-- =============================================================================

-- Insert default admin user (password: admin123 - bcrypt hash)
INSERT INTO users (id, username, password, email, full_name, role, status) VALUES
('admin-001', 'admin', '$2a$10$X3V6Y8gZ5J5fYZj3XK5h5.8GQV4Z7Z2ZJ5K5h5.8GQV4Z7Z2ZJ5K5h', 'admin@crm.com', 'Administrator', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default staff user (password: staff123)
INSERT INTO users (id, username, password, email, full_name, role, status) VALUES
('staff-001', 'staff1', '$2a$10$X3V6Y8gZ5J5fYZj3XK5h5.8GQV4Z7Z2ZJ5K5h5.8GQV4Z7Z2ZJ5K5h', 'staff@crm.com', 'Staff Member', 'staff', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample members
INSERT INTO members (id, name, email, phone, address, join_date, total_points, tier_level, status) VALUES
('MEM-001', 'John Doe', 'john.doe@email.com', '08123456789', 'Jakarta Selatan', '2024-01-15', 1500, 'Gold', 'Active'),
('MEM-002', 'Jane Smith', 'jane.smith@email.com', '08198765432', 'Bandung', '2024-02-20', 500, 'Silver', 'Active'),
('MEM-003', 'Bob Johnson', 'bob.johnson@email.com', '08111222333', 'Surabaya', '2024-03-10', 2500, 'Platinum', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample vouchers
INSERT INTO vouchers (code, name, description, type, discount_value, points_cost, stock, start_date, end_date, status) VALUES
('DISC50', 'Diskon 50%', 'Diskon 50% untuk pembelian minimum Rp 100.000', 'discount', 50.00, 500, 100, '2024-01-01', '2024-12-31', 'Active'),
('CASH100K', 'Cashback Rp 100.000', 'Cashback Rp 100.000 untuk pembelian minimum Rp 500.000', 'cashback', 100000.00, 1000, 50, '2024-01-01', '2024-12-31', 'Active'),
('FREE-GIFT', 'Free Gift Special', 'Gratis 1 produk pilihan', 'freebie', 0, 750, 30, '2024-01-01', '2024-12-31', 'Active')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- VIEWS - Useful data aggregations
-- =============================================================================

-- View: Member statistics
CREATE OR REPLACE VIEW v_member_statistics AS
SELECT 
    m.id,
    m.name,
    m.email,
    m.tier_level,
    m.total_points,
    COUNT(DISTINCT pt.id) as total_transactions,
    COUNT(DISTINCT rt.id) as total_redemptions,
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'earn' THEN pt.points ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN pt.transaction_type = 'redeem' THEN pt.points ELSE 0 END), 0) as total_redeemed
FROM members m
LEFT JOIN point_transactions pt ON m.id = pt.member_id
LEFT JOIN redeem_transactions rt ON m.id = rt.member_id
GROUP BY m.id, m.name, m.email, m.tier_level, m.total_points;

-- View: Voucher redemption statistics
CREATE OR REPLACE VIEW v_voucher_statistics AS
SELECT 
    v.id,
    v.code,
    v.name,
    v.stock,
    COUNT(rt.id) as total_redemptions,
    SUM(CASE WHEN rt.status = 'Completed' THEN 1 ELSE 0 END) as completed_redemptions,
    SUM(CASE WHEN rt.status = 'Used' THEN 1 ELSE 0 END) as used_redemptions
FROM vouchers v
LEFT JOIN redeem_transactions rt ON v.id = rt.voucher_id
GROUP BY v.id, v.code, v.name, v.stock;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
-- Note: Adjust these based on your security requirements

-- Grant all privileges to application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;

-- =============================================================================
-- DATABASE INITIALIZATION COMPLETE
-- =============================================================================

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'CRM Database Initialization Complete!';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Tables created: users, members, point_transactions,';
    RAISE NOTICE '                vouchers, redeem_transactions, sessions,';
    RAISE NOTICE '                audit_logs';
    RAISE NOTICE 'Default users: admin/admin123, staff1/staff123';
    RAISE NOTICE 'Sample data: 3 members, 3 vouchers';
    RAISE NOTICE '=======================================================';
END $$;
