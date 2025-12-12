# 📖 Panduan Penggunaan Aplikasi CRM

## 🌐 Akses Aplikasi

**URL:** https://5173-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai

## 🎯 Panduan Fitur

### 1. 📊 Dashboard

Halaman utama yang menampilkan:
- **Statistik Utama**: Total member, poin, voucher, dan redeem
- **Transaksi Terbaru**: 5 transaksi poin terakhir
- **Top Member**: 5 member dengan poin tertinggi
- **Quick Actions**: Tombol akses cepat ke semua fitur

**Cara Menggunakan:**
- Buka aplikasi untuk langsung melihat dashboard
- Klik quick action untuk navigasi cepat
- Data akan update otomatis saat ada perubahan

---

### 2. 👥 Member Management

**Menambah Member Baru:**
1. Klik tombol "➕ Tambah Member Baru"
2. Isi formulir:
   - ID Member (otomatis terisi)
   - Nama Lengkap (wajib)
   - Email (wajib)
   - Nomor Telepon (wajib)
   - Alamat
   - Tanggal Bergabung
   - Tier Level (Bronze/Silver/Gold/Platinum)
   - Status (Active/Inactive)
3. Klik "Simpan"

**Mengedit Member:**
1. Klik ikon ✏️ di kolom aksi
2. Ubah data yang diperlukan
3. Klik "Update"

**Menghapus Member:**
1. Klik ikon 🗑️ di kolom aksi
2. Konfirmasi penghapusan

**Mencari Member:**
- Gunakan kotak pencarian untuk cari nama, email, atau telepon
- Filter berdasarkan status: Semua/Aktif/Tidak Aktif

---

### 3. ⭐ Poin Management

**Menambah Transaksi Poin:**
1. Klik tombol "➕ Tambah Transaksi Poin"
2. Pilih member dari dropdown
3. Pilih tipe transaksi:
   - **Dapat Poin**: Menambah poin (misal: dari pembelian)
   - **Redeem**: Mengurangi poin (dari penukaran voucher)
   - **Kadaluarsa**: Mengurangi poin (poin expired)
   - **Penyesuaian**: Menambah/mengurangi (koreksi manual)
4. Masukkan jumlah poin (angka positif)
5. Tulis deskripsi transaksi
6. Klik "Simpan"

**Catatan Penting:**
- Untuk tipe "Redeem" dan "Kadaluarsa", poin akan otomatis dikurangi
- Poin member akan terupdate otomatis setelah transaksi

**Filter Transaksi:**
- Semua / Dapat Poin / Redeem / Kadaluarsa / Penyesuaian

---

### 4. 🎫 Voucher Management

**Membuat Voucher Baru:**
1. Klik tombol "➕ Tambah Voucher Baru"
2. Isi informasi voucher:
   - **Kode Voucher**: Kode unik (contoh: DISKON20)
   - **Nama Voucher**: Nama display voucher
   - **Deskripsi**: Penjelasan voucher
   - **Tipe Diskon**: 
     - Persentase (%) - Diskon dalam persen
     - Nominal Tetap (Rp) - Cashback fix
   - **Nilai Diskon**: 
     - Jika persentase: masukkan angka (contoh: 20)
     - Jika fixed: masukkan nominal (contoh: 50000)
   - **Min. Pembelian**: Syarat minimal belanja
   - **Max. Diskon**: Batasan potongan (untuk tipe persentase)
   - **Biaya Poin**: Poin yang dibutuhkan untuk redeem
   - **Stok**: Jumlah voucher tersedia
   - **Berlaku Dari & Sampai**: Periode aktif voucher
   - **Status**: Active/Inactive/Expired
3. Klik "Simpan"

**Mengedit Voucher:**
- Klik ✏️ pada card voucher
- Update informasi
- Klik "Update"

**Menghapus Voucher:**
- Klik 🗑️ pada card voucher
- Konfirmasi penghapusan

**Contoh Voucher:**
```
Kode: DISKON20
Nama: Diskon 20%
Tipe: Persentase
Nilai: 20
Min. Pembelian: Rp 500.000
Max. Diskon: Rp 100.000
Biaya Poin: 200
```

---

### 5. 🎁 Redeem Management

**Proses Redeem Voucher:**
1. Klik tombol "➕ Proses Redeem Baru"
2. Pilih Member (hanya member active yang muncul)
3. Sistem akan menampilkan info member:
   - Nama lengkap
   - Poin tersedia
   - Tier level
4. Pilih Voucher (hanya voucher active dengan stok > 0)
5. Sistem akan menampilkan info voucher:
   - Kode voucher
   - Deskripsi
   - Biaya poin
   - Stok tersedia
6. Sistem akan validasi otomatis:
   - ✅ Poin member cukup
   - ✅ Stok voucher tersedia
7. Jika valid, klik "Proses Redeem"

**Update Status Redeem:**
- **Pending → Completed**: Klik "✓ Selesai"
- **Completed → Used**: Klik "✓ Pakai" (voucher sudah digunakan customer)
- **Any → Cancelled**: Klik "✗ Batal"

**Filter Transaksi:**
- Semua / Pending / Completed / Terpakai / Cancelled

---

### 6. 📈 Reports & Analytics

Aplikasi menyediakan 4 jenis laporan:

**A. Member Report**
- Total member & member aktif
- Total poin semua member
- Rata-rata poin per member
- Distribusi member per tier (chart)
- Top 10 member berdasarkan poin

**B. Points Report**
- Total poin diterbitkan
- Total poin diredeem
- Total poin kadaluarsa
- Poin bersih (nett)
- 10 Transaksi poin terbaru

**C. Voucher Report**
- Total voucher (all status)
- Voucher aktif
- Total stok tersedia
- Total kali diredeem
- Top 10 voucher paling populer

**D. Redeem Report**
- Total transaksi redeem
- Distribusi status (Pending/Completed/Used/Cancelled)
- Total poin yang digunakan untuk redeem
- Visualisasi chart distribusi

**Export & Print:**
- Klik tombol "🖨️ Print" untuk print report
- Klik tombol "📥 Export" untuk export (coming soon)

---

## 💡 Tips Penggunaan

### Flow Penggunaan Normal:

1. **Setup Member** (Member Management)
   - Tambah data pelanggan
   - Set tier level sesuai status

2. **Beri Poin** (Poin Management)
   - Tambah poin saat customer belanja
   - Tipe: "Dapat Poin"
   - Contoh: Belanja Rp 1.000.000 = 100 poin

3. **Buat Voucher** (Voucher Management)
   - Buat voucher menarik
   - Set biaya poin untuk redeem

4. **Customer Redeem** (Redeem Management)
   - Customer tukar poin dengan voucher
   - Sistem otomatis kurangi poin & stok

5. **Monitor** (Dashboard & Reports)
   - Pantau statistik
   - Lihat member teraktif
   - Analisis voucher populer

### Best Practices:

✅ **Member:**
- Update tier secara berkala berdasarkan total poin
- Bronze: 0-500 poin
- Silver: 501-1000 poin
- Gold: 1001-2000 poin
- Platinum: 2000+ poin

✅ **Poin:**
- Gunakan deskripsi yang jelas
- Contoh: "Pembelian produk X senilai Rp 500.000"
- Bukan: "Belanja"

✅ **Voucher:**
- Buat kode yang mudah diingat (DISKON20, CASHBACK50K)
- Set periode berlaku dengan bijak
- Monitor stok agar tidak habis

✅ **Redeem:**
- Validasi voucher sebelum customer gunakan
- Update status dari Completed → Used setelah dipakai
- Batalkan jika customer tidak jadi pakai

---

## ⚙️ Pengaturan & Kustomisasi

### Mengubah Warna Tema:
Edit file `src/app.css`, ubah CSS variables:
```css
:root {
	--primary-color: #3b82f6;  /* Ubah warna utama */
	--secondary-color: #10b981; /* Ubah warna sukses */
	/* ... dan lainnya */
}
```

### Mengubah Tier System:
Edit file `src/lib/stores/data.ts` dan component terkait

### Menambah Validasi:
Edit fungsi helper di `src/lib/stores/data.ts`

---

## 🔧 Troubleshooting

**Q: Data hilang setelah refresh?**
A: Data disimpan di memori (in-memory), akan reset saat refresh. Untuk production, integrasikan dengan database.

**Q: Tidak bisa redeem voucher?**
A: Cek:
- Poin member mencukupi?
- Stok voucher masih ada?
- Voucher masih active?

**Q: Transaksi poin tidak muncul?**
A: Pastikan sudah pilih member dan isi semua field yang wajib (required)

**Q: Filter tidak bekerja?**
A: Refresh halaman, atau hapus cache browser

---

## 📱 Kompatibilitas

Aplikasi telah ditest pada:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Opera

Resolusi yang didukung:
- Desktop: 1920x1080, 1366x768, 1440x900
- Tablet: 768x1024, 1024x768
- Mobile: 375x667, 414x896, 360x640

---

## 🆘 Bantuan

Jika mengalami kendala:
1. Cek console browser (F12)
2. Refresh halaman
3. Coba di browser lain
4. Hapus cache browser

---

**Selamat menggunakan aplikasi CRM! 🎉**
