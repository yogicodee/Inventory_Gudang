export interface User {
  id: string;
  username: string;
  role: 'admin' | 'reseller' | 'operator';
  name: string;
  avatar?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  manager: string;
}

export interface Location {
  id: string;
  warehouse_id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  hpp: number;
  current_stock: number;
  warehouse_stocks: Record<string, number>; // warehouse_id -> qty
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
  value_per_unit: number;
}

export interface Store {
  id: string;
  name: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  type: 'kirim' | 'return';
  warehouse_id: string;
  store_id?: string;
  barcode: string;
  product_name?: string;
  qty: number;
  resi: string;
  courier: string;
  status: string;
}

export interface ReturnLog {
  id: string;
  resi: string;
  date_received: string;
  sender: string;
  qty: number;
  courier: string;
  product_id: string;
  product_name?: string;
  reason: string;
  status: 'Pending' | 'Selesai' | 'Klaim';
}

export interface DamageClaim {
  id: string;
  resi: string;
  date: string;
  courier: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  value: number;
  imageUrl?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_name: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Received';
  items: PurchaseOrderItem[];
}

export interface PackingToolRequest {
  id: string;
  item_name: string;
  qty_requested: number;
  requester: string;
  date: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
}

export interface TempoReseller {
  id: string;
  reseller_name: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface MarketingKit {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  downloadCount: number;
}
