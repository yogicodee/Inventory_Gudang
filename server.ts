import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Default Seed Database State
const DEFAULT_DB = {
  users: [
    { id: 'U01', username: 'admin', password: 'admin', role: 'admin', name: 'Supervisor Ferswit' },
    { id: 'U02', username: 'operator', password: 'operator', role: 'operator', name: 'Dani Operator Scan' },
    { id: 'U03', username: 'reseller', password: 'reseller', role: 'reseller', name: 'CV. Herbal Sejana' }
  ],
  products: [
    { id: 'P01', name: 'SEGERS WARAS 1 PCS', barcode: '8993006718228', category: 'Minuman Herbal', price: 15000, hpp: 10000, current_stock: 370, warehouse_stocks: { G01: 140, G02: 230 } },
    { id: 'P02', name: 'FERGANIC SAFFRON TEA', barcode: '8993006718105', category: 'Saffron', price: 35000, hpp: 22000, current_stock: 450, warehouse_stocks: { G01: 300, G02: 150 } },
    { id: 'P03', name: 'BIO SEHAT PROBIOTIK', barcode: '8993006718551', category: 'Premium Blend', price: 75000, hpp: 48000, current_stock: 120, warehouse_stocks: { G01: 80, G02: 40 } },
    { id: 'P04', name: 'MADU MURNI FERSWIT', barcode: '8993006718902', category: 'Minuman Herbal', price: 120000, hpp: 85000, current_stock: 15, warehouse_stocks: { G01: 5, G02: 10 } }
  ],
  warehouses: [
    { id: 'G01', name: 'Gudang CV. Ferswit Niaga Bersama', address: 'Kawasan Industri Candi Blok A-2, Semarang', manager: 'Hardi Sasongko' },
    { id: 'G02', name: 'Gudang PT Ferswit Indonesia Sehat', address: 'Jl. Industri Tekstil No. 44, Jakarta Pusat', manager: 'Rian Syahputra' }
  ],
  locations: [
    { id: 'L01', warehouse_id: 'G01', name: 'Gudang Belakang' },
    { id: 'L02', warehouse_id: 'G01', name: 'Gudang Tengah' },
    { id: 'L03', warehouse_id: 'G02', name: 'Rak Depan Sektor A2' }
  ],
  stores: [
    { id: 'S01', name: 'Sample_Ferswit Official' },
    { id: 'S02', name: 'Sample_Ferganic Official' }
  ],
  raw_materials: [
    { id: 'M01', name: 'Karton Kardus Box Ferswit', unit: 'Pcs', stock: 4500, min_stock: 1000, value_per_unit: 1800 },
    { id: 'M02', name: 'Lakban Coklat J&T Tape', unit: 'Roll', stock: 120, min_stock: 50, value_per_unit: 14000 },
    { id: 'M03', name: 'Silica Gel Moisture absorber', unit: 'Gram', stock: 80, min_stock: 200, value_per_unit: 800 },
    { id: 'M04', name: 'Botol Plastik 250ml Clear', unit: 'Pcs', stock: 2400, min_stock: 500, value_per_unit: 1200 }
  ],
  scan_logs: [
    { id: 'SCL01', timestamp: '2026-06-19 09:30:11', type: 'kirim', warehouse_id: 'G01', store_id: 'S01', barcode: '8993006718228', qty: 2, resi: 'SPXID02998818818', courier: 'Shopee Express', status: 'Terkirim' },
    { id: 'SCL02', timestamp: '2026-06-19 11:24:45', type: 'return', warehouse_id: 'G02', barcode: '8993006718105', qty: 1, resi: 'RETJP55191823901', courier: 'J&T', status: 'Retur Masuk' }
  ],
  returns: [
    { id: 'RET01', resi: 'RETJP55191823901', date_received: '2026-06-19', sender: 'Ibu Sri Rahayu', qty: 1, courier: 'J&T', product_id: 'P02', reason: 'Alamat Tidak Ditemukan (RTS)', status: 'Pending' }
  ],
  claims: [
    { id: 'CLM01', resi: 'JNT90118818818', date: '2026-06-19', courier: 'J&T', status: 'Pending', value: 85000, notes: 'Pecah tertumpuk kardus berat di mobil transit' }
  ],
  purchase_orders: [
    { id: 'PO01', supplier_name: 'PT Saffron Organik International', date: '2026-06-19', status: 'Draft', items: [{ name: 'Saffron Premium Buds Raw', qty: 500, price: 15000 }] }
  ],
  packing_requests: [
    { id: 'PR01', requester: 'Dani Ramadhan (Meja 04)', date: '2026-06-19', item_name: 'Lakban Coklat J&T Tape', qty_requested: 5, status: 'Pending' }
  ],
  tempo_applies: [
    { id: 'TA01', reseller_name: 'CV. Herbal Sejahtera', amount: 15000000, status: 'Pending', invoice_date: '2026-06-19', due_date: '2026-07-19' }
  ],
  marketing_kits: [
    { id: 'MK01', title: 'Banner Konten Promosi Ramadhan', category: 'Instagram Feed Post', fileUrl: '#', downloadCount: 42 },
    { id: 'MK02', title: 'Product Catalog Lengkap Ferswit PDF', category: 'E-Catalog File', fileUrl: '#', downloadCount: 155 }
  ]
};

// Helper read/write db.json
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_DB;
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------------- API ENDPOINTS ----------------

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'username atau password salah!' });
  }
});

// GET database state
app.get('/api/db', (req, res) => {
  res.json(readDB());
});

// Products: Add
app.post('/api/products', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newProduct = {
    id: 'P' + (db.products.length + 1).toString().padStart(2, '0'),
    ...payload
  };
  db.products.push(newProduct);
  writeDB(db);
  res.json({ success: true, product: newProduct });
});

// Products: Edit
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const db = readDB();
  db.products = db.products.map((p: any) => p.id === id ? { ...p, ...payload } : p);
  writeDB(db);
  res.json({ success: true });
});

// Products: Delete
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.products = db.products.filter((p: any) => p.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Warehouses setup
app.post('/api/warehouses', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newWh = {
    id: 'G' + (db.warehouses.length + 1).toString().padStart(2, '0'),
    ...payload
  };
  db.warehouses.push(newWh);
  writeDB(db);
  res.json({ success: true, warehouse: newWh });
});

app.put('/api/warehouses/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const db = readDB();
  db.warehouses = db.warehouses.map((w: any) => w.id === id ? { ...w, ...payload } : w);
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/warehouses/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.warehouses = db.warehouses.filter((w: any) => w.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Locations (Sub-rack mapping)
app.post('/api/locations', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newLoc = {
    id: 'L' + (db.locations.length + 1).toString().padStart(2, '0'),
    ...payload
  };
  db.locations.push(newLoc);
  writeDB(db);
  res.json({ success: true, location: newLoc });
});

app.delete('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.locations = db.locations.filter((l: any) => l.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Raw materials
app.post('/api/raw_materials', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newMat = {
    id: 'M' + (db.raw_materials.length + 1).toString().padStart(2, '0'),
    ...payload
  };
  db.raw_materials.push(newMat);
  writeDB(db);
  res.json({ success: true, material: newMat });
});

app.put('/api/raw_materials/:id', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const db = readDB();
  db.raw_materials = db.raw_materials.map((m: any) => m.id === id ? { ...m, stock } : m);
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/raw_materials/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.raw_materials = db.raw_materials.filter((m: any) => m.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Scanning Action: handles real stock reductions!
app.post('/api/scans', (req, res) => {
  const { type, warehouse_id, store_id, barcode, qty, resi, courier, status } = req.body;
  const db = readDB();

  // Find product matching barcode
  const productIndex = db.products.findIndex((p: any) => p.barcode === barcode);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Barcode produk tidak ditemukan!' });
  }

  const p = db.products[productIndex];
  
  if (type === 'kirim') {
    const currentWhQty = p.warehouse_stocks[warehouse_id] || 0;
    if (currentWhQty < qty) {
      return res.status(400).json({ success: false, message: 'Stok tidak mencukupi di gudang terpilih!' });
    }
    // Deduct stock
    p.warehouse_stocks[warehouse_id] = currentWhQty - qty;
    p.current_stock -= qty;
  } else if (type === 'return') {
    // Add stock on return
    const currentWhQty = p.warehouse_stocks[warehouse_id] || 0;
    p.warehouse_stocks[warehouse_id] = currentWhQty + qty;
    p.current_stock += qty;
  }

  // Create scan log entry
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newLog = {
    id: 'SCL' + (db.scan_logs.length + 1).toString().padStart(3, '0'),
    timestamp: nowStr,
    type,
    warehouse_id,
    store_id,
    barcode,
    product_name: p.name,
    qty,
    resi,
    courier,
    status
  };

  db.scan_logs.unshift(newLog); // prepend newest logs
  writeDB(db);

  res.json({ success: true, log: newLog, product: p });
});

app.post('/api/scans/clear', (req, res) => {
  const db = readDB();
  db.scan_logs = [];
  writeDB(db);
  res.json({ success: true });
});

// Returns & Claims Handlers
app.post('/api/returns', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newReturn = {
    id: 'RET' + (db.returns.length + 1).toString().padStart(2, '0'),
    ...payload
  };
  db.returns.unshift(newReturn);
  writeDB(db);
  res.json({ success: true, return: newReturn });
});

app.put('/api/returns/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  
  const retIndex = db.returns.findIndex((r: any) => r.id === id);
  if (retIndex !== -1) {
    db.returns[retIndex].status = status;

    // If marked as Selesai (Restocked), find the first warehouse (G01) and add to stock
    if (status === 'Selesai') {
      const returnObj = db.returns[retIndex];
      const pIndex = db.products.findIndex((p: any) => p.id === returnObj.product_id);
      if (pIndex !== -1) {
        const prod = db.products[pIndex];
        // Select G01 primarily for restock
        const primaryWh = 'G01';
        prod.warehouse_stocks[primaryWh] = (prod.warehouse_stocks[primaryWh] || 0) + returnObj.qty;
        prod.current_stock += returnObj.qty;
      }
    }
  }

  writeDB(db);
  res.json({ success: true });
});

app.post('/api/claims', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newClaim = {
    id: 'CLM' + (db.claims.length + 1).toString().padStart(2, '0'),
    date: new Date().toISOString().split('T')[0],
    ...payload
  };
  db.claims.unshift(newClaim);
  writeDB(db);
  res.json({ success: true, claim: newClaim });
});

app.put('/api/claims/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  db.claims = db.claims.map((c: any) => c.id === id ? { ...c, status } : c);
  writeDB(db);
  res.json({ success: true });
});

// Purchase orders (Supplier procurement)
app.post('/api/purchase_orders', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newPO = {
    id: 'PO' + (db.purchase_orders.length + 1).toString().padStart(2, '0'),
    date: new Date().toISOString().split('T')[0],
    ...payload
  };
  db.purchase_orders.unshift(newPO);
  writeDB(db);
  res.json({ success: true, order: newPO });
});

app.put('/api/purchase_orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();

  const poIdx = db.purchase_orders.findIndex((p: any) => p.id === id);
  if (poIdx !== -1) {
    db.purchase_orders[poIdx].status = status;

    // If received, automatically supplement appropriate material stocks!
    if (status === 'Received') {
      const items = db.purchase_orders[poIdx].items;
      items.forEach((poItem: any) => {
        // Try matching poItem.name to existing raw materials
        const matIdx = db.raw_materials.findIndex((m: any) => m.name.toLowerCase().includes(poItem.name.toLowerCase()));
        if (matIdx !== -1) {
          db.raw_materials[matIdx].stock += poItem.qty;
        }
      });
    }
  }

  writeDB(db);
  res.json({ success: true });
});

// Packing tools internal requests
app.post('/api/packing_requests', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const newReq = {
    id: 'PR' + (db.packing_requests.length + 1).toString().padStart(2, '0'),
    date: new Date().toISOString().split('T')[0],
    ...payload
  };
  db.packing_requests.unshift(newReq);
  writeDB(db);
  res.json({ success: true, request: newReq });
});

app.put('/api/packing_requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  const reqIdx = db.packing_requests.findIndex((r: any) => r.id === id);
  if (reqIdx !== -1) {
    db.packing_requests[reqIdx].status = status;
    
    // Deduct raw material stock on Disetujui!
    if (status === 'Disetujui') {
      const reqObj = db.packing_requests[reqIdx];
      const matIdx = db.raw_materials.findIndex((m: any) => m.name === reqObj.item_name);
      if (matIdx !== -1) {
        db.raw_materials[matIdx].stock = Math.max(0, db.raw_materials[matIdx].stock - reqObj.qty_requested);
      }
    }
  }
  writeDB(db);
  res.json({ success: true });
});

// Tempo credit limit reseller applications
app.post('/api/tempo', (req, res) => {
  const payload = req.body;
  const db = readDB();
  const now = new Date();
  const fut = new Date();
  fut.setDate(fut.getDate() + 30);

  const newTA = {
    id: 'TA' + (db.tempo_applies.length + 1).toString().padStart(2, '0'),
    invoice_date: now.toISOString().split('T')[0],
    due_date: fut.toISOString().split('T')[0],
    ...payload
  };
  db.tempo_applies.unshift(newTA);
  writeDB(db);
  res.json({ success: true, tempo: newTA });
});

app.put('/api/tempo/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  db.tempo_applies = db.tempo_applies.map((t: any) => t.id === id ? { ...t, status } : t);
  writeDB(db);
  res.json({ success: true });
});

// Marketing kits downloads counting increments
app.post('/api/marketing_kits/download', (req, res) => {
  const { id } = req.body;
  const db = readDB();
  db.marketing_kits = db.marketing_kits.map((k: any) => k.id === id ? { ...k, downloadCount: k.downloadCount + 1 } : k);
  writeDB(db);
  res.json({ success: true });
});

// ---------- MOUNT VITE MIDDLEWARE OR SERVE PRODUCTION ----------

async function startServer() {
  // Vite dev setting
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gudang Ferswit server booted on http://localhost:${PORT}`);
  });
}

startServer();
