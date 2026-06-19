import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Plus, ShieldAlert, Award, FileText, ArrowUp, 
  ArrowDown, DollarSign, Archive, Search, MoreVertical, X, CheckSquare
} from 'lucide-react';
import { RawMaterial } from '../types';

interface InventoryProps {
  materials: RawMaterial[];
  onAddMaterial: (mat: Omit<RawMaterial, 'id'>) => void;
  onUpdateMaterialStock: (id: string, newStock: number) => void;
  onDeleteMaterial: (id: string) => void;
}

export default function Inventory({ materials, onAddMaterial, onUpdateMaterialStock, onDeleteMaterial }: InventoryProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Materials Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatUnit, setNewMatUnit] = useState<string>('Pcs');
  const [newMatStock, setNewMatStock] = useState<number>(100);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(25);
  const [newMatVal, setNewMatVal] = useState<number>(2000);

  // Edit stock overlay
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);

  // Analytical stats
  const totalItems = materials.length;
  const totalQty = materials.reduce((s, m) => s + m.stock, 0);
  const lowMaterialsCount = materials.filter(m => m.stock < m.min_stock).length;
  const totalFinancialValue = materials.reduce((s, m) => s + (m.stock * m.value_per_unit), 0);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName) return;

    onAddMaterial({
      name: newMatName,
      unit: newMatUnit,
      stock: newMatStock,
      min_stock: newMatMinStock,
      value_per_unit: newMatVal
    });

    setIsModalOpen(false);
    // Reset fields
    setNewMatName('');
    setNewMatUnit('Pcs');
    setNewMatStock(100);
    setNewMatMinStock(25);
    setNewMatVal(2000);
  };

  const handleStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMaterial) return;

    const updatedQty = adjustingMaterial.stock + adjustQty;
    onUpdateMaterialStock(adjustingMaterial.id, Math.max(0, updatedQty));
    
    setAdjustingMaterial(null);
    setAdjustQty(0);
  };

  // Searching query
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="inventory-materials-view">
      
      {/* View Header with adding button */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 font-sans">
            <Database className="text-indigo-600" size={18} /> Manajemen Bahan Baku (Raw Materials)
          </h1>
          <p className="text-slate-500 text-xs">Monitor pergerakan stok bahan packing, kardus, botol, sachet, dan bahan organik kering</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus size={14} /> Tambah Bahan Baku
        </button>
      </div>

      {/* Financial analytical summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex items-center gap-3">
          <div className="p-2 bg-indigo-55 text-indigo-650 rounded"><Archive size={16} /></div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL ITEM BAHAN</p>
            <h3 className="text-xs font-bold text-slate-800">{totalItems} SKU</h3>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex items-center gap-3">
          <div className="p-2 bg-indigo-55 text-indigo-650 rounded"><Database size={16} /></div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL QUANTITY STOK</p>
            <h3 className="text-xs font-bold text-slate-800">{totalQty.toLocaleString('id-ID')} unit</h3>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-650 rounded"><ShieldAlert size={16} /></div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">LOW STOCK ALERTS</p>
            <h3 className={`text-xs font-bold ${lowMaterialsCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>{lowMaterialsCount} Item</h3>
          </div>
        </div>

        {/* Tile 4 */}
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-55 text-emerald-650 rounded"><DollarSign size={16} /></div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL ASSET VALUASI</p>
            <h3 className="text-xs font-mono font-bold text-emerald-700">Rp {totalFinancialValue.toLocaleString('id-ID')}</h3>
          </div>
        </div>
      </div>

      {/* Materials table list */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">📋 Laporan Stok Bahan Baku & Packing</h3>
            <p className="text-xs text-slate-400">Verifikasi jumlah fisik bahan pembungkus/kotak serta valuasi finansial untuk inventori.</p>
          </div>

          <div className="relative max-w-sm w-full font-mono">
            <input 
              type="text" 
              placeholder="Cari Bahan Baku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-1.5 pl-8 bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 font-sans"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto rounded-lg border border-slate-150">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
              <tr>
                <th className="p-4 pl-5">Nama Bahan</th>
                <th className="p-4">Satuan Ukur</th>
                <th className="p-4">Stok Saat Ini (Fisik)</th>
                <th className="p-4">Batas Minimum (Redline)</th>
                <th className="p-4">Nilai Satuan (COGS)</th>
                <th className="p-4">Total Valuasi Aset</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredMaterials.map(mat => {
                const totalMatVal = mat.stock * mat.value_per_unit;
                const isUnderThreshold = mat.stock < mat.min_stock;

                return (
                  <tr key={mat.id} className={`hover:bg-slate-55/30 transition-colors ${isUnderThreshold ? 'bg-red-50/20' : ''}`}>
                    <td className="p-4 pl-5">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{mat.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {mat.id}</p>
                      </div>
                    </td>
                    <td className="p-4">{mat.unit}</td>
                    <td className="p-4 font-bold text-slate-900">{mat.stock} {mat.unit}</td>
                    <td className="p-4 text-slate-400">{mat.min_stock} {mat.unit}</td>
                    <td className="p-4 font-mono text-slate-55">Rp {mat.value_per_unit.toLocaleString('id-ID')}</td>
                    <td className="p-4 font-mono text-emerald-600 font-bold">Rp {totalMatVal.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase ${
                        isUnderThreshold 
                          ? 'bg-red-100 text-red-800 animate-pulse border border-red-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {isUnderThreshold ? '⚠️ LOW STOCK' : '✓ AMAN'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 items-center justify-center">
                        <button 
                          onClick={() => setAdjustingMaterial(mat)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          Atur Stok
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Hapus data bahan baku "${mat.name}"?`)) {
                              onDeleteMaterial(mat.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          X
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">Belum ada bahan baku terdaftar. Silakan tambah data material.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Bahan Baku Baru */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">📦 Daftarkan Bahan Baku Baru</span>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateMaterial} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Bahan Material</label>
                  <input 
                    type="text" 
                    value={newMatName} 
                    onChange={(e) => setNewMatName(e.target.value)}
                    placeholder="e.g., Karton Dus Box Ferswit"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Satuan Ukur</label>
                    <select 
                      value={newMatUnit}
                      onChange={(e) => setNewMatUnit(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    >
                      <option value="Pcs">Pcs</option>
                      <option value="Roll">Roll</option>
                      <option value="Gram">Gram</option>
                      <option value="Botol">Botol</option>
                      <option value="Meter">Meter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nilai Satuan (Beli)</label>
                    <input 
                      type="number" 
                      value={newMatVal} 
                      onChange={(e) => setNewMatVal(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Awal</label>
                    <input 
                      type="number" 
                      value={newMatStock} 
                      onChange={(e) => setNewMatStock(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Minimum Alert</label>
                    <input 
                      type="number" 
                      value={newMatMinStock} 
                      onChange={(e) => setNewMatMinStock(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-xs bg-slate-100 text-slate-65 rounded-lg">Batal</button>
                  <button type="submit" className="flex-1 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Adjusment Stock (Add or Subtract) */}
      <AnimatePresence>
        {adjustingMaterial && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">Adjustment Stok: {adjustingMaterial.name}</span>
                <button onClick={() => setAdjustingMaterial(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleStockAdjust} className="p-6 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Stok Fisik Saat Ini</p>
                  <p className="text-xl font-bold text-slate-800">{adjustingMaterial.stock} {adjustingMaterial.unit}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Atur Volume (+ untuk Bertambah, - untuk Berkurang)
                  </label>
                  <input 
                    type="number" 
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                    placeholder="Contoh: 50 atau -20"
                    className="w-full text-center text-sm font-bold p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>e.g., "100" = Menambah 100 unit</span>
                    <span>"-50" = Mengurangi 50 unit</span>
                  </div>
                </div>

                <div className="py-2.5 bg-indigo-50 p-3 rounded-lg text-xs flex justify-between font-bold text-indigo-700">
                  <span>Proyeksi Stok Baru</span>
                  <span>{adjustingMaterial.stock + adjustQty} {adjustingMaterial.unit}</span>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setAdjustingMaterial(null)} className="flex-1 py-2 text-xs bg-slate-100 rounded-lg">Batal</button>
                  <button type="submit" className="flex-1 py-2 text-xs bg-indigo-65 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Proses Adjust</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
