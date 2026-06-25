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
