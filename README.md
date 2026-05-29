# FinWise — Finance App (Next.js)

Aplikasi manajemen keuangan pribadi berbasis Next.js 14 dengan fitur autentikasi, dashboard interaktif, analisis keuangan, budgeting, laporan, dan prediksi AI.

---

## 🚀 Cara Menjalankan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka browser
http://localhost:3000
```

---

## 📦 Deploy ke Vercel (Gratis)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy
vercel --prod
```

Atau upload project langsung ke [vercel.com](https://vercel.com).

---

## 🌐 Deploy ke Netlify

```bash
# Build project
npm run build
```

Lalu upload hasil build ke Netlify.

---

## 🔐 Fitur Autentikasi

- Login & Register user
- Validasi form
- Penyimpanan token autentikasi
- Redirect otomatis setelah login

---

## ✨ Fitur Aplikasi

- 📊 Dashboard ringkasan keuangan
- 💳 CRUD transaksi
- 📈 Analisis pemasukan & pengeluaran
- 🤖 Prediksi AI keuangan
- 💰 Budget per kategori
- 📄 Export & laporan keuangan
- 👤 Profil pengguna
- 🔔 Sistem notifikasi
- 🌙 Dark mode UI

---

## 📁 Struktur Folder

```bash
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── login/
│   │   ├── page-content.tsx
│   │   └── page.tsx
│   ├── page.tsx
│   ├── register/
│   │   ├── page-content.tsx
│   │   └── page.tsx
│   └── root-redirect.tsx
│
├── components/
│   ├── DashboardLayout.tsx
│   ├── Modal.tsx
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   ├── Topbar.tsx
│   └── pages/
│       ├── AnalisisPage.tsx
│       ├── BudgetPage.tsx
│       ├── DashboardPage.tsx
│       ├── LaporanPage.tsx
│       ├── PrediksiPage.tsx
│       ├── ProfilPage.tsx
│       └── TransaksiPage.tsx
│
├── lib/
│   ├── analysis.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── AuthContext.tsx
│   ├── budgets.ts
│   ├── category.ts
│   ├── dashboard.ts
│   ├── notification.ts
│   ├── payment-method.ts
│   ├── predict.ts
│   ├── profile.ts
│   ├── report.ts
│   ├── subcategory.ts
│   └── transaction.ts
│
├── next.config.js
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---

## 🛠️ Teknologi yang Digunakan

- Next.js 14
- React
- TypeScript
- CSS Modules / Global CSS
- Context API
- REST API Integration

---

## 🔗 API Integration

Frontend telah terhubung dengan backend API untuk:

- Authentication
- Dashboard data
- Transactions
- Budgets
- Reports
- Notifications
- AI Prediction