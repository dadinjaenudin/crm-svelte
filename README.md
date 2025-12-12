# 🎯 CRM Application - Customer Relationship Management

Aplikasi CRM (Customer Relationship Management) yang dibangun dengan **Svelte** dan **SvelteKit**. Aplikasi ini menyediakan sistem manajemen pelanggan lengkap dengan fitur poin, voucher, dan redeem.

## ✨ Fitur Utama

### 📊 Dashboard
- Overview statistik lengkap (total member, poin, voucher, redeem)
- Transaksi poin terbaru
- Top member berdasarkan poin
- Quick actions untuk akses cepat ke fitur-fitur utama

### 👥 Member Management
- CRUD (Create, Read, Update, Delete) member
- Filter member berdasarkan status (Active/Inactive)
- Pencarian member (nama, email, telepon)
- Informasi lengkap member: nama, email, telepon, alamat, poin, tier level
- Tier level: Bronze, Silver, Gold, Platinum

### ⭐ Poin Management
- Tambah transaksi poin (earn, redeem, expire, adjustment)
- Statistik poin (total diterbitkan, total diredeem)
- History transaksi poin lengkap
- Filter transaksi berdasarkan tipe
- Pencarian transaksi
- Otomatis update poin member

### 🎫 Voucher Management
- CRUD voucher dengan lengkap
- Dua tipe diskon: Persentase dan Nominal Tetap
- Konfigurasi minimal pembelian
- Manajemen stok voucher
- Periode berlaku voucher
- Biaya poin untuk redeem
- Filter voucher berdasarkan status
- Tampilan card yang menarik

### 🎁 Redeem Management
- Proses redeem voucher dengan poin
- Validasi poin member sebelum redeem
- Validasi stok voucher
- Status tracking: Pending, Completed, Used, Cancelled
- Informasi detail member dan voucher saat redeem
- History redeem lengkap
- Filter berdasarkan status redeem

### 📈 Reports & Analytics
- 4 Jenis laporan:
  1. **Member Report**: Statistik member, distribusi tier, top members
  2. **Points Report**: Total poin diterbitkan/diredeem/kadaluarsa
  3. **Voucher Report**: Statistik voucher, voucher paling populer
  4. **Redeem Report**: Distribusi status redeem, total poin digunakan
- Visualisasi data dengan bar chart
- Export dan print report (coming soon)

## 🚀 Teknologi yang Digunakan

- **Svelte 5** - Framework JavaScript yang reactive dan modern
- **SvelteKit 2** - Full-stack framework untuk Svelte
- **Vite** - Build tool yang cepat
- **TypeScript** - Type safety (optional)
- **CSS Custom Properties** - Styling dengan variable CSS

## 📦 Instalasi

### Prerequisites
- Node.js (versi 18 atau lebih baru)
- npm atau pnpm

### Langkah Instalasi

1. Clone repository atau download source code

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser dan akses:
```
http://localhost:5173
```

## 🛠️ Struktur Folder

```
/home/user/webapp/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── Navbar.svelte          # Komponen navigasi
│   │   ├── stores/
│   │   │   └── data.ts                # Store Svelte untuk state management
│   │   └── types/
│   │       └── index.ts               # TypeScript type definitions
│   ├── routes/
│   │   ├── +layout.svelte             # Layout utama
│   │   ├── +page.svelte               # Dashboard (/)
│   │   ├── members/
│   │   │   └── +page.svelte           # Member management
│   │   ├── points/
│   │   │   └── +page.svelte           # Poin management
│   │   ├── vouchers/
│   │   │   └── +page.svelte           # Voucher management
│   │   ├── redeem/
│   │   │   └── +page.svelte           # Redeem management
│   │   └── reports/
│   │       └── +page.svelte           # Reports & analytics
│   ├── app.css                         # Global styles
│   └── app.html                        # HTML template
├── static/                             # Static assets
├── package.json
├── svelte.config.js
├── vite.config.js
└── README.md
```

## 💾 Data Management

Aplikasi ini menggunakan **Svelte Stores** untuk state management dengan data mock yang tersimpan di memori. Data akan direset setiap kali aplikasi di-reload.

### Store yang Tersedia:
- `members` - Data member
- `pointTransactions` - Transaksi poin
- `vouchers` - Data voucher
- `redeemTransactions` - Transaksi redeem

### Helper Functions:
- `addMember()`, `updateMember()`, `deleteMember()`
- `addPointTransaction()`
- `addVoucher()`, `updateVoucher()`, `deleteVoucher()`
- `addRedeemTransaction()`, `updateRedeemStatus()`

## 🎨 Styling

Aplikasi menggunakan CSS custom properties untuk theming:

```css
--primary-color: #3b82f6
--secondary-color: #10b981
--danger-color: #ef4444
--warning-color: #f59e0b
--dark-color: #1f2937
--light-color: #f9fafb
--border-color: #e5e7eb
```

## 📱 Responsive Design

Aplikasi fully responsive dan dapat diakses dari:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)

## 🔄 Build untuk Production

Build aplikasi untuk production:

```bash
npm run build
```

Preview build production:

```bash
npm run preview
```

## 🚧 Pengembangan Lebih Lanjut

Beberapa ide untuk pengembangan:
- [ ] Integrasi dengan backend API (Node.js, Python, etc.)
- [ ] Integrasi database (PostgreSQL, MongoDB, etc.)
- [ ] Authentication & Authorization
- [ ] Real-time notifications
- [ ] Export laporan ke PDF/Excel
- [ ] Chart yang lebih advanced (Chart.js, D3.js)
- [ ] Upload foto member
- [ ] Email notifications
- [ ] Loyalty program automation
- [ ] Mobile app (React Native, Flutter)

## 📄 License

MIT License - bebas digunakan untuk keperluan pribadi atau komersial.

## 👨‍💻 Author

Dibuat dengan ❤️ menggunakan Svelte

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

---

**Happy Coding! 🎉**
