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