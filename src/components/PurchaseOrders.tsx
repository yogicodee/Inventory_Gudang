import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, ShoppingCart, Trash2, CheckSquare, X, 
  Search, Calculator, UserCheck, Layers, Clipboard, Clock
} from 'lucide-react';
import { PurchaseOrder, PackingToolRequest, RawMaterial } from '../types';

interface PurchaseOrdersProps {
  purchaseOrders: PurchaseOrder[];
  packingRequests: PackingToolRequest[];
  materials: RawMaterial[];
  onAddPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'date'>) => void;
  onUpdatePOSetStatus: (id: string, status: 'Draft' | 'Sent' | 'Received') => void;
  onAddPackingRequest: (req: Omit<PackingToolRequest, 'id' | 'date'>) => void;
  onUpdatePackingRequestStatus: (id: string, status: 'Pending' | 'Disetujui' | 'Ditolak') => void;
}

export default function PurchaseOrders({
  purchaseOrders,
  packingRequests,
  materials,
  onAddPurchaseOrder,
  onUpdatePOSetStatus,
  onAddPackingRequest,
  onUpdatePackingRequestStatus
}: PurchaseOrdersProps) {
  const [activeTab, setActiveTab] = useState<'po' | 'packing'>('po');

  // New PO creation Form state
  const [supplierName, setSupplierName] = useState<string>('');
  const [poItems, setPoItems] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(100);
  const [newItemPrice, setNewItemPrice] = useState<number>(5000);
  const [isPOMocalOpen, setIsPOMocalOpen] = useState<boolean>(false);

  // New Packing Request form state
  const [packerName, setPackerName] = useState<string>('');
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>(materials[0]?.name || 'Plakban Lakban');
  const [requestQty, setRequestQty] = useState<number>(10);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState<boolean>(false);

  const handleAddPoItem = () => {
    if (!newItemName) return;
    setPoItems([...poItems, { name: newItemName, qty: newItemQty, price: newItemPrice }]);
    setNewItemName('');
    setNewItemQty(100);
    setNewItemPrice(5000);
  };

  const handleRemovePoItem = (idx: number) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || poItems.length === 0) return;

    onAddPurchaseOrder({
      supplier_name: supplierName,
      status: 'Draft',
      items: poItems
    });

    // Reset Form
    setSupplierName('');
    setPoItems([]);
    setIsPOMocalOpen(false);
  };

  const handlePackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packerName || !selectedMaterialName) return;

    onAddPackingRequest({
      item_name: selectedMaterialName,
      qty_requested: requestQty,
      requester: packerName,
      status: 'Pending'
    });

    setPackerName('');
    setRequestQty(10);
    setIsPackingModalOpen(false);
  };

  return (
    <div className="space-y-6" id="po-packing-view">
      
      {/* Header and top tab control panel */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-purple-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="text-purple-600" /> Pengadaan Alur Supplier & Logistik
          </h1>
          <p className="text-slate-500 text-sm">Organisasi pemesanan material grosir (Supplier PO) dan pengajuan persetujuan alat/bahan packing internal operator</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            type="button" 
            onClick={() => setActiveTab('po')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'po' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            📋 Purchase Orders (Supplier)
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('packing')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'packing' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            🛠️ Pengajuan Bahan Packing
          </button>
        </div>
      </div>

      {activeTab === 'po' ? (
        
        // PO management sub-view
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-medium">
              Total PO Terproses: <strong className="text-purple-700">{purchaseOrders.length} Draft</strong>
            </div>

            <button 
              onClick={() => setIsPOMocalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Buat PO Baru ke Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchaseOrders.map(po => {
              const poTotal = po.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
              return (
                <motion.div 
                  key={po.id} 
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs relative flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between border-b pb-3 border-dashed">
                    <div>
                      <h4 className="font-extrabold text-slate-800">{po.supplier_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ORDER ID: {po.id} • {po.date}</p>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      po.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : po.status === 'Sent' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      ⏳ {po.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item Pembelian:</p>
                    <ul className="text-xs space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                      {po.items.map((item, id) => (
                        <li key={id} className="flex justify-between text-slate-600 font-medium font-mono text-[11px]">
                          <span>• {item.name} (x{item.qty})</span>
                          <span>Rp {(item.qty * item.price).toLocaleString('id-ID')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Grand Total Anggaran</p>
                      <h3 className="text-base font-black text-purple-700 font-mono">Rp {poTotal.toLocaleString('id-ID')}</h3>
                    </div>

                    {/* Operational workflow status triggers */}
                    {po.status === 'Draft' && (
                      <button 
                        onClick={() => onUpdatePOSetStatus(po.id, 'Sent')}
                        className="px-3 py-1.5 text-[10px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded-md uppercase"
                      >
                        Kirim ke Supplier
                      </button>
                    )}
                    {po.status === 'Sent' && (
                      <button 
                        onClick={() => {
                          alert('Klaim Restock Berhasil! Stok bahan diupdate otomatis.');
                          onUpdatePOSetStatus(po.id, 'Received');
                        }}
                        className="px-3 py-1.5 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-md uppercase"
                      >
                        Tandai Diterima (Restock)
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {purchaseOrders.length === 0 && (
              <div className="col-span-2 bg-white p-12 text-center text-slate-400 border border-dashed rounded-xl">
                Belum ada Purchase Order (PO) yang dideklarasikan.
              </div>
            )}
          </div>
        </div>

      ) : (

        // Packing material approval streams sub-view
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-45 uppercase tracking-wide">Persetujuan Kebutuhan Packing Meja Kerja (Operators)</h3>
            <button 
              onClick={() => setIsPackingModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Ajukan Kebutuhan Meja Kerja
            </button>
          </div>

          <div className="bg-white rounded-xl border border-purple-50 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-155 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="p-4">Staff Pemohon</th>
                  <th className="p-4">Tanggal Pengajuan</th>
                  <th className="p-4">Bahan Packing Diminta</th>
                  <th className="p-4 text-center">Jumlah Vol</th>
                  <th className="p-4 text-center">Status Alur</th>
                  <th className="p-4 text-center text-indigo-700">Tindakan Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {packingRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">{req.requester}</p>
                      <span className="text-[9px] text-slate-400 font-mono">STAFF_ID: {req.id}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{req.date}</td>
                    <td className="p-4 text-indigo-700">{req.item_name}</td>
                    <td className="p-4 text-center font-bold font-mono text-slate-800">{req.qty_requested} Pcs</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        req.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : req.status === 'Ditolak' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'Disetujui' ? '✓ DISETUJUI' : req.status === 'Ditolak' ? '❌ DITOLAK' : '⏳ MENUNGGU SPV'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {req.status === 'Pending' ? (
                        <div className="flex gap-1.5 items-center justify-center">
                          <button 
                            onClick={() => onUpdatePackingRequestStatus(req.id, 'Disetujui')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => onUpdatePackingRequestStatus(req.id, 'Ditolak')}
                            className="bg-red-65 bg-red-600 hover:bg-red-700 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}

                {packingRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Belum ada pengajuan alat packing aktif dari tim operator.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO Creation Modal */}
      <AnimatePresence>
        {isPOMocalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-slate-950 text-white p-4 flex justify-between items-center">
                <span className="font-bold text-xs uppercase tracking-wider">📋 Form Pembuatan Purchase Order Baru</span>
                <button onClick={() => setIsPOMocalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handlePOSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Perusahaan Supplier</label>
                  <input 
                    type="text" 
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g., PT Saffron Organik International"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                {/* Line Items builder */}
                <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100 space-y-3">
                  <span className="text-[11px] font-bold text-purple-700 uppercase block tracking-wider">🛒 Masukkan Baris Item PO:</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Mat</label>
                      <input 
                        type="text" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g., Botol Plastik Kecil"
                        className="w-full text-xs font-bold p-2 bg-white border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Qty</label>
                      <input 
                        type="number" 
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(parseInt(e.target.value) || 100)}
                        className="w-full text-xs font-bold p-2 bg-white border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Harga per Unit</label>
                      <input 
                        type="number" 
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(parseInt(e.target.value) || 1000)}
                        className="w-full text-xs font-bold p-2 bg-white border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={handleAddPoItem} 
                      className="px-3 py-1.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold rounded"
                    >
                      + Tambah Baris
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-600 block">Daftar Item Terpilih:</span>
                  <div className="max-h-24 overflow-y-auto border rounded divide-y bg-slate-50 text-xs">
                    {poItems.map((item, id) => (
                      <div key={id} className="p-2 flex justify-between items-center bg-white">
                        <span className="font-semibold text-slate-700">{item.name} ({item.qty} units @ Rp {item.price})</span>
                        <button type="button" onClick={() => handleRemovePoItem(id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {poItems.length === 0 && (
                      <p className="p-3 text-slate-400 text-center text-[11px]">Tambahkan item melalui form di atas.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button type="button" onClick={() => setIsPOMocalOpen(false)} className="flex-1 py-2 text-xs bg-slate-100 rounded-lg">Batal</button>
                  <button type="submit" className="flex-1 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Simpan PO (Draft)</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Packing Material request Modal */}
      <AnimatePresence>
        {isPackingModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-slate-950 text-white p-4 flex justify-between items-center">
                <span className="font-bold text-xs uppercase tracking-wider">🛠️ Pengajuan Bahan Packing Meja</span>
                <button onClick={() => setIsPackingModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handlePackingSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-55 mb-1">Nama Operator Pemohon</label>
                  <input 
                    type="text" 
                    value={packerName}
                    onChange={(e) => setPackerName(e.target.value)}
                    placeholder="e.g., Dani Ramadhan (Meja 04)"
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-55 mb-1">Bahan Baku Diminta</label>
                    <select 
                      value={selectedMaterialName}
                      onChange={(e) => setSelectedMaterialName(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-55 mb-1">Kuantitas Qty</label>
                    <input 
                      type="number" 
                      value={requestQty}
                      onChange={(e) => setRequestQty(parseInt(e.target.value) || 1)}
                      className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => setIsPackingModalOpen(false)} className="flex-1 py-2 text-xs bg-slate-100 rounded-lg">Batal</button>
                  <button type="submit" className="flex-1 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Kirim Permohonan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
