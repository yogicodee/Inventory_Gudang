import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, ShieldCheck, Download, CreditCard, 
  BookOpen, Compass, Clipboard, Plus, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { TempoReseller, MarketingKit } from '../types';

interface ResellersProps {
  tempoApplies: TempoReseller[];
  marketingKits: MarketingKit[];
  onAddTempoApply: (tempo: Omit<TempoReseller, 'id' | 'invoice_date' | 'due_date'>) => void;
  onUpdateTempoStatus: (id: string, status: 'Pending' | 'Approved' | 'Rejected') => void;
  onDownloadKit: (id: string) => void;
}

export default function Resellers({
  tempoApplies,
  marketingKits,
  onAddTempoApply,
  onUpdateTempoStatus,
  onDownloadKit
}: ResellersProps) {
  const [activeSegment, setActiveSegment] = useState<'supervisor' | 'portal'>('supervisor');

  // Reseller Portal Active tab
  const [portalTab, setPortalTab] = useState<'profile' | 'invoices' | 'ar' | 'kits' | 'bank'>('kits');

  // Apply Form state (simulation of submitting a credit request)
  const [resellerNameInput, setResellerNameInput] = useState<string>('');
  const [requestLimitAmount, setRequestLimitAmount] = useState<number>(5000000);
  const [successBanner, setSuccessBanner] = useState<string>('');

  const handleApplyTempo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerNameInput) return;

    onAddTempoApply({
      reseller_name: resellerNameInput,
      amount: requestLimitAmount,
      status: 'Pending'
    });

    setResellerNameInput('');
    setRequestLimitAmount(5000000);
    setSuccessBanner('Pengajuan credit limit tempo berhasil dikirim! Silakan tunggu persetujuan Supervisor.');
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  return (
    <div className="space-y-6" id="reseller-portal-view">
      
      {/* Segment switcher with title */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 font-sans">
            <Users className="text-indigo-600" size={18} /> Portal Kemitraan & Manajemen Reseller
          </h1>
          <p className="text-slate-550 text-xs">Persetujuan tempo piutang dagang reseller (AR), serta penyediaan aset marketing pendukung penjualan</p>
        </div>

        {/* Segment controls */}
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button 
            type="button" 
            onClick={() => setActiveSegment('supervisor')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${activeSegment === 'supervisor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-850'}`}
          >
            🛡️ Supervisor Panel (Tempo AR)
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSegment('portal')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${activeSegment === 'portal' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-600 hover:text-slate-850'}`}
          >
            🛒 Reseller Client Portal (Aset KIT)
          </button>
        </div>
      </div>

      {activeSegment === 'supervisor' ? (
        
        // Supervisor approval stream view
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Submit form on left column */}
          <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm h-fit space-y-4">
            <div className="border-b pb-2 border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">💳 Ajukan Credit Limit Tempo (AR)</h3>
            </div>

            {successBanner && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded text-center">
                {successBanner}
              </div>
            )}

            <form onSubmit={handleApplyTempo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Toko / Agen Reseller</label>
                <input 
                  type="text" 
                  value={resellerNameInput}
                  onChange={(e) => setResellerNameInput(e.target.value)}
                  placeholder="e.g., CV. Herbal Sejahtera Jakarta"
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Vol Limit Pengajuan (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">Rp</span>
                  <input 
                    type="number" 
                    value={requestLimitAmount}
                    onChange={(e) => setRequestLimitAmount(parseInt(e.target.value) || 1000000)}
                    className="w-full text-xs font-mono font-bold p-2 pl-9 bg-slate-50 border border-slate-200 rounded text-indigo-700 focus:outline-hidden focus:border-indigo-500"
                    step="500000"
                    min="1000000"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition cursor-pointer"
              >
                Kirim Permohonan Kredit
              </button>
            </form>

            <div className="p-3 bg-yellow-50 text-yellow-850 border border-yellow-100 rounded-lg space-y-1.5 text-xs">
              <p className="font-bold flex items-center gap-1">⚠️ Aturan Piutang Usaha (AR)</p>
              <p className="text-[10px] text-yellow-700 leading-relaxed">
                Pencairan limit baru harus diverifikasi creditworthiness-nya berdasarkan rekapitulasi pembayaran tagihan 3 bulan berturut-turut.
              </p>
            </div>
          </div>

          {/* Table display list on right column */}
          <div className="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-3 border-slate-100">
              <h3 className="text-sm font-bold text-slate-85 uppercase tracking-widest text-[10px]">⚖️ Daftar Pengajuan Penangguhan Pembayaran Tempo</h3>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b">
                  <tr>
                    <th className="p-3 pl-4">Nama Reseller</th>
                    <th className="p-3">Tanggal Invois</th>
                    <th className="p-3">Jatuh Tempo (30 Hari)</th>
                    <th className="p-3">Pengajuan Limit</th>
                    <th className="p-3 text-center">Status Kredit</th>
                    <th className="p-3 text-center">Tindakan Superv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {tempoApplies.map(tempo => (
                    <tr key={tempo.id} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4 font-bold text-slate-800">{tempo.reseller_name}</td>
                      <td className="p-3 font-mono text-slate-400">{tempo.invoice_date}</td>
                      <td className="p-3 font-mono text-slate-400">{tempo.due_date}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">Rp {tempo.amount.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tempo.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : tempo.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700 border border-amber-250'
                        }`}>
                          {tempo.status === 'Approved' ? '✓ APPROVED' : tempo.status === 'Rejected' ? '❌ REJECTED' : '⏳ PENDING'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {tempo.status === 'Pending' ? (
                          <div className="flex gap-1 items-center justify-center">
                            <button 
                              onClick={() => {
                                onUpdateTempoStatus(tempo.id, 'Approved');
                                alert('Pengajuan limit disetujui! Pembukuan piutang piutang usaha (AR) dibuka.');
                              }}
                              className="px-2 py-0.5 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => onUpdateTempoStatus(tempo.id, 'Rejected')}
                              className="px-2 py-0.5 bg-red-65 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Processed Lease</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tempoApplies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-4s text-xs">Belum ada permohonan tempo diajukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      ) : (

        // Reseller CLIENT PORTAL simulator view
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">FS</div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">FERSWIT PARTNER CLIENT PORTAL</h4>
                <p className="text-[11px] text-slate-400 font-medium">Logged in Partner: CV. Ferswit Niaga Makmur (id: RESELL_01)</p>
              </div>
            </div>

            {/* Portal Tab switchers */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl">
              <button 
                onClick={() => setPortalTab('kits')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${portalTab === 'kits' ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                📚 Marketing KIT
              </button>
              <button 
                onClick={() => setPortalTab('ar')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${portalTab === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                📊 Piutang AR & Limit
              </button>
              <button 
                onClick={() => setPortalTab('invoices')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${portalTab === 'invoices' ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                🧾 Riwayat Belanja
              </button>
              <button 
                onClick={() => setPortalTab('bank')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${portalTab === 'bank' ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                💳 Channel Rekening Bank
              </button>
            </div>
          </div>

          {/* Conditional content of client portal */}
          {portalTab === 'kits' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">Aset Marketing KIT (Banner & Product Video)</h4>
                <p className="text-[11px] text-slate-450">Silakan unduh asset penunjang pemasaran guna mempermudah iklan promosi media sosial Anda</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketingKits.map(kit => (
                  <div key={kit.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">{kit.category}</span>
                      <h5 className="font-bold text-xs text-slate-200 mt-2 truncate max-w-xs">{kit.title}</h5>
                      <span className="text-[10px] text-slate-500 mt-1 block">Downloaded {kit.downloadCount} times</span>
                    </div>

                    <button 
                      onClick={() => onDownloadKit(kit.id)}
                      className="px-3.5 py-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={12} /> Unduh File
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portalTab === 'ar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Credit Limit</p>
                  <p className="text-xl font-bold font-mono text-slate-200">Rp 15.000.000</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-55 uppercase font-bold text-indigo-400">Limit Digunakan</p>
                  <p className="text-xl font-bold font-mono text-indigo-400">Rp 4.500.000</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-55 uppercase font-bold text-emerald-400">Sisa Kredit Term</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">Rp 10.500.000</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block uppercase">Invois Aktif Tangguh (Tempo AR)</span>
                <div className="text-xs divide-y divide-slate-85 divide-slate-800">
                  <div className="py-2.5 flex justify-between font-mono">
                    <span className="text-slate-400">INV-2026-FERSWIT01 • Due 19 Juli 2026</span>
                    <span className="font-bold text-slate-100">Rp 2.500.000 (⏳ 30 Hari)</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-mono">
                    <span className="text-slate-400">INV-2026-FERSWIT02 • Due 29 Juli 2026</span>
                    <span className="font-bold text-slate-100">Rp 2.000.000 (⏳ 30 Hari)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {portalTab === 'invoices' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-200 block uppercase">Log Riwayat Pembelian Grosir Reseller</span>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-45 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Invois ID</th>
                      <th className="p-3">Tanggal Transaksi</th>
                      <th className="p-3">Volume Belanja</th>
                      <th className="p-3">Skema Bayar</th>
                      <th className="p-3">Pembayaran Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                    <tr>
                      <td className="p-3 text-indigo-400 font-bold">INV-FERSWIT01</td>
                      <td className="p-3">2026-06-10</td>
                      <td className="p-3">Rp 2.500.000</td>
                      <td className="p-3 font-semibold text-slate-200">Tempo Kredit 30 Hari</td>
                      <td className="p-3"><span className="text-[10px] uppercase font-bold text-amber-500">⏳ Belum Dibayar</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 text-indigo-400 font-bold">INV-FERSWIT02</td>
                      <td className="p-3">2026-05-15</td>
                      <td className="p-3">Rp 7.800.000</td>
                      <td className="p-3 font-semibold text-slate-200">Transfer Mandiri Instan</td>
                      <td className="p-3"><span className="text-[10px] uppercase font-bold text-emerald-500">✓ Lunas</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {portalTab === 'bank' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Akun Rekening Bank Utama Ferswit Niaga</h4>
                <p className="text-[11px] text-slate-400">Gunakan rekening di bawah untuk melakukan setor transfer tagihan belanja grosir</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-25">BANK MANDIRI</span>
                    <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">ONLINE</span>
                  </div>
                  <p className="text-lg font-bold font-mono tracking-widest text-slate-100">123-000-456-789-0</p>
                  <p className="text-[10px] text-slate-500 font-medium font-sans">Atas Nama: PT Ferswit Niaga Bersama</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-25 font-sans">BANK CENTRAL ASIA (BCA)</span>
                    <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">ONLINE</span>
                  </div>
                  <p className="text-lg font-bold font-mono tracking-widest text-slate-100">541-556-789-1</p>
                  <p className="text-[10px] text-slate-550 font-medium font-sans">Atas Nama: CV Ferswit Niaga Bersama</p>
                </div>
              </div>
            </div>
          )}
        </div>

      )}

    </div>
  );
}
