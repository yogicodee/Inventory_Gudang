import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Store, Scan, PackageX, AlertTriangle, Landmark, 
  TrendingUp, BarChart2, PieChart, Users, Calendar, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw
} from 'lucide-react';
import { Product, Warehouse, ScanLog, ReturnLog, DamageClaim } from '../types';

interface DashboardProps {
  products: Product[];
  warehouses: Warehouse[];
  scans: ScanLog[];
  returns: ReturnLog[];
  claims: DamageClaim[];
}

export default function Dashboard({ products, warehouses, scans, returns, claims }: DashboardProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | '30days' | 'all'>('30days');

  // KPI Calculations
  const totalSKUs = products.length;
  const activeWarehousesCount = warehouses.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const scanToday = scans.filter(s => s.timestamp.startsWith(todayStr)).reduce((acc, s) => acc + s.qty, 0);
  const scan30Days = scans.reduce((acc, s) => acc + s.qty, 0);

  const pendingReturnCount = returns.filter(r => r.status === 'Pending').length;
  const pendingClaimCount = claims.filter(c => c.status === 'Pending').length;

  const totalItemStock = products.length;
  const totalQtyStock = products.reduce((sum, p) => sum + p.current_stock, 0);

  // Stock alert threshold (< 20)
  const lowStockProducts = products.filter(p => p.current_stock < 20);

  // Chart data: Tren Scan 15 hari terakhir
  const getTrendData = () => {
    const dates: string[] = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.map(dt => {
      const dayScans = scans.filter(s => s.timestamp.startsWith(dt));
      const kirim = dayScans.filter(s => s.type === 'kirim').reduce((sum, s) => sum + s.qty, 0);
      const ret = dayScans.filter(s => s.type === 'return').reduce((sum, s) => sum + s.qty, 0);
      return {
        date: dt.substring(5), // mm-dd
        kirim,
        ret
      };
    });
  };
  const trendData = getTrendData();
  const maxTrendVal = Math.max(...trendData.map(d => d.kirim + d.ret), 10);

  // Chart data: Stok per Gudang
  const warehouseStockData = warehouses.map(wh => {
    const totalWhStock = products.reduce((sum, p) => {
      return sum + (p.warehouse_stocks[wh.id] || 0);
    }, 0);
    return {
      name: wh.name,
      stock: totalWhStock
    };
  });
  const maxWhStockVal = Math.max(...warehouseStockData.map(d => d.stock), 10);

  // Top 10 products
  const topProducts = [...products]
    .sort((a, b) => b.current_stock - a.current_stock)
    .slice(0, 10);
  const maxTopProductStock = Math.max(...topProducts.map(p => p.current_stock), 11);

  // Scan per Toko Distribution
  const storeScanData: Record<string, number> = {};
  scans.forEach(s => {
    const storeName = s.store_id === 'S01' ? 'Ferswit Official' : s.store_id === 'S02' ? 'Ferganic Official' : 'Unassigned Store';
    storeScanData[storeName] = (storeScanData[storeName] || 0) + s.qty;
  });

  // Return per Kurir
  const courierReturnData: Record<string, number> = {};
  returns.forEach(r => {
    courierReturnData[r.courier] = (courierReturnData[r.courier] || 0) + r.qty;
  });

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Header and Filter panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">Dashboard Utama</h1>
          <p className="text-slate-500 text-xs">Update data real-time inventory dan operasional Gudang Ferswit</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedWarehouseId} 
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-705 outline-hidden cursor-pointer"
            >
              <option value="all">Semua Gudang</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          {/* Range filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button 
              onClick={() => setDateFilter('today')} 
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${dateFilter === 'today' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setDateFilter('30days')} 
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${dateFilter === '30days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              30 Hari
            </button>
            <button 
              onClick={() => setDateFilter('all')} 
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${dateFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Tampilkan Semua
            </button>
          </div>

          <button 
            type="button" 
            onClick={() => window.location.reload()} 
            className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total SKU */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-total-sku"
        >
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">TOTAL SKU</p>
            <h3 className="text-lg font-bold text-slate-800">{totalSKUs}</h3>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-semibold flex items-center w-fit gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +4% m-o-m
            </span>
          </div>
        </motion.div>

        {/* Card 2: Gudang Aktif */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-gudang-aktif"
        >
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
            <Store size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">GUDANG AKTIF</p>
            <h3 className="text-lg font-bold text-slate-800">{activeWarehousesCount}</h3>
            <p className="text-[9px] text-slate-450 mt-0.5 font-medium leading-tight text-slate-400">Lokasi pemetaan handal</p>
          </div>
        </motion.div>

        {/* Card 3: Scan Hari Ini */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-scan-today"
        >
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Scan size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">SCAN HARI INI</p>
            <h3 className="text-lg font-bold text-slate-800">{scanToday} <span className="text-xs font-normal text-slate-400">Qty</span></h3>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-semibold flex items-center w-fit gap-0.5 mt-0.5">
              <ArrowUpRight size={10} /> +12% dibanding kemarin
            </span>
          </div>
        </motion.div>

        {/* Card 4: Scan 30 Hari */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-scan-month"
        >
          <div className="p-2 bg-indigo-50 text-indigo-500 rounded">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">SCAN 30 HARI</p>
            <h3 className="text-lg font-bold text-slate-800">{scan30Days} <span className="text-xs font-normal text-slate-400">Qty</span></h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Total pengiriman barang</p>
          </div>
        </motion.div>

        {/* Card 5: Return Pending */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-return-pending"
        >
          <div className="p-2 bg-amber-50 text-amber-600 rounded">
            <PackageX size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">RETURN PENDING</p>
            <h3 className="text-lg font-bold text-slate-800">{pendingReturnCount} <span className="text-xs text-slate-400 font-normal">paket</span></h3>
            <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm font-semibold flex items-center w-fit gap-0.5 mt-0.5">
              <AlertTriangle size={10} /> Butuh konfirmasi
            </span>
          </div>
        </motion.div>

        {/* Card 6: Klaim Pending */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-klaim-pending"
        >
          <div className="p-2 bg-red-50 text-red-650 rounded">
            <AlertTriangle size={18} className="text-red-650" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">KLAIM PENDING</p>
            <h3 className="text-lg font-bold text-slate-800">{pendingClaimCount} <span className="text-xs text-slate-400 font-normal">paket</span></h3>
            <span className="text-[9px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm font-semibold flex items-center w-fit gap-0.5 mt-0.5">
              Rp {(claims.filter(c => c.status === 'Pending').reduce((s, c) => s + c.value, 0)).toLocaleString('id-ID')}
            </span>
          </div>
        </motion.div>

        {/* Card 7: Item Stok */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-item-stok"
        >
          <div className="p-2 bg-sky-50 text-sky-600 rounded">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">ITEM STOK (SKU)</p>
            <h3 className="text-lg font-bold text-slate-800">{totalItemStock}</h3>
            <p className="text-[9px] text-slate-450 mt-0.5">Terdaftar dalam Master</p>
          </div>
        </motion.div>

        {/* Card 8: Qty Stok */}
        <motion.div 
          whileHover={{ translateY: -1 }}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
          id="stat-qty-stok"
        >
          <div className="p-2 bg-amber-50 text-amber-650 rounded">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">QTY STOK FISIK</p>
            <h3 className="text-lg font-bold text-slate-800">{totalQtyStock} <span className="text-xs text-slate-400 font-normal">Pcs</span></h3>
            <p className="text-[9px] text-slate-450 mt-0.5">Gabungan semua gudang</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Bento Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Trend Scan 30 Hari: SVG Line Chart Area */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm xl:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <BarChart2 className="text-indigo-600" size={16} /> Tren Transaksi Scanning (15 Hari Terakhir)
              </h4>
              <p className="text-[11px] text-slate-400">Total scanning Kirim vs Return paket per hari</p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-600 rounded-full"></span>Kirim</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-pink-500 rounded-full"></span>Return</span>
            </div>
          </div>

          {/* SVG Line / Bar visualization */}
          <div className="h-64 relative flex items-end justify-between w-full pt-4 px-2 select-none">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between border-b border-l border-slate-100 pb-6 pointer-events-none">
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
            </div>

            {trendData.map((d, idx) => {
              const kirimH = maxTrendVal > 0 ? (d.kirim / maxTrendVal) * 160 : 0;
              const returnH = maxTrendVal > 0 ? (d.ret / maxTrendVal) * 160 : 0;
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group z-10">
                  <div className="h-44 flex items-end justify-center gap-0.5 w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-slate-850 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap shadow-md">
                      <p className="font-bold border-b border-slate-700 pb-0.5 mb-1 text-indigo-300">Tanggal: {d.date}</p>
                      <p>Kirim: <span className="font-bold">{d.kirim} Qty</span></p>
                      <p>Return: <span className="font-bold text-pink-300">{d.ret} Qty</span></p>
                    </div>

                    {/* Bars */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(kirimH, 4) }}
                      transition={{ duration: 0.5, delay: idx * 0.02 }}
                      className="w-2 md:w-4 bg-gradient-to-t from-indigo-650 to-indigo-400 rounded-t-sm hover:brightness-105 cursor-pointer"
                    />
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: Math.max(returnH, 4) }}
                      transition={{ duration: 0.5, delay: idx * 0.02 }}
                      className="w-2 md:w-4 bg-gradient-to-t from-pink-500 to-pink-350 rounded-t-sm hover:brightness-105 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stok per Gudang Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <PieChart className="text-emerald-500" size={16} /> Alokasi Stok per Gudang
            </h4>
            <p className="text-[11px] text-slate-400">Pembagian jumlah item di lokasi penyimpanan aktif</p>
          </div>

          <div className="my-4 space-y-3 flex-1 flex flex-col justify-center">
            {warehouseStockData.map((wh, idx) => {
              const percentage = totalQtyStock > 0 ? (wh.stock / totalQtyStock) * 100 : 0;
              const barWidth = maxWhStockVal > 0 ? (wh.stock / maxWhStockVal) * 100 : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{wh.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{wh.stock} Pcs ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              );
            })}
            
            {warehouseStockData.length === 0 && (
              <p className="text-center text-slate-400 text-xs py-10">Belum ada data alokasi gudang</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-404 flex justify-between">
            <span>Total Kapasitas Terpakai</span>
            <span className="font-bold text-slate-700">{totalQtyStock} Pcs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Top 10 Produk Terbanyak Stok */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm xl:col-span-2">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Package className="text-indigo-600" size={16} /> Top 10 Produk dengan Stok Terbanyak (Pcs)
            </h4>
            <p className="text-[11px] text-slate-400">Inventori SKU paling stabil di dalam sistem pergudangan</p>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => {
              const widthRatio = maxTopProductStock > 0 ? (p.current_stock / maxTopProductStock) * 100 : 0;
              return (
                <div key={p.id} className="flex items-center gap-3 text-xs">
                  <span className="w-5 font-mono font-bold text-slate-400 text-right">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="font-semibold text-slate-700 truncate max-w-xs md:max-w-md">{p.name}</span>
                      <span className="font-mono text-slate-500 text-[11px] font-medium">{p.current_stock} Pcs</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${widthRatio}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-indigo-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {topProducts.length === 0 && (
              <p className="text-center text-slate-400 text-xs py-10">Belum ada produk terdaftar</p>
            )}
          </div>
        </div>

        {/* Stok Hampir Habis & Scan per Toko widgets */}
        <div className="space-y-4">
          {/* Scan per Toko (Share of sales/scans) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Store className="text-indigo-600" size={16} /> Scan per Toko Pengirim
            </h4>
            <div className="space-y-2.5">
              {Object.entries(storeScanData).map(([storeName, qty], index) => {
                const total = Object.values(storeScanData).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (qty / total) * 100 : 0;
                return (
                  <div key={storeName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-650">{storeName}</span>
                      <span className="font-mono text-slate-705 font-bold text-[11px]">{qty} Qty ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-indigo-600' : 'bg-pink-500'}`}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(storeScanData).length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat scan toko</p>
              )}
            </div>
          </div>

          {/* Alert Stok Hampir Habis */}
          <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
            <h4 className="text-xs font-bold text-red-700 mb-2.5 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={16} /> Peringatan Stok Menipis ({"<"} 20 Pcs)
            </h4>
            <div className="max-h-44 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-red-50/50 rounded-md border border-red-100/50">
                  <div className="truncate max-w-[150px]">
                    <p className="font-semibold text-slate-750 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">CODE: {p.barcode}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {p.current_stock} Pcs
                    </span>
                  </div>
                </div>
              ))}

              {lowStockProducts.length === 0 && (
                <p className="text-center text-emerald-600 text-xs py-4 font-semibold">Semua stok produk aman! ✓</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
