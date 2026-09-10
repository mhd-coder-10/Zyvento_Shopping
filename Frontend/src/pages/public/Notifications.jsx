// ============================================================
// SAVED ADDRESSES PAGE
// Description: Manage saved addresses
// APIs: getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress
// ============================================================

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FiMapPin,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
    FiHome,
    FiBriefcase
} from 'react-icons/fi';
import ApiService from '../../api/ApiService';

const SavedAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        address_type: 'home',
        is_default: false,
    });

    // Load addresses
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getAddresses();

            if (response.data.success) {
                setAddresses(response.data.data || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    // Handle form submit (Create/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (editingAddress) {
                response = await ApiService.updateAddress(editingAddress._id, formData);
                toast.success('Address updated successfully!');
            } else {
                response = await ApiService.createAddress(formData);
                toast.success('Address added successfully!');
            }

            if (response.data.success) {
                loadAddresses();
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    // Delete address
    const handleDelete = async (addressId) => {
        if (!window.confirm('Delete this address?')) return;

        try {
            const response = await ApiService.deleteAddress(addressId);

            if (response.data.success) {
                toast.success('Address deleted');
                setAddresses(addresses.filter((a) => a._id !== addressId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete address');
        }
    };

    // Set default address
    const handleSetDefault = async (addressId) => {
        try {
            const response = await ApiService.setDefaultAddress(addressId);

            if (response.data.success) {
                toast.success('Default address updated');
                loadAddresses();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set default');
        }
    };

    // Edit address
    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            full_name: address.full_name || '',
            phone: address.phone || '',
            address_line1: address.address_line1 || '',
            address_line2: address.address_line2 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            country: address.country || 'India',
            address_type: address.address_type || 'home',
            is_default: address.is_default || false,
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setShowForm(false);
        setEditingAddress(null);
        setFormData({
            full_name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            address_type: 'home',
            is_default: false,
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                    <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FiPlus />
                    Add New Address
                </button>
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.address_line1}
                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2 (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.address_line2}
                                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Type
                                </label>
                                <select
                                    value={formData.address_type}
                                    onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isDefault" className="text-sm text-gray-700">
                                    Set as default address
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No addresses saved</h3>
                    <p className="text-gray-500 mt-1">Add your first delivery address</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`bg-white rounded-xl shadow-sm border p-6 ${address.is_default ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{address.full_name}</h3>
                                        {address.is_default && (
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                                    <p className="text-sm text-gray-600">
                                        {address.address_line1}
                                        {address.address_line2 && `, ${address.address_line2}`}
                                        <br />
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-xs text-gray-400">
                                            {address.address_type === 'home' ? <FiHome className="w-3 h-3" /> : <FiBriefcase className="w-3 h-3" />}
                                        </span>
                                        <span className="text-xs text-gray-400 capitalize">{address.address_type}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {!address.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address._id)}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedAddresses;