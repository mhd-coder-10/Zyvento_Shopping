
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheck, FiX, FiZap, FiPercent, FiCalendar } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CreateCoupon = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const startDateRef = useRef(null);
    const expiryDateRef = useRef(null);
    const [formData, setFormData] = useState({
        code: '', description: '', discountType: 'percentage', discountValue: '',
        minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', perUserLimit: '',
        startDate: '', expiryDate: '', status: 'pending'
    });
    const [errors, setErrors] = useState({});

    const getDerivedStatus = (startDate, expiryDate) => {
        if (!startDate || !expiryDate) return 'pending';
        const now = new Date();
        const start = new Date(startDate);
        const expiry = new Date(expiryDate);
        if (start > now) return 'pending';
        if (expiry < now) return 'expired';
        return 'active';
    };

    // Function to open native date picker via ref
    const openCalendar = (ref) => {
        if (ref.current) {
            ref.current.focus();
            // Modern browsers support showPicker()
            if (ref.current.showPicker) {
                ref.current.showPicker();
            } else {
                ref.current.click(); // fallback for older browsers
            }
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, code: result }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
        if (!formData.discountValue) newErrors.discountValue = 'Discount value is required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };
        updatedForm.status = getDerivedStatus(updatedForm.startDate, updatedForm.expiryDate);
        setFormData(updatedForm);
    };

    const handleStatusChange = (e) => {
        const { value } = e.target;
        const derivedStatus = getDerivedStatus(formData.startDate, formData.expiryDate);
        if (value !== derivedStatus) {
            setErrors(prev => ({ ...prev, status: `Cannot set '${value}'. Based on selected dates, status should be '${derivedStatus}'.` }));
            return;
        }
        setErrors(prev => ({ ...prev, status: '' }));
        setFormData(prev => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await ApiService.createCoupon({
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
                maxDiscountAmount: parseFloat(formData.maxDiscountAmount) || 0,
                usageLimit: parseInt(formData.usageLimit) || null,
                perUserLimit: parseInt(formData.perUserLimit) || 1
            });
            toast.success('Coupon created successfully');
            navigate('/admin/coupons');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Create Coupon"
                subtitle="Create a new discount coupon"
                actions={<button onClick={() => navigate('/admin/coupons')} className="flex items-center gap-2 px-4 py-2 border !text-blue-600 rounded-xl bg-white"><FiArrowLeft /> Back</button>}
            />

            <div className="max-w-3xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-100 shadow-sm p-6 space-y-4">
                    {/* Coupon Code */}
                    <div>
                        <label className="text-sm font-medium !text-gray-700">Coupon Code *</label>
                        <div className="flex gap-3">
                            <input type="text" name="code" value={formData.code} onChange={handleChange} className={`flex-1 px-3 py-2 border rounded-lg !text-black uppercase ${errors.code ? 'border-red-500' : 'border-gray-200'}`} />
                            <button type="button" onClick={generateCode} className="px-4 py-2 bg-gray-100 !text-gray-700 rounded-lg"><FiZap /> Generate</button>
                        </div>
                        {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Discount Type</label>
                            <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg !text-black">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Discount Value *</label>
                            <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg !text-black ${errors.discountValue ? 'border-red-500' : 'border-gray-200'}`} />
                            {errors.discountValue && <p className="text-sm text-red-500 mt-1">{errors.discountValue}</p>}
                        </div>
                    </div>

                    {/* Min Order & Max Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Minimum Order Amount</label>
                            <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg !text-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Maximum Discount</label>
                            <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg !text-black" />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Usage Limit</label>
                            <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg !text-black" />
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Per User Limit</label>
                            <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg !text-black" />
                        </div>
                    </div>

                    {/* Dates with Perfect Custom Calendar Icon - Using ref + showPicker() */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Start Date</label>
                            <div className="relative">
                                <input
                                    ref={startDateRef}
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border rounded-lg !text-black cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => openCalendar(startDateRef)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                >
                                    <FiCalendar className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium !text-gray-700">Expiry Date *</label>
                            <div className="relative">
                                <input
                                    ref={expiryDateRef}
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleDateChange}
                                    className={`w-full px-3 py-2 border rounded-lg !text-black cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.expiryDate ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => openCalendar(expiryDateRef)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                >
                                    <FiCalendar className="w-5 h-5" />
                                </button>
                            </div>
                            {errors.expiryDate && <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium !text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-lg !text-black" />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-sm font-medium !text-gray-700">Status</label>
                        <select name="status" value={formData.status} onChange={handleStatusChange} className="w-full px-3 py-2 border rounded-lg !text-black">
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                        </select>
                        {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 !text-white rounded-lg"><FiCheck /> {loading ? 'Creating...' : 'Create Coupon'}</button>
                        <button type="button" onClick={() => navigate('/admin/coupons')} className="px-6 py-2 border !text-gray-700 rounded-lg"><FiX /> Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCoupon;