# Stellar Testnet dApp — White Belt Challenge

Repo ini berisi submission untuk **Stellar White Belt Challenge**, mencakup **Level 1** (payment dApp sederhana) dan **Level 2** (multi-wallet app dengan smart contract).

---

## Level 1 — Simple Payment dApp

Aplikasi dApp sederhana di jaringan **Stellar Testnet** yang memungkinkan pengguna menghubungkan wallet Freighter, melihat saldo XLM mereka, dan mengirim transaksi XLM ke alamat lain.

### Fitur

- 🔌 Connect & disconnect wallet Freighter
- 💰 Menampilkan saldo XLM dari wallet yang terhubung
- 🚰 Fund wallet baru via Friendbot (testnet) langsung dari UI
- 💸 Mengirim transaksi XLM ke alamat tujuan
- ✅ Feedback status transaksi (sukses/gagal) beserta hash transaksi dan link ke Stellar Expert

### Tech Stack

- HTML + JavaScript murni (ES modules), tanpa build step/bundler
- [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api) — integrasi wallet Freighter (dimuat via cdnjs)
- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) — membangun & submit transaksi ke Stellar Horizon (dimuat via cdnjs)
- Stellar Testnet Horizon: `https://horizon-testnet.stellar.org`

### Setup & Cara Menjalankan Lokal

**Prasyarat:**
1. Browser desktop (Chrome/Firefox/Brave) yang mendukung extension
2. Extension [Freighter Wallet](https://www.freighter.app/) sudah terpasang dan dikonfigurasi ke **Testnet**
3. VS Code dengan extension **Live Server** (atau alternatif serve HTTP lainnya)

**Langkah:**
```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>/frontend
```
1. Buka folder `frontend/` di VS Code.
2. Klik kanan `index.html` → **Open with Live Server**.
3. Browser akan terbuka otomatis di `http://127.0.0.1:5500/` (atau port serupa).
4. Pastikan Freighter extension sudah aktif dan network-nya di-set ke **Testnet**.
5. Klik **Connect Freighter Wallet**, approve koneksi di popup Freighter.
6. Kalau saldo menunjukkan "Akun belum ter-fund", klik **Fund via Friendbot**.
7. Isi alamat tujuan dan jumlah, klik **Kirim XLM**, lalu approve transaksi di popup Freighter.

> Catatan: karena ES modules tidak bisa dijalankan lewat `file://`, wajib diakses melalui server HTTP lokal (Live Server) — bukan dibuka langsung dengan double-click file.

### Screenshots — Level 1

**Wallet Connected State**
<img width="956" height="609" alt="image" src="https://github.com/user-attachments/assets/43ad4e80-c374-475a-b079-47521a482e13" />

**Balance Displayed**
<img width="1916" height="759" alt="image" src="https://github.com/user-attachments/assets/65369a5e-5843-4831-992f-9d0ca78fbe44" />

**Successful Testnet Transaction**
<img width="1191" height="825" alt="image" src="https://github.com/user-attachments/assets/e12f912d-3ed3-4170-8662-b992e9000b21" />

**Transaction Result Shown to User**
<img width="763" height="881" alt="image" src="https://github.com/user-attachments/assets/12c13bdf-1f5e-498d-ab86-a601b72a3c0e" />

---

## Level 2 — Payment Tracker (Multi-Wallet + Smart Contract)

Lanjutan dari Level 1: sekarang menggunakan **smart contract Soroban** yang ter-deploy di testnet, mendukung **banyak pilihan wallet** (bukan cuma Freighter), dan menampilkan status pembayaran secara **real-time**.

### Fitur

- 🔗 Multi-wallet connect (Freighter, xBull, Albedo, dll) via Stellar Wallets Kit
- 📝 Mencatat pembayaran (`record_payment`) ke smart contract di testnet
- 📊 Membaca data pembayaran tersimpan (`get_payment`) langsung dari contract
- 🔄 Live status yang auto-update tiap 5 detik (polling ke contract)
- ⚠️ Error handling untuk 3 skenario: wallet belum terhubung, input tidak valid, dan kegagalan transaksi/network
- ✅ Status transaksi visible (pending → success/fail) beserta tx hash dan link ke Stellar Expert

### Smart Contract

- **Bahasa**: Rust (Soroban SDK)
- **Contract ID (testnet)**: `CDY45CNG3GCN75L4Z77HOIYWAF57A3FQSL43TA3OQQRX4IBVBEW3EFA3`
- **Fungsi**: `record_payment(sender, amount, status)`, `get_payment(sender)`
- Source: `contracts/notes/src/lib.rs`

### Tech Stack

- Vite + vanilla JavaScript
- [`@creit.tech/stellar-wallets-kit`](https://www.npmjs.com/package/@creit.tech/stellar-wallets-kit) — multi-wallet connect
- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) — pemanggilan contract & transaksi
- [`vite-plugin-node-polyfills`](https://www.npmjs.com/package/vite-plugin-node-polyfills) — polyfill Node.js untuk browser
- Stellar Soroban RPC Testnet: `https://soroban-testnet.stellar.org`

### Setup & Cara Menjalankan Lokal

```bash
git clone https://https://github.com/Daorza/stellar-itechno.git
cd <repo>/frontend-l2
npm install
npm run dev
```
1. Buka URL yang muncul di terminal (default `http://localhost:5173`).
2. Klik **Connect Wallet** → pilih wallet dari modal yang muncul (butuh salah satu extension wallet Stellar terpasang, misal Freighter) → approve.
3. Isi jumlah & status, klik **Record Payment** → approve transaksi di wallet.
4. Tunggu hasil sukses beserta tx hash muncul.
5. Klik **Lihat Payment Tersimpan**, atau lihat langsung di bagian **Live status** yang auto-update.

> Catatan: contract sudah ter-deploy sebelumnya ke testnet menggunakan Rust + Stellar CLI di [GitHub Codespaces](https://github.com/features/codespaces) (untuk menghindari isu Windows Smart App Control saat compile lokal).

### Deployed Contract & Transaction Proof

- **Contract Address**: `CDY45CNG3GCN75L4Z77HOIYWAF57A3FQSL43TA3OQQRX4IBVBEW3EFA3`
- **Transaction hash (contract call dari frontend)**: `e4481fbf823bcb65e8ef34c6a836a14f9968974656648fa043e4487f110f9f0c`
  - Verifikasi: `https://stellar.expert/explorer/testnet/tx/e4481fbf823bcb65e8ef34c6a836a14f9968974656648fa043e4487f110f9f0c`

### Screenshots — Level 2

**Wallet Options Available**
<img width="1890" height="841" alt="image" src="https://github.com/user-attachments/assets/00be72eb-6d6f-4616-9395-eaa3a3fc6c5b" />

**Deployed Contract (Stellar Expert)**
<img width="1919" height="870" alt="image" src="https://github.com/user-attachments/assets/7b807a1d-b057-4efd-b7f6-c4549fd616b8" />

**Successful Contract Call & Transaction Status**
<img width="1919" height="854" alt="image" src="https://github.com/user-attachments/assets/f79311c7-9da6-49b2-8167-3b23fc43231e" />

---

## Struktur Project

```
.
├── contracts/
│   └── notes/            # Smart contract Soroban (dipakai di Level 2)
├── frontend/              # dApp Level 1 — payment XLM sederhana
│   ├── index.html
│   └── app.js
├── frontend-l2/           # dApp Level 2 — multi-wallet + contract call
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       └── main.js
└── README.md
```

## Catatan Pengembangan

- Level 1 memakai library lewat cdnjs (UMD script) tanpa bundler, karena environment awal (Soroban Studio) tidak mendukung `npm install`.
- Level 2 memakai Vite + npm karena kebutuhan multi-wallet library yang lebih kompleks; smart contract di-build & deploy lewat GitHub Codespaces untuk menghindari isu Windows Smart App Control saat compile Rust secara lokal.
- Semua transaksi berjalan di **Stellar Testnet**, tidak menyentuh mainnet.
