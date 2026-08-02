<img width="1337" height="653" alt="image" src="https://github.com/user-attachments/assets/bebab30c-1473-4f8d-8e3e-642ac3558889" />
-----------------------------------------------------------------------------------------------------------------------------------
<img width="1359" height="654" alt="image" src="https://github.com/user-attachments/assets/1c0db9f1-7561-4ac5-8b4f-24e0beaac3d0" />
-----------------------------------------------------------------------------------------------------------------------------------
<img width="1354" height="653" alt="image" src="https://github.com/user-attachments/assets/4b88ff8f-9594-4fea-94d0-58419c8fa412" />
-----------------------------------------------------------------------------------------------------------------------------------

# Gudang Ferswit — Warehouse Management System (WMS)

Sistem Manajemen Gudang (WMS) untuk **Ferswit** — solusi multi-gudang dengan scanning resi real-time, manajemen inventori & bahan baku, tracking return/klaim, procurement (PO), portal reseller, dan pelaporan.

Aplikasi berupa React 19 SPA yang di-serve oleh server Express. Data disimpan pada file JSON sederhana (`db.json`) yang otomatis dibuat dari seed default saat pertama dijalankan — jadi tidak perlu setup database eksternal.

## Fitur Utama

- **Autentikasi & Role (RBAC)** — 3 peran: `admin`, `operator`, dan `reseller`. Menu sidebar difilter otomatis sesuai peran.
- **Scanner Multi-Gudang** — scan resi untuk `kirim` (mengurangi stok gudang terpilih) atau `return` (menambah stok), lengkap dengan log transaksi.
- **Master SKU & Harga** — CRUD produk beserta barcode, kategori, harga jual, HPP, dan stok per gudang (`warehouse_stocks`).
- **Manajemen Gudang & Rak** — kelola gudang beserta pemetaan lokasi/rak (locations).
- **Inventori Bahan Baku** — kelola raw material (kardus, lakban, dsb.) dengan stok minimum.
- **Return (RTS) & Klaim** — dokumentasi return; menandai return `Selesai` otomatis me-restock ke gudang utama (G01). Klaim kerusakan ke kurir.
- **Purchase Order & Packing Request** — PO ke supplier; status `Received` otomatis menambah stok material yang cocok. Permohonan alat packing; status `Disetujui` otomatis mengurangi stok bahan.
- **Portal Reseller** — pengajuan limit tempo (kredit) dan unduhan marketing kit.
- **Laporan & Pelacakan** — riwayat scan dan pelacakan resi.

## Tech Stack

| Layer     | Teknologi |
|-----------|-----------|
| Frontend  | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion (`motion`), lucide-react |
| Backend   | Express 4, dijalankan via `tsx` (dev) / esbuild bundle (prod) |
| Data      | File `db.json` (auto-seed, tidak perlu DB eksternal) |
| AI (opsional) | `@google/genai` (Gemini) — memerlukan `GEMINI_API_KEY` |

## Struktur Proyek

```
Inventory_Gudang/
├── server.ts          # Server Express + seluruh REST API + seed db.json
├── index.html         # Entry HTML
├── vite.config.ts     # Konfigurasi Vite (middleware mode di dev)
├── src/
│   ├── main.tsx       # Bootstrap React
│   ├── App.tsx        # Root: auth, state global, routing tab, semua handler API
│   ├── types.ts       # Definisi TypeScript untuk seluruh entitas
│   └── components/     # Dashboard, Scanner, Products, Warehouses,
│                       # Inventory, Returns, PurchaseOrders, Resellers, dst.
└── .env.example
```
## Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+.

```bash
# 1. Install dependency
npm install

# 2. (Opsional) siapkan environment
cp .env.example .env      # isi GEMINI_API_KEY bila memakai fitur AI

# 3. Jalankan mode development
npm run dev
```
Buka http://localhost:3000. File `db.json` akan dibuat otomatis saat request pertama.

### Script yang tersedia

| Script          | Fungsi |
|-----------------|--------|
| `npm run dev`   | Menjalankan server Express + Vite (middleware mode) di port 3000 |
| `npm run build` | Build frontend (Vite) dan bundle server ke `dist/server.cjs` |
| `npm start`     | Menjalankan hasil build (`NODE_ENV=production`) |
| `npm run lint`  | Type-check dengan `tsc --noEmit` |

## Kredensial Demo

| Peran        | Username   | Password   |
|--------------|------------|------------|
| Super Admin  | `admin`    | `admin`    |
| Scan Operator| `operator` | `operator` |
| Reseller     | `reseller` | `reseller` |

> ⚠️ Password disimpan sebagai plaintext di `db.json` — ini murni untuk demo/prototipe, **jangan** dipakai di produksi.

## Ringkasan REST API

Seluruh endpoint di-handle oleh [`server.ts`](server.ts).

| Method & Endpoint                     | Keterangan |
|---------------------------------------|------------|
| `POST /api/login`                     | Autentikasi user |
| `GET /api/db`                         | Ambil seluruh state database |
| `POST/PUT/DELETE /api/products/:id?`  | CRUD produk |
| `POST/PUT/DELETE /api/warehouses/:id?`| CRUD gudang |
| `POST/DELETE /api/locations/:id?`     | Tambah/hapus lokasi rak |
| `POST/PUT/DELETE /api/raw_materials/:id?` | CRUD bahan baku |
| `POST /api/scans`                     | Aksi scan kirim/return (mengubah stok) |
| `POST /api/scans/clear`               | Kosongkan riwayat scan |
| `POST/PUT /api/returns/:id?`          | Buat/update return (`Selesai` = restock) |
| `POST/PUT /api/claims/:id?`           | Buat/update klaim kerusakan |
| `POST/PUT /api/purchase_orders/:id?`  | Buat/update PO (`Received` = tambah stok) |
| `POST/PUT /api/packing_requests/:id?` | Permohonan packing (`Disetujui` = kurangi stok) |
| `POST/PUT /api/tempo/:id?`            | Pengajuan/keputusan limit tempo reseller |
| `POST /api/marketing_kits/download`   | Increment jumlah unduhan marketing kit |

## Catatan

- `db.json` di-ignore oleh Git (lihat `.gitignore`) dan bersifat lokal per instance.
- HMR dapat dinonaktifkan lewat env `DISABLE_HMR=true` (dipakai di lingkungan AI Studio).




