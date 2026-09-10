import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    FiSearch, FiEdit2, FiPackage, FiAlertTriangle, FiXCircle, FiCheckCircle, 
    FiRefreshCw, FiPlus, FiMinus, FiSave, FiX 
} from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const Inventory = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({ total_products: 0, total_stock_units: 0, low_stock_items: 0, out_of_stock: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [selectedInventory, setSelectedInventory] = useState(null); // For Edit Modal
    const [editStock, setEditStock] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllInventory({ search, stockStatus: stockFilter });
            if (res.data.success) {
                setInventory(res.data.data || []);
                setStats(res.data.stats || {});
            }
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, [search, stockFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openEditModal = (item) => {
        setSelectedInventory(item);
        setEditStock(item.stock_quantity);
    };

    const handleStockUpdate = async () => {
        if (!selectedInventory) return;
        try {
            await ApiService.updateInventoryStock(selectedInventory._id, { 
                stock_quantity: editStock,
                reason: 'Manual update by Admin'
            });
            toast.success('Stock updated successfully');
            setSelectedInventory(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const getStatusBadge = (status, stockQuantity, lowStockLimit) => {
        if (status === 'out_of_stock' || stockQuantity === 0) {
            return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold !bg-red-50 !text-red-700 !border !border-red-200"><FiXCircle className="inline mr-1" /> Out of Stock</span>;
        }
        if (status === 'low_stock' || stockQuantity <= lowStockLimit) {
            return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold !bg-yellow-50 !text-yellow-700 !border !border-yellow-200"><FiAlertTriangle className="inline mr-1" /> Low Stock</span>;
        }
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold !bg-emerald-50 !text-emerald-700 !border !border-emerald-200"><FiCheckCircle className="inline mr-1" /> In Stock</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar title="Inventory Management" subtitle="Track product stock and availability" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
                {/* Stats Cards (Fixed) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-black">{stats.total_products}</p>
                        <p className="text-xs !text-gray-600">Total Products</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-blue-600">{stats.total_stock_units}</p>
                        <p className="text-xs !text-gray-600">Total Stock Units</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-yellow-600">{stats.low_stock_items}</p>
                        <p className="text-xs !text-gray-600">Low Stock Items</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                        <p className="text-2xl font-bold !text-red-600">{stats.out_of_stock}</p>
                        <p className="text-xs !text-gray-600">Out of Stock</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Product Name or SKU..." 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    <select 
                        value={stockFilter} 
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-6 h-6 inline" /></div> : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Seller</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Price</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Last Updated</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inventory.map((item) => (
                                    <tr key={item._id} className="hover:bg-blue-50/30">
                                        <td className="px-4 py-3 text-left">
                                            <div className="flex items-center gap-3">
                                                {item.product_image ? <img src={item.product_image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><FiPackage /></div>}
                                                <div>
                                                    <p className="font-semibold !text-black">{item.product_name}</p>
                                                    <p className="text-xs !text-gray-500">SKU: {item.product_sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-left !text-gray-700">{item.seller_name}</td>
                                        <td className="px-4 py-3 text-left !text-gray-700">₹{item.price}</td>
                                        <td className="px-4 py-3 text-center !text-gray-800 font-bold">{item.stock_quantity}</td>
                                        <td className="px-4 py-3 text-left">{getStatusBadge(item.stock_status, item.stock_quantity, item.low_stock_limit)}</td>
                                        <td className="px-4 py-3 text-left !text-gray-600">{formatDate(item.updated_at)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => openEditModal(item)}
                                                className="p-2 rounded-lg bg-blue-50 !text-blue-600 hover:bg-blue-100"
                                                title="Edit Stock"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? <div className="p-10 text-center"><FiRefreshCw className="animate-spin !text-blue-600 w-6 h-6 inline" /></div> : (
                        inventory.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><FiPackage /></div>
                                    <div className="flex-1">
                                        <p className="font-semibold !text-black">{item.product_name}</p>
                                        <p className="text-xs !text-gray-500">SKU: {item.product_sku} | Seller: {item.seller_name}</p>
                                    </div>
                                    <span className="text-xl font-bold !text-blue-600">{item.stock_quantity}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div>{getStatusBadge(item.stock_status, item.stock_quantity, item.low_stock_limit)}</div>
                                    <button onClick={() => openEditModal(item)} className="p-2 rounded-lg bg-blue-50 !text-blue-600"><FiEdit2 /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Stock Modal */}
            {selectedInventory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold !text-black mb-4">Update Stock</h3>
                        <p className="text-sm !text-gray-600 mb-2">Product: <span className="font-bold">{selectedInventory.product_name}</span></p>
                        <div className="flex items-center gap-3 mb-4">
                            <button 
                                onClick={() => setEditStock(prev => Math.max(0, prev - 1))}
                                className="p-2 rounded-lg bg-red-50 !text-red-600"
                            ><FiMinus /></button>
                            <input 
                                type="number" 
                                value={editStock} 
                                onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full px-4 py-2 border rounded-xl !text-black text-center font-bold text-xl"
                            />
                            <button 
                                onClick={() => setEditStock(prev => prev + 1)}
                                className="p-2 rounded-lg bg-green-50 !text-green-600"
                            ><FiPlus /></button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setSelectedInventory(null)} className="flex-1 py-2 border rounded-xl !text-gray-600">Cancel</button>
                            <button onClick={handleStockUpdate} className="flex-1 py-2 bg-blue-600 !text-white rounded-xl flex items-center justify-center gap-2"><FiSave /> Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;