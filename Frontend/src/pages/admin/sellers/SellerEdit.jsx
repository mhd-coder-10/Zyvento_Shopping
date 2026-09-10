import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft, FiSave, FiPercent, FiClock, FiShield,
    FiUser, FiBriefcase, FiMapPin, FiMail, FiPhone,
    FiEdit2, FiCheckCircle, FiXCircle, FiFileText, FiAlertCircle,
    FiUserCheck, FiUserX, FiRefreshCw, FiChevronDown, FiX, FiEye, FiDownload,
} from 'react-icons/fi';

import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const SellerEdit = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showStatusForm, setShowStatusForm] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusFormData, setStatusFormData] = useState({});
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, rating: 0 });
    const [formData, setFormData] = useState({
        business_name: '', owner_name: '', email: '', mobile_number: '',
        business_type: 'individual', gst_number: '', pan_number: '',
        business_address: { street: '', city: '', state: '', country: '', zip_code: '' },
        commission_rate: 10,
        settings: { order_processing_time: 24, return_policy: '' },
        account_status: 'pending', verification_status: 'pending',
    });

    useEffect(() => {
        fetchSeller();
    }, [sellerId]);

    const fetchSeller = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getSellerById(sellerId);
            if (response.data.success) {
                const data = response.data.data;
                setSeller(data);
                setFormData({
                    business_name: data.business_name || '',
                    owner_name: data.owner_name || '',
                    email: data.email || '',
                    mobile_number: data.mobile_number || '',
                    business_type: data.business_type || 'individual',
                    gst_number: data.gst_number || '',
                    pan_number: data.pan_number || '',
                    business_address: {
                        street: data.business_address?.street || '',
                        city: data.business_address?.city || '',
                        state: data.business_address?.state || '',
                        country: data.business_address?.country || '',
                        zip_code: data.business_address?.zip_code || '',
                    },
                    commission_rate: data.commission_rate || 10,
                    settings: {
                        order_processing_time: data.settings?.order_processing_time || 24,
                        return_policy: data.settings?.return_policy || '',
                    },
                    account_status: data.account_status || 'pending',
                    verification_status: data.verification_status || 'pending',
                });
                setSelectedStatus(data.account_status || 'pending');
                setStats({
                    products: data.productCount || 0,
                    orders: data.orderCount || 0,
                    revenue: data.revenue || 0,
                    rating: data.rating || 0,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch seller');
            navigate('/admin/sellers');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, business_address: { ...prev.business_address, [name]: value } }));
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, settings: { ...prev.settings, [name]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ApiService.updateSellerDetails(sellerId, formData);
            toast.success('Seller details updated successfully');
            fetchSeller();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update seller');
        } finally {
            setSaving(false);
        }
    };

    // ✅ Correct Status Transition Logic (User's Requirement)
    const getValidTransitions = (currentStatus) => {
        const transitions = {
            'pending': ['approved', 'rejected'],
            'approved': ['active'],
            'active': ['inactive', 'suspended'],
            'inactive': ['active', 'suspended'],
            'suspended': ['active', 'inactive'],
            'rejected': ['pending', 'approved'],
        };
        return transitions[currentStatus] || [];
    };

    // ✅ Check if transition is valid
    const isValidTransition = (currentStatus, newStatus) => {
        if (currentStatus === newStatus) {
            return { valid: false, message: `Status is already set to ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}` };
        }

        const allowed = getValidTransitions(currentStatus);
        if (allowed.includes(newStatus)) {
            return { valid: true };
        }

        const statusLabels = {
            'pending': 'Pending', 'approved': 'Approved', 'active': 'Active',
            'inactive': 'Inactive', 'suspended': 'Suspended', 'rejected': 'Rejected'
        };
        const allowedLabels = allowed.map(s => statusLabels[s] || s).join(', ');

        return {
            valid: false,
            message: `Cannot change status from ${statusLabels[currentStatus] || currentStatus} to ${statusLabels[newStatus] || newStatus}. Allowed transitions: ${allowedLabels}`
        };
    };

    // ✅ Status Dropdown Change Handler
    const handleStatusDropdownChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus === formData.account_status) return;

        const validation = isValidTransition(formData.account_status, newStatus);
        if (!validation.valid) {
            toast.error(validation.message);
            setSelectedStatus(formData.account_status);
            return;
        }

        setSelectedStatus(newStatus);

        const initialData = {};
        switch (newStatus) {
            case 'approved': initialData.notes = ''; break;
            case 'rejected': initialData.rejection_reason = ''; break;
            case 'suspended': initialData.reason = ''; break;
            case 'active': initialData.notes = ''; break;
            case 'inactive': initialData.notes = ''; break;
            case 'pending': initialData.notes = ''; break;
            default: break;
        }
        setStatusFormData(initialData);
        setShowStatusForm(true);
    };

    const handleStatusFormChange = (e) => {
        const { name, value } = e.target;
        setStatusFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ Status Form Submit - Single Click Fix
    // const handleStatusFormSubmit = async (e) => {
    //     e.preventDefault();
    //     if (saving) return;
    //     setSaving(true);
    //     try {
    //         const action = selectedStatus;
    //         let newStatus = '';

    //         switch (action) {
    //             case 'approved':
    //                 await ApiService.approveSeller(sellerId, { notes: statusFormData.notes || '' });
    //                 newStatus = 'approved';
    //                 break;
    //             case 'rejected':
    //                 await ApiService.rejectSeller(sellerId, { rejection_reason: statusFormData.rejection_reason });
    //                 newStatus = 'rejected';
    //                 break;
    //             case 'suspended':
    //                 await ApiService.suspendSeller(sellerId, { reason: statusFormData.reason });
    //                 newStatus = 'suspended';
    //                 break;
    //             case 'active':
    //                 await ApiService.activateSeller(sellerId, { notes: statusFormData.notes || '' });
    //                 newStatus = 'active';
    //                 break;
    //             case 'inactive':
    //                 // ✅ Inactive status update via updateSellerDetails (ya direct)
    //                 await ApiService.updateSellerDetails(sellerId, { account_status: 'inactive' });
    //                 newStatus = 'inactive';
    //                 break;
    //             case 'pending':
    //                 await ApiService.updateSellerDetails(sellerId, { account_status: 'pending' });
    //                 newStatus = 'pending';
    //                 break;
    //             default:
    //                 break;
    //         }

    //         setFormData(prev => ({ ...prev, account_status: newStatus }));
    //         setSeller(prev => prev ? { ...prev, account_status: newStatus } : prev);
    //         setSelectedStatus(newStatus);
    //         setShowStatusForm(false);
    //         toast.success(`Status updated to ${newStatus} successfully`);

    //         await fetchSeller();
    //     } catch (error) {
    //         fetchSeller();
    //         toast.error(error.response?.data?.message || 'Failed to update status');
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    const handleStatusFormSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const action = selectedStatus;
            let newStatus = '';

            switch (action) {
                case 'approved':
                    await ApiService.approveSeller(sellerId, { notes: statusFormData.notes || '' });
                    newStatus = 'approved';
                    break;
                case 'rejected':
                    await ApiService.rejectSeller(sellerId, { rejection_reason: statusFormData.rejection_reason });
                    newStatus = 'rejected';
                    break;
                case 'suspended':
                    await ApiService.suspendSeller(sellerId, { reason: statusFormData.reason });
                    newStatus = 'suspended';
                    break;
                case 'active':
                    await ApiService.activateSeller(sellerId, { notes: statusFormData.notes || '' });
                    newStatus = 'active';
                    break;
                case 'inactive':
                    // ✅ CHANGE YAHAN HAI - Dedicated API use karo
                    await ApiService.deactivateSeller(sellerId, {});
                    newStatus = 'inactive';
                    break;
                case 'pending':
                    // ✅ CHANGE YAHAN HAI - Dedicated API use karo
                    await ApiService.resetToPending(sellerId, {});
                    newStatus = 'pending';
                    break;
                default:
                    break;
            }

            setFormData(prev => ({ ...prev, account_status: newStatus }));
            setSeller(prev => prev ? { ...prev, account_status: newStatus } : prev);
            setSelectedStatus(newStatus);
            setShowStatusForm(false);
            toast.success(`Status updated to ${newStatus} successfully`);

            await fetchSeller();
        } catch (error) {
            fetchSeller();
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    // ✅ Document Verify Handler
    const handleDocumentVerify = async () => {
        setSaving(true);
        try {
            await ApiService.verifySellerKYC(sellerId, {
                status: 'verified',
                notes: 'Document verified by admin',
                document_verified: true,
            });
            setFormData(prev => ({ ...prev, account_status: 'approved', verification_status: 'verified' }));
            setSeller(prev => prev ? { ...prev, account_status: 'approved', verification_status: 'verified' } : prev);
            setSelectedStatus('approved');
            toast.success('Documents verified! Status updated to Approved.');
            await fetchSeller();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify documents');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { color: 'bg-amber-50 text-amber-800 border border-amber-300', icon: FiClock, label: 'Pending' },
            approved: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Approved' },
            rejected: { color: 'bg-rose-50 text-rose-800 border border-rose-300', icon: FiXCircle, label: 'Rejected' },
            suspended: { color: 'bg-orange-50 text-orange-800 border border-orange-300', icon: FiAlertCircle, label: 'Suspended' },
            active: { color: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-gray-50 text-gray-700 border border-gray-300', icon: FiUserX, label: 'Inactive' },
        };
        const { color, icon: Icon, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
                <Icon className="w-3 h-3" /> {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <FiRefreshCw className="animate-spin text-blue-600 w-8 h-8 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading seller details...</p>
                </div>
            </div>
        );
    }

    const isDocumentVerified = seller?.verification_status === 'verified' || formData.verification_status === 'verified';
    const validTransitions = getValidTransitions(formData.account_status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Edit Seller"
                subtitle={seller?.business_name || 'Seller'}
                actions={
                    <button onClick={() => navigate(`/admin/sellers/${sellerId}`)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Details
                    </button>
                }
            />

            <div className="max-w-5xl mx-auto p-4 md:p-6">
                {/* 1. Business Information Form */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Business Name *</label><input type="text" name="business_name" value={formData.business_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Owner Name *</label><input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number *</label><input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Business Type</label><select name="business_type" value={formData.business_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="individual">Individual</option><option value="company">Company</option><option value="brand">Brand</option><option value="partnership">Partnership</option></select></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Commission Rate (%)</label><input type="number" name="commission_rate" value={formData.commission_rate} onChange={handleChange} min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">GST Number</label><input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">PAN Number</label><input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Business Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="street" placeholder="Street" value={formData.business_address.street} onChange={handleAddressChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="city" placeholder="City" value={formData.business_address.city} onChange={handleAddressChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="state" placeholder="State" value={formData.business_address.state} onChange={handleAddressChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="country" placeholder="Country" value={formData.business_address.country} onChange={handleAddressChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" name="zip_code" placeholder="Zip Code" value={formData.business_address.zip_code} onChange={handleAddressChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Order Processing Time (Hours)</label><input type="number" name="order_processing_time" value={formData.settings.order_processing_time} onChange={handleSettingsChange} min="1" max="72" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Return Policy</label><input type="text" name="return_policy" value={formData.settings.return_policy} onChange={handleSettingsChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* 2. Document Management Box */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-blue-600" /> Document Management
                    </h3>
                    {seller?.documents?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {seller.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50">
                                    <div className="p-2 bg-blue-50 rounded-lg"><FiFileText className="w-5 h-5 text-blue-600" /></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 capitalize">{doc.document_type || 'Document'}</p>
                                        <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploaded_at || Date.now()).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <button onClick={() => window.open(doc.document_url, '_blank')} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"><FiEye className="w-4 h-4" /></button>
                                    <button onClick={() => window.open(doc.document_url, '_download')} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"><FiDownload className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500"><FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p>No documents uploaded</p></div>
                    )}
                    <div className="mt-4 flex justify-end">
                        {!isDocumentVerified ? (
                            <button onClick={handleDocumentVerify} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                                <FiCheckCircle className="w-4 h-4" /> Verify Documents
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-sm font-semibold">
                                <FiCheckCircle className="w-4 h-4" /> Documents Verified
                            </span>
                        )}
                    </div>
                    {seller?.updated_by && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            Last updated by: <span className="font-semibold text-gray-700">{seller.updated_by}</span> on {seller.updated_at ? new Date(seller.updated_at).toLocaleString('en-IN') : 'N/A'}
                        </div>
                    )}
                </div>

                {/* 3. Status Management */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Status Management</h3>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Current Status:</span>
                            {getStatusBadge(formData.account_status)}
                        </div>

                        <div className="w-full md:w-auto">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Update Status</label>
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusDropdownChange}
                                    className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-800 font-medium shadow-sm"
                                >
                                    <option value={formData.account_status}>
                                        {formData.account_status.charAt(0).toUpperCase() + formData.account_status.slice(1)} (Current)
                                    </option>
                                    {validTransitions.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {validTransitions.length > 0
                                    ? `Allowed: ${validTransitions.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`
                                    : 'No status changes available'}
                            </p>
                        </div>
                    </div>
                    {isDocumentVerified && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
                            <FiCheckCircle className="w-4 h-4" /> Documents verified. Status cannot be set to Pending.
                        </div>
                    )}
                </div>
            </div>

            {/* Status Form Modal (Dynamic) */}
            {showStatusForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                Update Status to {selectedStatus?.charAt(0).toUpperCase() + selectedStatus?.slice(1)}
                            </h3>
                            <button onClick={() => { setShowStatusForm(false); setSelectedStatus(formData.account_status); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><FiX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleStatusFormSubmit} className="p-5 space-y-4">
                            {selectedStatus === 'approved' && (
                                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label><textarea name="notes" value={statusFormData.notes || ''} onChange={handleStatusFormChange} placeholder="Add approval notes..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                            )}
                            {selectedStatus === 'rejected' && (
                                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Rejection Reason *</label><textarea name="rejection_reason" value={statusFormData.rejection_reason || ''} onChange={handleStatusFormChange} placeholder="Why are you rejecting this seller?" rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                            )}
                            {selectedStatus === 'suspended' && (
                                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Suspension Reason *</label><textarea name="reason" value={statusFormData.reason || ''} onChange={handleStatusFormChange} placeholder="Why are you suspending this seller?" rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                            )}
                            {selectedStatus === 'inactive' && (
                                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label><textarea name="notes" value={statusFormData.notes || ''} onChange={handleStatusFormChange} placeholder="Add notes for inactive status..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                            )}
                            {selectedStatus === 'active' && (
                                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label><textarea name="notes" value={statusFormData.notes || ''} onChange={handleStatusFormChange} placeholder="Add activation notes..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
                            )}
                            {selectedStatus === 'pending' && (
                                <div className="text-sm text-gray-600">
                                    <p>Setting status to <span className="font-semibold">Pending</span> will revert the seller to initial state.</p>
                                    <p className="mt-2 text-xs text-gray-500">No additional data required.</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => { setShowStatusForm(false); setSelectedStatus(formData.account_status); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                                    <FiCheckCircle className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerEdit;