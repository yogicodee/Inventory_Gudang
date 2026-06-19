import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, LayoutDashboard, Scan, Package, Database, CornerDownLeft, 
  ShoppingCart, Users, FileText, LogOut, CheckCircle, Bell, User as UserIcon, Lock, 
  ChevronRight, AlignLeft, Shield, Sparkles, RefreshCw, Eye, EyeOff
} from 'lucide-react';

import { User, Product, Warehouse, Location, Store, ScanLog, ReturnLog, DamageClaim, PurchaseOrder, PackingToolRequest, TempoReseller, MarketingKit, RawMaterial } from './types';

// Component imports
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Products from './components/Products';
import Warehouses from './components/Warehouses';
import Inventory from './components/Inventory';
import Returns from './components/Returns';
import PurchaseOrders from './components/PurchaseOrders';
import Resellers from './components/Resellers';
import TrackingAndReports from './components/TrackingAndReports';

export default function App() {
  // Global synced states
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [returns, setReturns] = useState<ReturnLog[]>([]);
  const [claims, setClaims] = useState<DamageClaim[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [packingRequests, setPackingRequests] = useState<PackingToolRequest[]>([]);
  const [tempoApplies, setTempoApplies] = useState<TempoReseller[]>([]);
  const [marketingKits, setMarketingKits] = useState<MarketingKit[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  // Navigation / Loading controls
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Authentication Fields
  const [inputUsername, setInputUsername] = useState<string>('admin');
  const [inputPassword, setInputPassword] = useState<string>('admin');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Notifications Queue
  const [alerts, setAlerts] = useState<{ id: string; text: string; type: 'success' | 'alert' }[]>([]);

  // Sound cues (Simulated clicks / actions logs)
  const [actionsLog, setActionsLog] = useState<string[]>([]);

  // Bootstrap Load Database of server
  const fetchDatabase = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setWarehouses(data.warehouses || []);
        setLocations(data.locations || []);
        setStores(data.stores || []);
        setScans(data.scan_logs || []);
        setReturns(data.returns || []);
        setClaims(data.claims || []);
        setPurchaseOrders(data.purchase_orders || []);
        setPackingRequests(data.packing_requests || []);
        setTempoApplies(data.tempo_applies || []);
        setMarketingKits(data.marketing_kits || []);
        setRawMaterials(data.raw_materials || []);
      }
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi dengan server backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
    // Pre-check session if user was logged in
    const cachedUser = localStorage.getItem('ferswit_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  const triggerAlertMessage = (text: string, type: 'success' | 'alert' = 'success') => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, text, type }]);
    
    // Add transaction logs
    const now = new Date().toLocaleTimeString();
    setActionsLog(prev => [`[${now}] ${text}`, ...prev.slice(0, 49)]);

    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 4000);
  };

  // ---------------- OPERATIONS POST ACTIONS ----------------

  // USER AUTH LOGIN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('ferswit_user', JSON.stringify(data.user));
        triggerAlertMessage(`Selamat datang kembali, ${data.user.name}!`);
        
        // Contextually adjust tab if reseller logs in
        if (data.user.role === 'reseller') {
          setActiveTab('resellers');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        const errData = await res.json();
        setAuthError(errData.message || 'Kredensial login salah!');
      }
    } catch (err) {
      setAuthError('Gagal melakukan otorisasi login, server luring.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ferswit_user');
    triggerAlertMessage('Sesi kepengurusan telah keluar.', 'alert');
  };

  // MASTER PRODUCTS: Create SKU
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        triggerAlertMessage(`Sukses mendaftarkan SKU: ${newProd.name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleEditProduct = async (updatedProd: Product) => {
    try {
      const res = await fetch(`/api/products/${updatedProd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProd)
      });
      if (res.ok) {
        triggerAlertMessage(`Diperbarui SKU: ${updatedProd.name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerAlertMessage(`Label SKU dihapus dari database`, 'alert');
        fetchDatabase();
      }
    } catch (e){}
  };

  // WAREHOUSES management
  const handleAddWarehouse = async (newWh: Omit<Warehouse, 'id'>) => {
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWh)
      });
      if (res.ok) {
        triggerAlertMessage(`Gudang baru ditambahkan: ${newWh.name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleEditWarehouse = async (wh: Warehouse) => {
    try {
      const res = await fetch(`/api/warehouses/${wh.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wh)
      });
      if (res.ok) {
        triggerAlertMessage(`Rincian gudang ${wh.name} diupdate`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleDeleteWarehouse = async (id: string) => {
    try {
      await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
      triggerAlertMessage('Fasilitas Gudang dinonaktifkan', 'alert');
      fetchDatabase();
    } catch (e){}
  };

  // LOCATIONS
  const handleAddLocation = async (newLoc: Omit<Location, 'id'>) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoc)
      });
      if (res.ok) {
        triggerAlertMessage(`Rak baru didaftarkan di Zona: ${newLoc.name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      triggerAlertMessage('Pemetaan Rak dihapus', 'alert');
      fetchDatabase();
    } catch (e){}
  };

  // RAW MATERIALS
  const handleAddMaterial = async (newMat: Omit<RawMaterial, 'id'>) => {
    try {
      const res = await fetch('/api/raw_materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMat)
      });
      if (res.ok) {
        triggerAlertMessage(`Material ditambahkan: ${newMat.name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdateMaterialStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/raw_materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        triggerAlertMessage(`Stok material di-adjust menjadi ${newStock}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await fetch(`/api/raw_materials/${id}`, { method: 'DELETE' });
      triggerAlertMessage('Data Material dihapus', 'alert');
      fetchDatabase();
    } catch (e){}
  };

  // SCAN LOGS (Adding scanning operation!)
  const handleAddScanLog = async (newScan: Omit<ScanLog, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScan)
      });
      if (res.ok) {
        const data = await res.json();
        triggerAlertMessage(`Scanning Resi: ${newScan.resi} [${newScan.type.toUpperCase()}]`);
        fetchDatabase();
      } else {
        const data = await res.json();
        alert(`Gagal Scan: ${data.message}`);
      }
    } catch (e){}
  };

  const handleClearScans = async () => {
    if (confirm('Hapus seluruh riwayat transaksional scan di system?')) {
      try {
        await fetch('/api/scans/clear', { method: 'POST' });
        triggerAlertMessage('Seluruh riwayat scanning disekat bersih', 'alert');
        fetchDatabase();
      } catch (e){}
    }
  };

  // RETURNS & CLAIMS ACTIONS
  const handleAddReturn = async (newRet: Omit<ReturnLog, 'id'>) => {
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRet)
      });
      if (res.ok) {
        triggerAlertMessage(`Return Resi RTS ${newRet.resi} terdokumentasi`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdateReturnStatus = async (id: string, status: 'Pending' | 'Selesai' | 'Klaim') => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlertMessage(`Status Return diupdate ke ${status}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleAddClaim = async (newClaim: Omit<DamageClaim, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim)
      });
      if (res.ok) {
        triggerAlertMessage(`Lodging Klaim Logistik atas resi ${newClaim.resi}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdateClaimStatus = async (id: string, status: 'Pending' | 'Disetujui' | 'Ditolak') => {
    try {
      const res = await fetch(`/api/claims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlertMessage(`Keputusan Klaim: ${status}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  // PURCHASE ORDERS (PROCUREMENT)
  const handleAddPurchaseOrder = async (newPO: Omit<PurchaseOrder, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/purchase_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO)
      });
      if (res.ok) {
        triggerAlertMessage(`PO Baru dibuat untuk Supplier: ${newPO.supplier_name}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdatePOSetStatus = async (id: string, status: 'Draft' | 'Sent' | 'Received') => {
    try {
      const res = await fetch(`/api/purchase_orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlertMessage(`Alur PO diupdate ke status: ${status}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  // PACKING MATERIAL REQUESTS
  const handleAddPackingRequest = async (newReq: Omit<PackingToolRequest, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/packing_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
      if (res.ok) {
        triggerAlertMessage(`Permohonan packing dikirim oleh ${newReq.requester}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdatePackingRequestStatus = async (id: string, status: 'Pending' | 'Disetujui' | 'Ditolak') => {
    try {
      const res = await fetch(`/api/packing_requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlertMessage(`Status Permohonan Meja Kerja: ${status}`);
        fetchDatabase();
      }
    } catch (e){}
  };

  // RESELLERS TEMPO CREDIT LIMIT
  const handleAddTempoApply = async (newTA: Omit<TempoReseller, 'id' | 'invoice_date' | 'due_date'>) => {
    try {
      const res = await fetch('/api/tempo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTA)
      });
      if (res.ok) {
        triggerAlertMessage(`Pengajuan limit ${newTA.reseller_name} didaftarkan`);
        fetchDatabase();
      }
    } catch (e){}
  };

  const handleUpdateTempoStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/tempo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlertMessage(`Status piutang tempo reseller di-update (${status})`);
        fetchDatabase();
      }
    } catch (e){}
  };

  // MARKETING KIT CLICK INCREMENT
  const handleDownloadKit = async (id: string) => {
    try {
      const res = await fetch('/api/marketing_kits/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        triggerAlertMessage('Link File Aset Terunduh Berhasil!');
        fetchDatabase();
      }
    } catch (e){}
  };

  // ---------------- RENDERING LOGIC ----------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 gap-4 select-none">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
          <RefreshCw size={48} className="text-indigo-500" />
        </motion.div>
        <div>
          <h2 className="font-bold text-lg text-slate-200">Gudang Ferswit WMS</h2>
          <p className="text-slate-500 text-xs">Memulai integrasi alur database...</p>
        </div>
      </div>
    );
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        
        {/* Glow ambient design backdrops */}
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-indigo-900 rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-900 rounded-full blur-[120px] opacity-25 pointer-events-none" />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10"
        >
          {/* Brand header */}
          <div className="p-8 text-center bg-radial from-indigo-900/40 via-indigo-950/20 to-transparent border-b border-slate-800/80">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-600/35 mx-auto flex items-center justify-center mb-4">
              <Building size={32} className="text-white" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center justify-center gap-1.5 font-sans">
              GUDANG FERSWIT <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">WMS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2">Masuk ke sistem kepengurusan logistik multi-gudang terverifikasi</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
            {authError && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-3 bg-red-950/30 border border-red-900 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                <Lock size={14} className="text-red-400" />
                <span>{authError}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Pengguna (Username)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full text-xs font-bold p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  required
                />
                <UserIcon size={14} className="absolute right-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kata Sandi (Password)</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-bold p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl shadow-lg transition-all focus:outline-hidden cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield size={14} /> Masuk ke Dashboard
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Kredensial Demo Cepat:</span>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  onClick={() => { setInputUsername('admin'); setInputPassword('admin'); }}
                  className="text-[10px] py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded-lg text-center"
                >
                  Super Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => { setInputUsername('operator'); setInputPassword('operator'); }}
                  className="text-[10px] py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded-lg text-center"
                >
                  Scan Operator
                </button>
                <button 
                  type="button" 
                  onClick={() => { setInputUsername('reseller'); setInputPassword('reseller'); }}
                  className="text-[10px] py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded-lg text-center"
                >
                  Reseller Portal
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // MAIN LAYOUT
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-700">
      
      {/* ALERTS POPUP STACK */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {alerts.map(a => (
            <motion.div 
              key={a.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className={`p-3 rounded-lg shadow-md border text-xs font-medium flex items-center gap-2 pointer-events-auto ${
                a.type === 'success' ? 'bg-white border-slate-200 text-indigo-900 animate-fade-in' : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <CheckCircle size={16} className={a.type === 'success' ? 'text-indigo-600' : 'text-red-500'} />
              <span>{a.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* LEFT SIDEBAR PANEL */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-70 bg-slate-900 text-slate-200 shrink-0 min-h-screen flex flex-col justify-between border-r border-slate-800 z-30 select-none overflow-hidden"
          >
            <div>
              {/* Logo Brand */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-950/20 flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-600 rounded">
                  <Building size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#f8fafc] text-sm tracking-tight">GUDANG FERSWIT</h2>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Multi-Warehouse WMS</p>
                </div>
              </div>

              {/* Navigation Menu Grid */}
              <div className="p-4 space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">OPERASIONAL UTAMA</p>

                {/* Tab buttons map */}
                {[
                  { id: 'dashboard', label: 'Monitor Dashboard', icon: <LayoutDashboard size={14} />, role: ['admin'] },
                  { id: 'scanner', label: 'Scanner Multi-Gudang', icon: <Scan size={14} />, role: ['admin', 'operator'] },
                  { id: 'products', label: 'Master SKU & Harga', icon: <Package size={14} />, role: ['admin'] },
                  { id: 'warehouses', label: 'Manajemen Gudang', icon: <Building size={14} />, role: ['admin'] },
                  { id: 'inventory', label: 'Inventori Bahan Baku', icon: <Database size={14} />, role: ['admin', 'operator'] },
                  { id: 'returns', label: 'RTS Return & Klaim', icon: <CornerDownLeft size={14} />, role: ['admin', 'operator'] },
                  { id: 'po', label: 'PO ke Supplier (Alat)', icon: <ShoppingCart size={14} />, role: ['admin', 'operator'] },
                  { id: 'resellers', label: 'Portal Kemitraan', icon: <Users size={14} />, role: ['admin', 'reseller'] },
                  { id: 'track_reports', label: 'Laporan & Lacak Resi', icon: <FileText size={14} />, role: ['admin'] },
                ]
                  .filter(menu => menu.role.includes(user.role))
                  .map(menu => (
                    <button 
                      key={menu.id}
                      onClick={() => setActiveTab(menu.id)}
                      className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-md font-medium transition-all ${
                        activeTab === menu.id 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-slate-250 hover:bg-slate-800/40 hover:text-slate-250'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {menu.icon}
                        <span>{menu.label}</span>
                      </div>
                      <ChevronRight size={11} className={`opacity-40 transition-transform ${activeTab === menu.id ? 'translate-x-1' : ''}`} />
                    </button>
                ))}
              </div>
            </div>

            {/* Bottom Current Profile user Card */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/20 text-xs">
              <div className="flex items-center gap-2.5 p-2 bg-slate-800/50 rounded-lg border border-slate-800/60 mb-2">
                <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center font-bold font-sans text-white text-[11px]">
                  {user.name[0]}
                </div>
                <div className="truncate flex-1">
                  <h4 className="font-semibold text-slate-100 truncate text-xs">{user.name}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    {user.role}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 text-red-400 font-semibold hover:text-red-300 p-1.5 hover:bg-slate-800/50 rounded transition-colors border border-transparent hover:border-slate-800/65 text-xs"
              >
                <LogOut size={12} /> Logout Akun
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT MAIN PANEL COMPONENT HEADER / VIEW CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* TOP COMPONENT HEADER BAR */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 shrink-0 shadow-xs z-20 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded bg-slate-50 text-slate-550 hover:text-slate-800 border border-slate-200 transition-colors"
              title="Toggle Menu"
            >
              <AlignLeft size={14} />
            </button>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Dashboard Lokasi</span>
              <h2 className="text-xs font-bold text-slate-800 capitalize flex items-center gap-1 font-sans">
                <Shield size={12} className="text-indigo-600" /> Gudang Utama Jakarta (Main HQ)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Ambient log trigger indicators */}
            <div className="hidden lg:flex items-center gap-1.5 text-[9px] text-slate-400 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>

            {/* Quick Refresh database status */}
            <button 
              onClick={() => {
                setIsLoading(true);
                fetchDatabase();
              }}
              title="Refresh Global Sync"
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 transition"
            >
              <RefreshCw size={13} className="hover:rotate-45 transition-transform" />
            </button>

            {/* Notification Bell Badge */}
            <div className="relative">
              <button className="p-1.5 rounded text-slate-400 hover:text-slate-700 transition">
                <Bell size={14} />
                <span className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full" />
              </button>
            </div>
            
            {/* Visual separator */}
            <div className="w-px h-5 bg-slate-200" />

            <div className="flex items-center gap-2 font-sans">
              <p className="text-xs font-semibold text-slate-800 hidden md:block">{user.name}</p>
              <span className="text-[8px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">{user.role}</span>
            </div>

          </div>
        </header>

        {/* COMPONENT BODY RENDER VIEW */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]/70">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  products={products}
                  warehouses={warehouses}
                  scans={scans}
                  returns={returns}
                  claims={claims}
                />
              )}

              {activeTab === 'scanner' && (
                <Scanner 
                  products={products}
                  warehouses={warehouses}
                  stores={stores}
                  scans={scans}
                  onAddScan={handleAddScanLog}
                  onClearScans={handleClearScans}
                />
              )}

              {activeTab === 'products' && (
                <Products 
                  products={products}
                  warehouses={warehouses}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'warehouses' && (
                <Warehouses 
                  warehouses={warehouses}
                  locations={locations}
                  onAddWarehouse={handleAddWarehouse}
                  onEditWarehouse={handleEditWarehouse}
                  onDeleteWarehouse={handleDeleteWarehouse}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                />
              )}

              {activeTab === 'inventory' && (
                <Inventory 
                  materials={rawMaterials}
                  onAddMaterial={handleAddMaterial}
                  onUpdateMaterialStock={handleUpdateMaterialStock}
                  onDeleteMaterial={handleDeleteMaterial}
                />
              )}

              {activeTab === 'returns' && (
                <Returns 
                  returns={returns}
                  claims={claims}
                  products={products}
                  onAddReturn={handleAddReturn}
                  onUpdateReturnStatus={handleUpdateReturnStatus}
                  onAddClaim={handleAddClaim}
                  onUpdateClaimStatus={handleUpdateClaimStatus}
                />
              )}

              {activeTab === 'po' && (
                <PurchaseOrders 
                  purchaseOrders={purchaseOrders}
                  packingRequests={packingRequests}
                  materials={rawMaterials}
                  onAddPurchaseOrder={handleAddPurchaseOrder}
                  onUpdatePOSetStatus={handleUpdatePOSetStatus}
                  onAddPackingRequest={handleAddPackingRequest}
                  onUpdatePackingRequestStatus={handleUpdatePackingRequestStatus}
                />
              )}

              {activeTab === 'resellers' && (
                <Resellers 
                  tempoApplies={tempoApplies}
                  marketingKits={marketingKits}
                  onAddTempoApply={handleAddTempoApply}
                  onUpdateTempoStatus={handleUpdateTempoStatus}
                  onDownloadKit={handleDownloadKit}
                />
              )}

              {activeTab === 'track_reports' && (
                <TrackingAndReports 
                  scans={scans}
                  products={products}
                  warehouses={warehouses}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Status Bar */}
        <footer className="h-8 bg-indigo-950 text-slate-200 text-[10px] flex items-center justify-between px-4 shrink-0 select-none border-t border-indigo-900">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Server Cluster: SG-01 (Primary)
            </span>
            <span className="text-indigo-400">|</span>
            <span>Memory Load: 1.2GB / 4.0GB</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Version 2.4.1-stable</span>
            <span>Latency: 12ms</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
