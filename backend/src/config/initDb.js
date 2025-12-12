import db from './database.js';

console.log('🔄 Initializing database...');

// Drop existing tables
const dropTables = [
  'DROP TABLE IF EXISTS redeem_transactions',
  'DROP TABLE IF EXISTS point_transactions',
  'DROP TABLE IF EXISTS vouchers',
  'DROP TABLE IF EXISTS members',
  'DROP TABLE IF EXISTS users'
];

dropTables.forEach(sql => {
  try {
    db.exec(sql);
  } catch (error) {
    console.log('Note:', error.message);
  }
});

// Create Users table (for authentication)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Members table
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    join_date DATE NOT NULL,
    total_points INTEGER DEFAULT 0,
    tier_level TEXT CHECK(tier_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')) DEFAULT 'Bronze',
    status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Vouchers table
db.exec(`
  CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    max_discount REAL,
    points_cost INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Inactive', 'Expired')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Point Transactions table
db.exec(`
  CREATE TABLE IF NOT EXISTS point_transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('earn', 'redeem', 'expire', 'adjustment')) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    reference_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  )
`);

// Create Redeem Transactions table
db.exec(`
  CREATE TABLE IF NOT EXISTS redeem_transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    voucher_id TEXT NOT NULL,
    points_used INTEGER NOT NULL,
    redeem_date DATE NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Completed', 'Cancelled', 'Used')) DEFAULT 'Completed',
    used_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
  )
`);

// Create indexes
db.exec('CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)');
db.exec('CREATE INDEX IF NOT EXISTS idx_members_status ON members(status)');
db.exec('CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code)');
db.exec('CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status)');
db.exec('CREATE INDEX IF NOT EXISTS idx_point_transactions_member ON point_transactions(member_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_redeem_transactions_member ON redeem_transactions(member_id)');

console.log('✅ Database tables created successfully');

// Insert sample data
console.log('🔄 Inserting sample data...');

// Sample Members
const members = [
  ['M001', 'Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Sudirman No. 123, Jakarta', '2024-01-15', 1500, 'Gold', 'Active'],
  ['M002', 'Siti Nurhaliza', 'siti@email.com', '081234567891', 'Jl. Thamrin No. 45, Jakarta', '2024-02-20', 800, 'Silver', 'Active'],
  ['M003', 'Ahmad Wijaya', 'ahmad@email.com', '081234567892', 'Jl. Gatot Subroto No. 67, Jakarta', '2024-03-10', 2500, 'Platinum', 'Active'],
  ['M004', 'Dewi Lestari', 'dewi@email.com', '081234567893', 'Jl. Rasuna Said No. 89, Jakarta', '2024-04-05', 400, 'Bronze', 'Active'],
  ['M005', 'Rudi Hartono', 'rudi@email.com', '081234567894', 'Jl. HR Rasuna Said No. 12, Jakarta', '2024-05-12', 600, 'Silver', 'Inactive']
];

const insertMember = db.prepare(`
  INSERT INTO members (id, name, email, phone, address, join_date, total_points, tier_level, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

members.forEach(member => {
  try {
    insertMember.run(...member);
  } catch (error) {
    console.log('Member insert note:', error.message);
  }
});

// Sample Vouchers
const vouchers = [
  ['V001', 'DISKON20', 'Diskon 20%', 'Dapatkan diskon 20% untuk pembelian minimal Rp 500.000', 'percentage', 20, 500000, 100000, 200, 50, '2024-12-01', '2024-12-31', 'Active'],
  ['V002', 'CASHBACK50K', 'Cashback Rp 50.000', 'Cashback Rp 50.000 untuk pembelian minimal Rp 1.000.000', 'fixed', 50000, 1000000, null, 300, 30, '2024-12-01', '2024-12-31', 'Active'],
  ['V003', 'GRATIS100K', 'Voucher Gratis Rp 100.000', 'Voucher belanja gratis senilai Rp 100.000', 'fixed', 100000, 0, null, 500, 20, '2024-12-01', '2024-12-31', 'Active'],
  ['V004', 'DISKON15', 'Diskon 15%', 'Diskon 15% untuk semua produk', 'percentage', 15, 300000, 75000, 150, 100, '2024-12-01', '2024-12-31', 'Active']
];

const insertVoucher = db.prepare(`
  INSERT INTO vouchers (id, code, name, description, discount_type, discount_value, min_purchase, max_discount, points_cost, stock, valid_from, valid_to, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

vouchers.forEach(voucher => {
  try {
    insertVoucher.run(...voucher);
  } catch (error) {
    console.log('Voucher insert note:', error.message);
  }
});

// Sample Point Transactions
const pointTransactions = [
  ['PT001', 'M001', 'earn', 500, 'Pembelian produk senilai Rp 5.000.000', '2024-12-01'],
  ['PT002', 'M001', 'redeem', -200, 'Penukaran voucher diskon 20%', '2024-12-05', 'R001'],
  ['PT003', 'M002', 'earn', 300, 'Pembelian produk senilai Rp 3.000.000', '2024-12-03'],
  ['PT004', 'M003', 'earn', 1000, 'Pembelian produk senilai Rp 10.000.000', '2024-12-07'],
  ['PT005', 'M004', 'adjustment', 100, 'Penyesuaian poin bonus ulang tahun', '2024-12-10']
];

const insertPointTxn = db.prepare(`
  INSERT INTO point_transactions (id, member_id, type, points, description, date, reference_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

pointTransactions.forEach(txn => {
  try {
    insertPointTxn.run(...txn);
  } catch (error) {
    console.log('Point transaction insert note:', error.message);
  }
});

// Sample Redeem Transactions
const redeemTransactions = [
  ['R001', 'M001', 'V001', 200, '2024-12-05', 'Used', '2024-12-06'],
  ['R002', 'M002', 'V004', 150, '2024-12-08', 'Completed', null],
  ['R003', 'M003', 'V002', 300, '2024-12-10', 'Completed', null]
];

const insertRedeemTxn = db.prepare(`
  INSERT INTO redeem_transactions (id, member_id, voucher_id, points_used, redeem_date, status, used_date)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

redeemTransactions.forEach(txn => {
  try {
    insertRedeemTxn.run(...txn);
  } catch (error) {
    console.log('Redeem transaction insert note:', error.message);
  }
});

console.log('✅ Sample data inserted successfully');
console.log('');
console.log('📊 Database Statistics:');
console.log(`   Members: ${db.prepare('SELECT COUNT(*) as count FROM members').get().count}`);
console.log(`   Vouchers: ${db.prepare('SELECT COUNT(*) as count FROM vouchers').get().count}`);
console.log(`   Point Transactions: ${db.prepare('SELECT COUNT(*) as count FROM point_transactions').get().count}`);
console.log(`   Redeem Transactions: ${db.prepare('SELECT COUNT(*) as count FROM redeem_transactions').get().count}`);
console.log('');
console.log('✅ Database initialization complete!');

db.close();
