// Payment gateway configuration - Razorpay, Stripe, wallet settings
// Admin can configure payment gateways and transaction rules

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import {
//     FiSave,
//     FiCreditCard,
//     FiDollarSign,
//     FiShield,
//     FiRefreshCw,
//     FiCheckCircle,
//     FiInfo,
//     FiKey,
//     FiLock,
//     FiAlertCircle,
// } from 'react-icons/fi';

// const PaymentSettings = () => {
//     const [loading, setLoading] = useState(false);
//     const [activeGateway, setActiveGateway] = useState('razorpay');
//     const [formData, setFormData] = useState({
//         razorpay: {
//             enabled: true,
//             keyId: 'rzp_live_xxxxxxxxxxxx',
//             keySecret: 'xxxxxxxxxxxxxxxxxxxxxxxx',
//             webhookSecret: 'xxxxxxxxxxxxxxxxxxxxxxxx',
//         },
//         stripe: {
//             enabled: false,
//             publishableKey: 'pk_live_xxxxxxxxxxxx',
//             secretKey: 'sk_live_xxxxxxxxxxxx',
//             webhookSecret: 'whsec_xxxxxxxxxxxx',
//         },
//         wallet: {
//             enabled: true,
//             minBalance: 0,
//             maxBalance: 100000,
//         },
//         cashOnDelivery: {
//             enabled: true,
//             additionalCharge: 0,
//             minOrderAmount: 0,
//             maxOrderAmount: 10000,
//         },
//         bankTransfer: {
//             enabled: false,
//             bankName: 'Example Bank',
//             accountNumber: 'XXXXXXXXXXXX',
//             ifscCode: 'XXXX0000000',
//             accountHolder: 'Zyvento Shopping Pvt Ltd',
//         },
//         commission: {
//             type: 'percentage',
//             value: 5,
//             fixedAmount: 0,
//             minimumAmount: 0,
//             maximumAmount: 1000,
//         },
//         refundPolicy: {
//             enabled: true,
//             windowDays: 7,
//             restockingFee: 10,
//         },
//     });

//     const handleGatewayChange = (gateway) => {
//         setActiveGateway(gateway);
//     };

//     const handleChange = (section, field, value) => {
//         setFormData((prev) => ({
//             ...prev,
//             [section]: {
//                 ...prev[section],
//                 [field]: value,
//             },
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             // In production: await ApiService.updateSystemSettings({ payment: formData });
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             toast.success('Payment settings updated successfully');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update settings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const gateways = [
//         { id: 'razorpay', label: 'Razorpay', icon: FiCreditCard },
//         { id: 'stripe', label: 'Stripe', icon: FiCreditCard },
//         { id: 'wallet', label: 'Wallet', icon: FiDollarSign },
//         { id: 'cashOnDelivery', label: 'Cash on Delivery', icon: FiRefreshCw },
//         { id: 'bankTransfer', label: 'Bank Transfer', icon: FiShield },
//     ];

//     const renderGatewayConfig = () => {
//         switch (activeGateway) {
//             case 'razorpay':
//                 const rp = formData.razorpay;
//                 return (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <label className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={rp.enabled}
//                                     onChange={(e) => handleChange('razorpay', 'enabled', e.target.checked)}
//                                     className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="text-sm text-gray-700">Enable Razorpay</span>
//                             </label>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Key ID
//                             </label>
//                             <input
//                                 type="text"
//                                 value={rp.keyId}
//                                 onChange={(e) => handleChange('razorpay', 'keyId', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Key Secret
//                             </label>
//                             <input
//                                 type="password"
//                                 value={rp.keySecret}
//                                 onChange={(e) => handleChange('razorpay', 'keySecret', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Webhook Secret
//                             </label>
//                             <input
//                                 type="password"
//                                 value={rp.webhookSecret}
//                                 onChange={(e) => handleChange('razorpay', 'webhookSecret', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                     </div>
//                 );

//             case 'stripe':
//                 const st = formData.stripe;
//                 return (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <label className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={st.enabled}
//                                     onChange={(e) => handleChange('stripe', 'enabled', e.target.checked)}
//                                     className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="text-sm text-gray-700">Enable Stripe</span>
//                             </label>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Publishable Key
//                             </label>
//                             <input
//                                 type="text"
//                                 value={st.publishableKey}
//                                 onChange={(e) => handleChange('stripe', 'publishableKey', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Secret Key
//                             </label>
//                             <input
//                                 type="password"
//                                 value={st.secretKey}
//                                 onChange={(e) => handleChange('stripe', 'secretKey', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Webhook Secret
//                             </label>
//                             <input
//                                 type="password"
//                                 value={st.webhookSecret}
//                                 onChange={(e) => handleChange('stripe', 'webhookSecret', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                     </div>
//                 );

//             case 'wallet':
//                 const w = formData.wallet;
//                 return (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <label className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={w.enabled}
//                                     onChange={(e) => handleChange('wallet', 'enabled', e.target.checked)}
//                                     className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="text-sm text-gray-700">Enable Wallet</span>
//                             </label>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Minimum Balance (₹)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={w.minBalance}
//                                     onChange={(e) => handleChange('wallet', 'minBalance', parseFloat(e.target.value))}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Maximum Balance (₹)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={w.maxBalance}
//                                     onChange={(e) => handleChange('wallet', 'maxBalance', parseFloat(e.target.value))}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );

//             case 'cashOnDelivery':
//                 const cod = formData.cashOnDelivery;
//                 return (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <label className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={cod.enabled}
//                                     onChange={(e) => handleChange('cashOnDelivery', 'enabled', e.target.checked)}
//                                     className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="text-sm text-gray-700">Enable Cash on Delivery</span>
//                             </label>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Additional Charge (₹)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={cod.additionalCharge}
//                                     onChange={(e) => handleChange('cashOnDelivery', 'additionalCharge', parseFloat(e.target.value))}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Minimum Order Amount (₹)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={cod.minOrderAmount}
//                                     onChange={(e) => handleChange('cashOnDelivery', 'minOrderAmount', parseFloat(e.target.value))}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );

//             case 'bankTransfer':
//                 const bt = formData.bankTransfer;
//                 return (
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <label className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={bt.enabled}
//                                     onChange={(e) => handleChange('bankTransfer', 'enabled', e.target.checked)}
//                                     className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="text-sm text-gray-700">Enable Bank Transfer</span>
//                             </label>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Bank Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={bt.bankName}
//                                     onChange={(e) => handleChange('bankTransfer', 'bankName', e.target.value)}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Account Number
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={bt.accountNumber}
//                                     onChange={(e) => handleChange('bankTransfer', 'accountNumber', e.target.value)}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     IFSC Code
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={bt.ifscCode}
//                                     onChange={(e) => handleChange('bankTransfer', 'ifscCode', e.target.value)}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Account Holder Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={bt.accountHolder}
//                                     onChange={(e) => handleChange('bankTransfer', 'accountHolder', e.target.value)}
//                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h3>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Commission Settings */}
//                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <h4 className="text-sm font-medium text-blue-800 mb-3">Commission Settings</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Commission Type
//                             </label>
//                             <select
//                                 value={formData.commission.type}
//                                 onChange={(e) => handleChange('commission', 'type', e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             >
//                                 <option value="percentage">Percentage</option>
//                                 <option value="fixed">Fixed</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 {formData.commission.type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
//                             </label>
//                             <input
//                                 type="number"
//                                 value={formData.commission.value}
//                                 onChange={(e) => handleChange('commission', 'value', parseFloat(e.target.value))}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Maximum Commission (₹)
//                             </label>
//                             <input
//                                 type="number"
//                                 value={formData.commission.maximumAmount}
//                                 onChange={(e) => handleChange('commission', 'maximumAmount', parseFloat(e.target.value))}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Refund Policy */}
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Refund Policy</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Refund Window (Days)
//                             </label>
//                             <input
//                                 type="number"
//                                 value={formData.refundPolicy.windowDays}
//                                 onChange={(e) => handleChange('refundPolicy', 'windowDays', parseInt(e.target.value))}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Restocking Fee (₹)
//                             </label>
//                             <input
//                                 type="number"
//                                 value={formData.refundPolicy.restockingFee}
//                                 onChange={(e) => handleChange('refundPolicy', 'restockingFee', parseFloat(e.target.value))}
//                                 className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Payment Gateways */}
//                 <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Gateways</h4>
//                     <div className="flex flex-wrap gap-2 mb-4">
//                         {gateways.map((gateway) => {
//                             const Icon = gateway.icon;
//                             const isActive = activeGateway === gateway.id;
//                             const isEnabled = formData[gateway.id]?.enabled;
//                             return (
//                                 <button
//                                     key={gateway.id}
//                                     type="button"
//                                     onClick={() => handleGatewayChange(gateway.id)}
//                                     className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isActive
//                                             ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
//                                             : 'border-gray-200 hover:bg-gray-50 text-gray-600'
//                                         }`}
//                                 >
//                                     <Icon className="w-4 h-4" />
//                                     {gateway.label}
//                                     {isEnabled ? (
//                                         <FiCheckCircle className="w-4 h-4 text-green-500" />
//                                     ) : (
//                                         <FiAlertCircle className="w-4 h-4 text-gray-300" />
//                                     )}
//                                 </button>
//                             );
//                         })}
//                     </div>

//                     <div className="p-4 border border-gray-200 rounded-lg">
//                         {renderGatewayConfig()}
//                     </div>
//                 </div>

//                 <div className="pt-6 border-t border-gray-200 flex items-center gap-3">
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
//                     >
//                         <FiSave className="w-4 h-4" />
//                         {loading ? 'Saving...' : 'Save Settings'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PaymentSettings;






import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiCreditCard, FiDollarSign, FiShield, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useSettings } from '../../../utils/useSettings';

const PaymentSettings = () => {
    const { settings, loading, updateSettings } = useSettings('payment');
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [activeGateway, setActiveGateway] = useState('razorpay');

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setFormData(settings);
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const success = await updateSettings(formData);
            if (success) toast.success('Payment settings updated successfully!');
            else toast.error('Failed to update settings.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading payment settings...</div>;
    }

    const gateways = [
        { id: 'razorpay', label: 'Razorpay', icon: FiCreditCard, enabled: formData.razorpayEnabled },
        { id: 'stripe', label: 'Stripe', icon: FiCreditCard, enabled: formData.stripeEnabled },
        { id: 'wallet', label: 'Wallet', icon: FiDollarSign, enabled: formData.walletEnabled },
        { id: 'cashOnDelivery', label: 'Cash on Delivery', icon: FiRefreshCw, enabled: formData.codEnabled },
        { id: 'bankTransfer', label: 'Bank Transfer', icon: FiShield, enabled: formData.bankTransferEnabled },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Commission Settings */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">Commission Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Type</label>
                            <select
                                name="commissionType"
                                value={formData.commissionType || 'percentage'}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.commissionType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                            </label>
                            <input
                                type="number"
                                name="commissionValue"
                                value={formData.commissionValue || 0}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Commission (₹)</label>
                            <input
                                type="number"
                                name="commissionMax"
                                value={formData.commissionMax || 0}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Refund Policy */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Refund Policy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Window (Days)</label>
                            <input
                                type="number"
                                name="refundWindowDays"
                                value={formData.refundWindowDays || 7}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Restocking Fee (₹)</label>
                            <input
                                type="number"
                                name="restockingFee"
                                value={formData.restockingFee || 0}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Gateways */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Gateways</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {gateways.map((gateway) => {
                            const Icon = gateway.icon;
                            const isActive = activeGateway === gateway.id;
                            return (
                                <button
                                    key={gateway.id}
                                    type="button"
                                    onClick={() => setActiveGateway(gateway.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isActive
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {gateway.label}
                                    {gateway.enabled ? (
                                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <FiAlertCircle className="w-4 h-4 text-gray-300" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Individual Gateway Config */}
                    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                        {activeGateway === 'razorpay' && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="razorpayEnabled"
                                        checked={formData.razorpayEnabled || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    Enable Razorpay
                                </label>
                                <input type="text" name="razorpayKeyId" value={formData.razorpayKeyId || ''} onChange={handleChange} placeholder="Key ID" className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                                <input type="password" name="razorpayKeySecret" value={formData.razorpayKeySecret || ''} onChange={handleChange} placeholder="Key Secret" className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                            </>
                        )}
                        {activeGateway === 'stripe' && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="stripeEnabled"
                                        checked={formData.stripeEnabled || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    Enable Stripe
                                </label>
                                <input type="text" name="stripePublishableKey" value={formData.stripePublishableKey || ''} onChange={handleChange} placeholder="Publishable Key" className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                                <input type="password" name="stripeSecretKey" value={formData.stripeSecretKey || ''} onChange={handleChange} placeholder="Secret Key" className="w-full px-3 py-2 rounded-lg border border-gray-200" />
                            </>
                        )}
                        {activeGateway === 'wallet' && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="walletEnabled"
                                        checked={formData.walletEnabled || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    Enable Wallet
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="walletMinBalance" value={formData.walletMinBalance || 0} onChange={handleChange} placeholder="Min Balance" className="px-3 py-2 rounded-lg border border-gray-200" />
                                    <input type="number" name="walletMaxBalance" value={formData.walletMaxBalance || 100000} onChange={handleChange} placeholder="Max Balance" className="px-3 py-2 rounded-lg border border-gray-200" />
                                </div>
                            </>
                        )}
                        {activeGateway === 'cashOnDelivery' && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="codEnabled"
                                        checked={formData.codEnabled || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    Enable Cash on Delivery
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="codAdditionalCharge" value={formData.codAdditionalCharge || 0} onChange={handleChange} placeholder="Additional Charge" className="px-3 py-2 rounded-lg border border-gray-200" />
                                    <input type="number" name="codMinOrder" value={formData.codMinOrder || 0} onChange={handleChange} placeholder="Min Order Amount" className="px-3 py-2 rounded-lg border border-gray-200" />
                                </div>
                            </>
                        )}
                        {activeGateway === 'bankTransfer' && (
                            <>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="bankTransferEnabled"
                                        checked={formData.bankTransferEnabled || false}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    Enable Bank Transfer
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleChange} placeholder="Bank Name" className="px-3 py-2 rounded-lg border border-gray-200" />
                                    <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} placeholder="Account Number" className="px-3 py-2 rounded-lg border border-gray-200" />
                                    <input type="text" name="bankIfsc" value={formData.bankIfsc || ''} onChange={handleChange} placeholder="IFSC Code" className="px-3 py-2 rounded-lg border border-gray-200" />
                                    <input type="text" name="bankAccountHolder" value={formData.bankAccountHolder || ''} onChange={handleChange} placeholder="Account Holder" className="px-3 py-2 rounded-lg border border-gray-200" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentSettings;