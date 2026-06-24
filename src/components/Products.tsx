import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Search, Plus, Printer, Edit3, Trash2, DollarSign, 
  Percent, ArrowUpDown, Filter, X, Tag, ListFilter, CheckCircle2, Copy
} from 'lucide-react';
import { Product, Warehouse } from '../types';

interface ProductsProps {
  products: Product[];
  warehouses: Warehouse[];
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function Products({ products, warehouses, onAddProduct, onEditProduct, onDeleteProduct }: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'harga'>('daftar');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [category, setCategory] = useState<string>('Minuman Herbal');
  const [price, setPrice] = useState<number>(15000);
  const [hpp, setHpp] = useState<number>(10000);
  const [agencyPrice, setAgencyPrice] = useState<number>(12500);
  const [warehouseStockQty, setWarehouseStockQty] = useState<Record<string, number>>({});

  // Barcode export modal
  const [showBarcodePrint, setShowBarcodePrint] = useState<Product | null>(null);

  // Categories
  const categories = ['Semua Kategori', 'Minuman Herbal', 'Saffron', 'Bahan Organik', 'Premium Blend', 'Packing Material'];

  const resetForm = () => {
    setName('');
    setBarcode('');
    setCategory('Minuman Herbal');
    setPrice(15000);
    setHpp(10000);
    setAgencyPrice(12500);
    
    // Init warehouse stocks
    const initStocks: Record<string, number> = {};
    warehouses.forEach(wh => {
      initStocks[wh.id] = 0;
    });
    setWarehouseStockQty(initStocks);
    
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode);
    setCategory(p.category);
    setPrice(p.price);
    setHpp(p.hpp);
    setAgencyPrice(p.price - 2500); // Back-calculate agency pricing
    
    const initStocks: Record<string, number> = {};
    warehouses.forEach(wh => {
      initStocks[wh.id] = p.warehouse_stocks[wh.id] || 0;
    });
    setWarehouseStockQty(initStocks);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode) return;

    // Total stock is sum of warehouse stock
    const current_stock = (Object.values(warehouseStockQty) as number[]).reduce((sum: number, qty: number) => sum + qty, 0);

    const productPayload = {
      name,
      barcode,
      category,
      price,
      hpp,
      current_stock,
      warehouse_stocks: warehouseStockQty
    };

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        ...productPayload
      });
    } else {
      onAddProduct(productPayload);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleStockChange = (whId: string, value: number) => {
    setWarehouseStockQty({
      ...warehouseStockQty,
      [whId]: Math.max(0, value)
    });
  };

  const generateBarcodeRandom = () => {
    const code = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcode(code);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="products-view">
      
      {/* View Header with main Action */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 font-sans">
            <Package className="text-indigo-600" size={18} /> Katalog Master Produk
          </h1>
          <p className="text-slate-500 text-xs">Kelola spesifikasi produk, harga jual, margin keuntungan HPP, serta kode barcode</p>
        </div>

        <button 
          onClick={openAddModal} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus size={14} /> Tambah Produk Baru
        </button>
      </div>

      {/* Sub tabs: Catalog list vs Pricing Matrix */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveSubTab('daftar')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeSubTab === 'daftar' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📁 Master Stok & Metadata
        </button>
        <button 
          onClick={() => setActiveSubTab('harga')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeSubTab === 'harga' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          💸 Manajemen Harga Jual & HPP
        </button>
      </div>

      {/* Quick filters bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full md:max-w-xs">
          <input 
            type="text" 
            placeholder="Cari SKU, Nama Produk, Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500"
          />
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><ListFilter size={13} /> Filter Kategori:</span>
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat === 'Semua Kategori' ? 'all' : cat)}
                className={`py-0.5 px-2.5 text-[10px] font-bold rounded border ${
                  (cat === 'Semua Kategori' && selectedCategory === 'all') || selectedCategory === cat
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Rendering based on SubTab */}
      {activeSubTab === 'daftar' ? (
           // Tab: Master Metadata & Stok
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="p-3">SKU / Nama Produk</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Stok Total</th>
                  <th className="p-3">Distribusi Stok per Gudang</th>
                  <th className="p-3 text-center">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">ID: {p.id}</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <span>{p.barcode}</span>
                        <button 
                          onClick={() => setShowBarcodePrint(p)}
                          className="text-indigo-600 hover:text-indigo-800 p-0.5 rounded-sm hover:bg-indigo-50"
                          title="Print / Lihat Barcode"
                        >
                          <Printer size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-150 text-slate-700 border border-slate-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        p.current_stock < 20 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {p.current_stock} Pcs
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {warehouses.map(wh => {
                          const w_stock = p.warehouse_stocks[wh.id] || 0;
                          return (
                            <span key={wh.id} className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                              {wh.name}: <strong className="text-slate-800 font-bold">{w_stock}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                          title="Edit Produk"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">Belum ada produk terdaftar. Silakan tambah produk baru.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        // Tab: Manajemen Harga Jual & HPP
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700">Analisis Margin Keuntungan & Pricing</p>
              <p className="text-[11px] text-slate-400">Pastikan margin profit kotor berada di atas target ideal (30% keatas)</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Percent size={13} /> Average Gross Margin: 35.5%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="p-3">SKU / Nama Produk</th>
                  <th className="p-3">Harga Pokok Pembelian (HPP)</th>
                  <th className="p-3">Harga Jual Retail (MSRP)</th>
                  <th className="p-3">Harga Reseller / Agen</th>
                  <th className="p-3 text-center">Profit Kotor (Retail)</th>
                  <th className="p-3 text-center">Margin % Jual</th>
                  <th className="p-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map(p => {
                  const diffPrice = p.price - p.hpp;
                  const profitMargin = p.price > 0 ? (diffPrice / p.price) * 100 : 0;
                  const mockAgencyPrice = p.price - Math.floor(p.price * 0.15); // Simulated agency is 15% discount
                  const isMarginHealthy = profitMargin >= 30;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 text-xs">{p.name}</td>
                      <td className="p-3 font-mono font-bold text-slate-600">
                        Rp {p.hpp.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-mono text-indigo-650 font-semibold bg-indigo-50/20">
                        Rp {mockAgencyPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono font-extrabold text-emerald-600">
                        Rp {diffPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          isMarginHealthy ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="px-2 py-0.5 font-bold text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-600"
                        >
                          Ubah Harga
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Produk */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{editingProduct ? '✏️ Ubah Spesifikasi Master Produk' : '📦 Daftarkan SKU Baru ke Master'}</h3>
                  <p className="text-[11px] text-slate-400">Pencatatan data SKU, pemetaan stock, barcode, dan pricing skema</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                {/* Section 1: Main Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Produk / SKU</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., SEGERS WARAS 1 PCS" 
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                      <span>Barcode EAN-13</span>
                      <button 
                        type="button" 
                        onClick={generateBarcodeRandom} 
                        className="text-[10px] text-purple-600 hover:underline font-bold"
                      >
                        Acak Barcode
                      </button>
                    </label>
                    <input 
                      type="text" 
                      value={barcode} 
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="8993006718228" 
                      className="w-full text-xs font-bold p-2.5 font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori Produk</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                    >
                      {categories.filter(c => c !== 'Semua Kategori').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Modal Pembelian (HPP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">Rp</span>
                      <input 
                        type="number" 
                        value={hpp} 
                        onChange={(e) => setHpp(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-bold p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-y border-slate-100 bg-slate-50/30 p-2.5 rounded-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-55 mb-1 text-purple-700">Harga Jual Retail (MSRP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-purple-400 font-bold text-xs">Rp</span>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-bold p-2.5 pl-9 bg-white border border-purple-200 rounded-lg focus:outline-hidden focus:border-purple-500 text-purple-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-55 mb-1 text-indigo-700">Harga Reseller / Agen Mitra</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-indigo-400 font-bold text-xs">Rp</span>
                      <input 
                        type="number" 
                        value={agencyPrice} 
                        onChange={(e) => setAgencyPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-bold p-2.5 pl-9 bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:border-indigo-500 text-indigo-700 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Warehouse Stock Allocator */}
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase mb-2">Penjatahan Alokasi Stok Fisik</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                    {warehouses.map(wh => (
                      <div key={wh.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="truncate pr-2">
                          <p className="text-xs font-bold text-slate-700 truncate">{wh.name}</p>
                          <p className="text-[10px] text-slate-400">Spv: {wh.manager}</p>
                        </div>
                        <input 
                          type="number" 
                          value={warehouseStockQty[wh.id] || 0}
                          onChange={(e) => handleStockChange(wh.id, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className="w-20 text-center font-bold p-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                  >
                    Simpan Data SKU
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode simulation display modal */}
      <AnimatePresence>
        {showBarcodePrint && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white p-6 rounded-xl shadow-lg border max-w-sm w-full text-center space-y-4"
            >
              <h3 className="font-bold text-slate-800 text-sm">{showBarcodePrint.name}</h3>
              <p className="text-xs text-slate-400">Barcode Label Cetak Terdaftar</p>
              
              {/* Fake aesthetic Barcode rendering */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block w-full">
                <div className="flex justify-center items-center h-20 gap-[2px] bg-white border px-4">
                  {/* Generate pseudo barcode bars */}
                  {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,4,2,1,3,1,2,4,3,1,2,1].map((width, idx) => (
                    <div 
                      key={idx} 
                      className={`h-16 ${idx % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} 
                      style={{ width: `${width}px` }} 
                    />
                  ))}
                </div>
                <p className="text-xs font-mono font-bold tracking-widest mt-2">{showBarcodePrint.barcode}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    alert('Simulasi Cetak Barcode ke Thermal Printer Sukses!');
                    setShowBarcodePrint(null);
                  }}
                  className="flex-1 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Printer size={12} /> Cetak Thermal Label
                </button>
                <button 
                  onClick={() => setShowBarcodePrint(null)}
                  className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
