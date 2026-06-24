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
