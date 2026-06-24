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
