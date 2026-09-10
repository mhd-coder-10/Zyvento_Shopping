// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiArrowLeft, FiRefreshCw, FiTag, FiCalendar, FiUsers, FiDollarSign, FiPercent } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const CouponDetails = () => {
//     const { code } = useParams(); // URL se coupon code milta hai (e.g., SUMMER20)
//     const navigate = useNavigate();
//     const [coupon, setCoupon] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchCoupon();
//     }, [code]);

//     const fetchCoupon = async () => {
//         try {
//             const res = await ApiService.getCouponByCode(code);
//             if (res.data.success) {
//                 setCoupon(res.data.data);
//             } else {
//                 toast.error('Coupon not found');
//                 navigate('/admin/coupons');
//             }
//         } catch (error) {
//             toast.error('Failed to load coupon details');
//             navigate('/admin/coupons');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
//     if (!coupon) return <div className="text-center py-12 !text-gray-600">Coupon not found</div>;

//     const formatDate = (date) => {
//         if (!date) return '-';
//         return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//     };

//     const isExpired = () => new Date(coupon.expiryDate) < new Date();

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Coupon Details"
//                 subtitle={coupon.code}
//                 actions={
//                     <div className="flex gap-2">
//                         <button onClick={() => navigate(`/admin/coupons/edit/${coupon._id}`)} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 !text-yellow-600 rounded-xl">
//                             Edit
//                         </button>
//                         <button onClick={() => navigate('/admin/coupons')} className="flex items-center gap-2 px-4 py-2 border !text-blue-600 rounded-xl bg-white">
//                             <FiArrowLeft /> Back
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
//                 {/* Coupon Info Card */}
//                 <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <div className="flex flex-col md:flex-row md:items-center gap-4">
//                         <div className="p-4 bg-blue-50 rounded-xl !text-blue-600">
//                             <FiTag className="w-8 h-8" />
//                         </div>
//                         <div className="flex-1">
//                             <h2 className="text-2xl font-bold !text-black font-mono">{coupon.code}</h2>
//                             <p className="!text-gray-600 mt-1">{coupon.description || 'No description'}</p>
//                             <div className="mt-2 flex gap-2">
//                                 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isExpired() ? 'bg-red-50 !text-red-700' : coupon.status === 'active' ? 'bg-emerald-50 !text-emerald-700' : 'bg-gray-100 !text-gray-600'}`}>
//                                     {isExpired() ? 'Expired' : coupon.status}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Details Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3">Discount Details</h3>
//                         <p className="text-sm !text-gray-600"><strong>Type:</strong> {coupon.discountType}</p>
//                         <p className="text-sm !text-gray-600"><strong>Value:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
//                         <p className="text-sm !text-gray-600"><strong>Min Order:</strong> ₹{coupon.minOrderAmount || 0}</p>
//                         <p className="text-sm !text-gray-600"><strong>Max Discount:</strong> {coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : 'No limit'}</p>
//                     </div>
//                     <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                         <h3 className="font-semibold !text-black mb-3">Usage & Validity</h3>
//                         <p className="text-sm !text-gray-600"><strong>Start Date:</strong> {formatDate(coupon.startDate)}</p>
//                         <p className="text-sm !text-gray-600"><strong>Expiry Date:</strong> {formatDate(coupon.expiryDate)}</p>
//                         <p className="text-sm !text-gray-600"><strong>Usage Limit:</strong> {coupon.usageLimit || 'Unlimited'}</p>
//                         <p className="text-sm !text-gray-600"><strong>Per User Limit:</strong> {coupon.perUserLimit || 1}</p>
//                         <p className="text-sm !text-gray-600"><strong>Used Count:</strong> {coupon.usedCount || 0}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CouponDetails;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiTag, FiCalendar, FiUsers, FiDollarSign, FiPercent } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CouponDetails = () => {
    const { code } = useParams(); // coupon_code from URL
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupon();
    }, [code]);

    const fetchCoupon = async () => {
        try {
            const res = await ApiService.getCouponByCode(code);
            if (res.data.success) {
                setCoupon(res.data.data);
            }
        } catch (error) {
            toast.error('Coupon not found');
            navigate('/admin/coupons');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!coupon) return <div className="text-center py-12 !text-gray-600">Coupon not found</div>;

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isExpired = () => new Date(coupon.expiryDate) < new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Coupon Details"
                subtitle={coupon.code}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/coupons/edit/${coupon.code}`)} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 !text-yellow-600 rounded-xl">
                            Edit
                        </button>
                        <button onClick={() => navigate('/admin/coupons')} className="flex items-center gap-2 px-4 py-2 border !text-blue-600 rounded-xl bg-white">
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                }
            />

            <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl !text-blue-600">
                            <FiTag className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold !text-black font-mono">{coupon.code}</h2>
                            <p className="!text-gray-600 mt-1">{coupon.description || 'No description'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Discount Details</h3>
                        <p className="text-sm !text-gray-600"><strong>Type:</strong> {coupon.discountType}</p>
                        <p className="text-sm !text-gray-600"><strong>Value:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
                        <p className="text-sm !text-gray-600"><strong>Min Order:</strong> ₹{coupon.minOrderAmount || 0}</p>
                        <p className="text-sm !text-gray-600"><strong>Max Discount:</strong> {coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : 'No limit'}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Usage & Validity</h3>
                        <p className="text-sm !text-gray-600"><strong>Start Date:</strong> {formatDate(coupon.startDate)}</p>
                        <p className="text-sm !text-gray-600"><strong>Expiry Date:</strong> {formatDate(coupon.expiryDate)}</p>
                        <p className="text-sm !text-gray-600"><strong>Usage Limit:</strong> {coupon.usageLimit || 'Unlimited'}</p>
                        <p className="text-sm !text-gray-600"><strong>Per User Limit:</strong> {coupon.perUserLimit || 1}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponDetails;