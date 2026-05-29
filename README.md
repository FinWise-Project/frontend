# FinWise — Finance App (Next.js)

Aplikasi manajemen keuangan pribadi berbasis Next.js 14 dengan fitur Login & Register.

## 🚀 Cara Menjalankan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka browser
http://localhost:3000
```

## 📦 Deploy ke Vercel (Gratis)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy
vercel --prod
```

Atau upload folder ini langsung ke [vercel.com](https://vercel.com) via drag & drop.

## 🌐 Deploy ke Netlify

```bash
# Build dulu
npm run build

# Upload folder .next ke netlify.com
```

## 🔐 Akun Demo

Klik tombol **"Coba dengan Akun Demo"** di halaman login untuk masuk langsung tanpa daftar.

Atau daftar akun baru lewat halaman Register.

> **Catatan:** Data user disimpan di localStorage browser (client-side). Untuk production dengan database sungguhan, integrasikan dengan NextAuth.js + database pilihan kamu (PostgreSQL, MongoDB, dll).

## 📁 Struktur Folder

```
finwise/
├── app/
│   ├── globals.css          # Semua styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Redirect ke login/dashboard
│   ├── login/               # Halaman Login
│   ├── register/            # Halaman Register
│   └── dashboard/           # Halaman utama app
├── components/
│   ├── pages/               # Semua halaman (Dashboard, Transaksi, dll)
│   ├── DashboardLayout.tsx  # Layout utama + modal tambah transaksi
│   ├── Sidebar.tsx          # Navigasi kiri
│   ├── Topbar.tsx           # Header + notifikasi
│   ├── Modal.tsx            # Komponen modal reusable
│   └── Toast.tsx            # Notifikasi toast
└── lib/
    └── AuthContext.tsx      # State manajemen autentikasi
```

## ✨ Fitur

- 🔐 Login & Register dengan validasi
- 📊 Dashboard dengan 3 tab (Ringkasan, Bulanan, Tahunan)
- 💳 Transaksi dengan filter & CRUD
- 📈 Analisis keuangan dengan chart
- 🤖 Prediksi AI (simulasi)
- 💰 Budget per kategori dengan progress bar
- 📄 Laporan & export (simulasi)
- 👤 Profil & pengaturan notifikasi
- 🔔 Panel notifikasi
- 🌙 Dark mode (default)
