// General system settings - site name, description, logo, currency, timezone
// Admin can configure basic platform settings

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import {
//     FiSave,
//     FiGlobe,
//     FiClock,
//     FiDollarSign,
//     FiImage,
//     FiInfo,
//     FiCheck,
//     FiX,
// } from 'react-icons/fi';

// const GeneralSettings = () => {
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         siteName: 'Zyvento Shopping',
//         siteDescription: 'Multi-vendor e-commerce marketplace',
//         siteLogo: '',
//         favicon: '',
//         currency: 'INR',
//         timezone: 'Asia/Kolkata',
//         dateFormat: 'DD/MM/YYYY',
//         timeFormat: '24h',
//         defaultLanguage: 'en',
//         maintenanceMode: false,
//         registrationEnabled: true,
//         guestCheckout: true,
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//     };

//     const handleImageUpload = (e, field) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (file.size > 2 * 1024 * 1024) {
//             toast.error('Image size must be less than 2MB');
//             return;
//         }

//         const reader = new FileReader();
//         reader.onloadend = () => {
//             setFormData((prev) => ({ ...prev, [field]: reader.result }));
//         };
//         reader.readAsDataURL(file);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             // In production, API call would be here
//             // await ApiService.updateSystemSettings(formData);
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             toast.success('Settings updated successfully');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update settings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currencies = [
//         { value: 'INR', label: 'Indian Rupee (₹)' },
//         { value: 'USD', label: 'US Dollar ($)' },
//         { value: 'EUR', label: 'Euro (€)' },
//         { value: 'GBP', label: 'British Pound (£)' },
//     ];

//     const timezones = [
//         { value: 'Asia/Kolkata', label: 'India (UTC +5:30)' },
//         { value: 'America/New_York', label: 'USA Eastern (UTC -5:00)' },
//         { value: 'America/Los_Angeles', label: 'USA Pacific (UTC -8:00)' },
//         { value: 'Europe/London', label: 'UK (UTC +0:00)' },
//         { value: 'Europe/Paris', label: 'Europe (UTC +1:00)' },
//     ];

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Basic Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Site Name
//                         </label>
//                         <input
//                             type="text"
//                             name="siteName"
//                             value={formData.siteName}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Default Currency
//                         </label>
//                         <select
//                             name="currency"
//                             value={formData.currency}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         >
//                             {currencies.map((c) => (
//                                 <option key={c.value} value={c.value}>{c.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Site Description
//                     </label>
//                     <textarea
//                         name="siteDescription"
//                         value={formData.siteDescription}
//                         onChange={handleChange}
//                         rows={2}
//                         className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
//                     />
//                 </div>

//                 {/* Logo & Favicon */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Site Logo
//                         </label>
//                         <div className="flex items-center gap-4">
//                             <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
//                                 {formData.siteLogo ? (
//                                     <img
//                                         src={formData.siteLogo}
//                                         alt="Logo"
//                                         className="w-full h-full object-cover"
//                                     />
//                                 ) : (
//                                     <FiImage className="w-8 h-8 text-gray-300" />
//                                 )}
//                             </div>
//                             <div>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => handleImageUpload(e, 'siteLogo')}
//                                     className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
//                                 />
//                                 <p className="text-xs text-gray-400 mt-1">Recommended: 200x200px</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Favicon
//                         </label>
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
//                                 {formData.favicon ? (
//                                     <img
//                                         src={formData.favicon}
//                                         alt="Favicon"
//                                         className="w-full h-full object-cover"
//                                     />
//                                 ) : (
//                                     <FiImage className="w-5 h-5 text-gray-300" />
//                                 )}
//                             </div>
//                             <div>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => handleImageUpload(e, 'favicon')}
//                                     className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
//                                 />
//                                 <p className="text-xs text-gray-400 mt-1">Recommended: 64x64px</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Timezone & Format */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Timezone
//                         </label>
//                         <select
//                             name="timezone"
//                             value={formData.timezone}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         >
//                             {timezones.map((t) => (
//                                 <option key={t.value} value={t.value}>{t.label}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Date Format
//                         </label>
//                         <select
//                             name="dateFormat"
//                             value={formData.dateFormat}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         >
//                             <option value="DD/MM/YYYY">DD/MM/YYYY</option>
//                             <option value="MM/DD/YYYY">MM/DD/YYYY</option>
//                             <option value="YYYY/MM/DD">YYYY/MM/DD</option>
//                             <option value="DD-MM-YYYY">DD-MM-YYYY</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Features */}
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Platform Features</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="registrationEnabled"
//                                 checked={formData.registrationEnabled}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">User Registration</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="guestCheckout"
//                                 checked={formData.guestCheckout}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Guest Checkout</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="maintenanceMode"
//                                 checked={formData.maintenanceMode}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Maintenance Mode</span>
//                         </label>
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

// export default GeneralSettings;




// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import { FiSave, FiImage } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';

// const GeneralSettings = () => {
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [formData, setFormData] = useState({
//         siteName: '',
//         siteDescription: '',
//         currency: 'INR',
//         timezone: 'Asia/Kolkata',
//         dateFormat: 'DD/MM/YYYY',
//         registrationEnabled: true,
//         guestCheckout: true,
//         maintenanceMode: false,
//         // add logo, favicon as file uploads if needed
//     });

//     // Fetch settings on mount
//     useEffect(() => {
//         fetchSettings();
//     }, []);

//     const fetchSettings = async () => {
//         setLoading(true);
//         try {
//             const res = await ApiService.get('/admin/settings/group/general');
//             if (res.data.success) {
//                 const settings = res.data.data;
//                 // Convert array to object key-value
//                 const mapped = {};
//                 settings.forEach(item => {
//                     mapped[item.key] = item.value;
//                 });
//                 setFormData(prev => ({ ...prev, ...mapped }));
//             }
//         } catch (error) {
//             toast.error('Failed to load settings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         try {
//             // Send all form fields as settings object
//             await ApiService.put('/admin/settings/group/general', {
//                 settings: formData
//             });
//             toast.success('General settings updated successfully');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Update failed');
//         } finally {
//             setSaving(false);
//         }
//     };

//     // Helper to render input based on data_type? We'll assume all are strings/booleans for simplicity
//     const renderField = (key, label, type = 'text', options = null) => {
//         const value = formData[key] ?? '';
//         return (
//             <div className="w-full sm:w-1/2 px-1 mb-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                     {label}
//                 </label>
//                 {type === 'select' ? (
//                     <select
//                         name={key}
//                         value={value}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
//                     >
//                         {options.map(opt => (
//                             <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                     </select>
//                 ) : type === 'checkbox' ? (
//                     <input
//                         type="checkbox"
//                         name={key}
//                         checked={value}
//                         onChange={handleChange}
//                         className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                     />
//                 ) : (
//                     <input
//                         type={type}
//                         name={key}
//                         value={value}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />
//                 )}
//             </div>
//         );
//     };

//     if (loading) {
//         return <div className="text-center py-8">Loading...</div>;
//     }

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="flex flex-wrap -mx-1">
//                     {renderField('siteName', 'Site Name', 'text')}
//                     {renderField('currency', 'Currency', 'select', [
//                         { value: 'INR', label: 'Indian Rupee (₹)' },
//                         { value: 'USD', label: 'US Dollar ($)' },
//                         { value: 'EUR', label: 'Euro (€)' },
//                         { value: 'GBP', label: 'British Pound (£)' },
//                     ])}
//                     {renderField('siteDescription', 'Site Description', 'text')}
//                     {renderField('timezone', 'Timezone', 'select', [
//                         { value: 'Asia/Kolkata', label: 'India (UTC +5:30)' },
//                         { value: 'America/New_York', label: 'USA Eastern (UTC -5:00)' },
//                         { value: 'Europe/London', label: 'UK (UTC +0:00)' },
//                     ])}
//                     {renderField('dateFormat', 'Date Format', 'select', [
//                         { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
//                         { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
//                         { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
//                     ])}
//                 </div>

//                 <div className="p-4 bg-gray-50 rounded-lg">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Platform Features</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         {renderField('registrationEnabled', 'User Registration', 'checkbox')}
//                         {renderField('guestCheckout', 'Guest Checkout', 'checkbox')}
//                         {renderField('maintenanceMode', 'Maintenance Mode', 'checkbox')}
//                     </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-200 flex items-center">
//                     <button
//                         type="submit"
//                         disabled={saving}
//                         className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
//                     >
//                         <FiSave className="w-4 h-4" />
//                         {saving ? 'Saving...' : 'Save Settings'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default GeneralSettings;


import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiImage } from 'react-icons/fi';
import { useSettings } from '../../../utils/useSettings';

const GeneralSettings = () => {
    const { settings, loading, updateSettings } = useSettings('general');
    const [formData, setFormData] = useState({
        siteName: '',
        siteDescription: '',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        registrationEnabled: true,
        guestCheckout: true,
        maintenanceMode: false,
    });
    const [saving, setSaving] = useState(false);

    // ✅ Jab settings load ho jayein, form me set karo
    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setFormData(prev => ({ ...prev, ...settings }));
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
            if (success) {
                toast.success('General settings updated successfully!');
            } else {
                toast.error('Failed to update settings.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                        <input
                            type="text"
                            name="siteName"
                            value={formData.siteName || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                            name="currency"
                            value={formData.currency || 'INR'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                    <textarea
                        name="siteDescription"
                        value={formData.siteDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                            name="timezone"
                            value={formData.timezone || 'Asia/Kolkata'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="Asia/Kolkata">India (UTC +5:30)</option>
                            <option value="America/New_York">USA Eastern (UTC -5:00)</option>
                            <option value="Europe/London">UK (UTC +0:00)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                        <select
                            name="dateFormat"
                            value={formData.dateFormat || 'DD/MM/YYYY'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Platform Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="registrationEnabled"
                                checked={formData.registrationEnabled || false}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">User Registration</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="guestCheckout"
                                checked={formData.guestCheckout || false}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Guest Checkout</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={formData.maintenanceMode || false}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Maintenance Mode</span>
                        </label>
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

export default GeneralSettings;