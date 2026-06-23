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
                </button>
                <button
                    onClick={() => setActiveSubTab('harga')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeSubTab === 'harga' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
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
                                className={`py-0.5 px-2.5 text-[10px] font-bold rounded border ${(cat === 'Semua Kategori' && selectedCategory === 'all') || selectedCategory === cat
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

