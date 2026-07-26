<img width="1337" height="653" alt="image" src="https://github.com/user-attachments/assets/bebab30c-1473-4f8d-8e3e-642ac3558889" />

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



