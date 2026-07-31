# Stellar Testnet Payment dApp

Aplikasi dApp sederhana di jaringan **Stellar Testnet** yang memungkinkan pengguna menghubungkan wallet Freighter, melihat saldo XLM mereka, dan mengirim transaksi XLM ke alamat lain — dibuat sebagai submission untuk **Stellar White Belt Level 1 Challenge**.

## Fitur

- 🔌 Connect & disconnect wallet Freighter
- 💰 Menampilkan saldo XLM dari wallet yang terhubung
- 🚰 Fund wallet baru via Friendbot (testnet) langsung dari UI
- 💸 Mengirim transaksi XLM ke alamat tujuan
- ✅ Feedback status transaksi (sukses/gagal) beserta hash transaksi dan link ke Stellar Expert

## Tech Stack

- HTML + JavaScript murni (ES modules), tanpa build step/bundler
- [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api) — integrasi wallet Freighter (dimuat via cdnjs)
- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) — membangun & submit transaksi ke Stellar Horizon (dimuat via cdnjs)
- Stellar Testnet Horizon: `https://horizon-testnet.stellar.org`

> Folder `contracts/` berisi smart contract Soroban (staking vault) yang dibuat terpisah sebagai eksplorasi awal, belum terhubung ke frontend ini. Frontend di folder `frontend/` murni menggunakan native XLM payment (`Operation.payment`), sesuai fokus requirement Level 1.

## Setup & Cara Menjalankan Lokal

### Prasyarat

1. Browser desktop (Chrome/Firefox/Brave) yang mendukung extension
2. Extension [Freighter Wallet](https://www.freighter.app/) sudah terpasang dan dikonfigurasi ke **Testnet**
3. VS Code dengan extension **Live Server** (atau alternatif serve HTTP lainnya)

### Langkah

1. Clone repo ini:
```bash
   git clone https://github.com/<username>/<repo>.git
   cd <repo>/frontend
```
2. Buka folder `frontend/` di VS Code.
3. Klik kanan `index.html` → **Open with Live Server**.
4. Browser akan terbuka otomatis di `http://127.0.0.1:5500/` (atau port serupa).
5. Pastikan Freighter extension sudah aktif dan network-nya di-set ke **Testnet**.
6. Klik **Connect Freighter Wallet**, approve koneksi di popup Freighter.
7. Kalau saldo menunjukkan "Akun belum ter-fund", klik **Fund via Friendbot** untuk mendapatkan testnet XLM gratis.
8. Isi alamat tujuan dan jumlah, klik **Kirim XLM**, lalu approve transaksi di popup Freighter.

> Catatan: karena ES modules tidak bisa dijalankan lewat `file://`, wajib diakses melalui server HTTP lokal (Live Server) — bukan dibuka langsung dengan double-click file.

## Screenshots

### 1. Wallet Connected State
_(masukkan screenshot di sini)_

### 2. Balance Displayed
_(masukkan screenshot di sini)_

### 3. Successful Testnet Transaction
_(masukkan screenshot di sini)_

### 4. Transaction Result Shown to User
_(masukkan screenshot di sini)_

## Struktur Project

```
.
├── contracts/          # Smart contract Soroban (belum terhubung ke frontend)
├── frontend/            # dApp — yang dinilai untuk Level 1
│   ├── index.html
│   └── app.js
└── README.md
```

## Catatan Pengembangan

- Library dimuat lewat cdnjs sebagai UMD script (bukan bundler/npm) karena environment pengembangan yang digunakan (Soroban Studio, lalu VS Code tanpa Node.js lokal) tidak mendukung `npm install`.
- Semua transaksi berjalan di **Stellar Testnet**, tidak menyentuh mainnet.