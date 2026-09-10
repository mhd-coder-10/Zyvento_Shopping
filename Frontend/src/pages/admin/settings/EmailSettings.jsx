// Email server configuration - SMTP settings, sender details, templates
// Admin can configure email delivery and notification templates

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import {
//     FiSave,
//     FiMail,
//     FiServer,
//     FiLock,
//     FiUser,
//     FiSend,
//     FiCheckCircle,
//     FiAlertCircle,
//     FiInfo,
// } from 'react-icons/fi';

// const EmailSettings = () => {
//     const [loading, setLoading] = useState(false);
//     const [testEmail, setTestEmail] = useState('');
//     const [testLoading, setTestLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         smtpHost: 'smtp.gmail.com',
//         smtpPort: 587,
//         smtpSecure: false,
//         smtpUser: 'admin@marketplace.com',
//         smtpPassword: '********',
//         senderEmail: 'noreply@marketplace.com',
//         senderName: 'Zyvento Shopping',
//         replyToEmail: 'support@marketplace.com',
//         emailVerification: true,
//         welcomeEmail: true,
//         orderConfirmation: true,
//         passwordReset: true,
//         promotionalEmails: true,
//         newsletterEnabled: true,
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             // In production: await ApiService.updateSystemSettings(formData);
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             toast.success('Email settings updated successfully');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to update settings');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleTestEmail = async () => {
//         if (!testEmail) {
//             toast.error('Please enter a test email address');
//             return;
//         }

//         setTestLoading(true);
//         try {
//             // In production: await ApiService.sendTestEmail({ email: testEmail });
//             await new Promise(resolve => setTimeout(resolve, 1500));
//             toast.success(`Test email sent to ${testEmail}`);
//             setTestEmail('');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to send test email');
//         } finally {
//             setTestLoading(false);
//         }
//     };

//     const emailTemplates = [
//         { id: 'welcome', label: 'Welcome Email', status: 'active' },
//         { id: 'verification', label: 'Email Verification', status: 'active' },
//         { id: 'order_confirmation', label: 'Order Confirmation', status: 'active' },
//         { id: 'order_shipped', label: 'Order Shipped', status: 'active' },
//         { id: 'order_delivered', label: 'Order Delivered', status: 'active' },
//         { id: 'password_reset', label: 'Password Reset', status: 'active' },
//         { id: 'promotional', label: 'Promotional Email', status: 'inactive' },
//         { id: 'newsletter', label: 'Newsletter', status: 'inactive' },
//     ];

//     return (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Settings</h3>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* SMTP Configuration */}
//                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
//                     <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <p className="text-sm font-medium text-blue-800">SMTP Configuration</p>
//                         <p className="text-xs text-blue-600">
//                             Configure your email server settings to send emails from your platform.
//                         </p>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             SMTP Host
//                         </label>
//                         <input
//                             type="text"
//                             name="smtpHost"
//                             value={formData.smtpHost}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             SMTP Port
//                         </label>
//                         <input
//                             type="number"
//                             name="smtpPort"
//                             value={formData.smtpPort}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             SMTP Username
//                         </label>
//                         <input
//                             type="text"
//                             name="smtpUser"
//                             value={formData.smtpUser}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             SMTP Password
//                         </label>
//                         <input
//                             type="password"
//                             name="smtpPassword"
//                             value={formData.smtpPassword}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Sender Email
//                         </label>
//                         <input
//                             type="email"
//                             name="senderEmail"
//                             value={formData.senderEmail}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Sender Name
//                         </label>
//                         <input
//                             type="text"
//                             name="senderName"
//                             value={formData.senderName}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Reply-To Email
//                     </label>
//                     <input
//                         type="email"
//                         name="replyToEmail"
//                         value={formData.replyToEmail}
//                         onChange={handleChange}
//                         className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                     />
//                 </div>

//                 {/* Test Email */}
//                 <div className="pt-4 border-t border-gray-200">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Send Test Email</h4>
//                     <div className="flex gap-3">
//                         <input
//                             type="email"
//                             value={testEmail}
//                             onChange={(e) => setTestEmail(e.target.value)}
//                             placeholder="Enter email to send test"
//                             className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
//                         />
//                         <button
//                             type="button"
//                             onClick={handleTestEmail}
//                             disabled={testLoading}
//                             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
//                         >
//                             <FiSend className="w-4 h-4" />
//                             {testLoading ? 'Sending...' : 'Send Test'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Email Notifications */}
//                 <div className="pt-4 border-t border-gray-200">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="emailVerification"
//                                 checked={formData.emailVerification}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Email Verification</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="welcomeEmail"
//                                 checked={formData.welcomeEmail}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Welcome Email</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="orderConfirmation"
//                                 checked={formData.orderConfirmation}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Order Confirmation</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="passwordReset"
//                                 checked={formData.passwordReset}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Password Reset</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="promotionalEmails"
//                                 checked={formData.promotionalEmails}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Promotional Emails</span>
//                         </label>
//                         <label className="flex items-center gap-3">
//                             <input
//                                 type="checkbox"
//                                 name="newsletterEnabled"
//                                 checked={formData.newsletterEnabled}
//                                 onChange={handleChange}
//                                 className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <span className="text-sm text-gray-700">Newsletter</span>
//                         </label>
//                     </div>
//                 </div>

//                 {/* Email Templates */}
//                 <div className="pt-4 border-t border-gray-200">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Email Templates</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                         {emailTemplates.map((template) => (
//                             <div
//                                 key={template.id}
//                                 className={`p-3 rounded-lg border flex items-center justify-between ${
//                                     template.status === 'active'
//                                         ? 'border-green-200 bg-green-50'
//                                         : 'border-gray-200 bg-gray-50'
//                                 }`}
//                             >
//                                 <span className="text-sm font-medium text-gray-700">
//                                     {template.label}
//                                 </span>
//                                 <span className={`text-xs font-medium ${
//                                     template.status === 'active' ? 'text-green-600' : 'text-gray-400'
//                                 }`}>
//                                     {template.status === 'active' ? 'Active' : 'Inactive'}
//                                 </span>
//                             </div>
//                         ))}
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

// export default EmailSettings;



import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiSend, FiInfo } from 'react-icons/fi';
import { useSettings } from '../../../utils/useSettings';

const EmailSettings = () => {
    const { settings, loading, updateSettings } = useSettings('email');
    const [formData, setFormData] = useState({
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        senderEmail: '',
        senderName: '',
        replyToEmail: '',
        emailVerification: true,
        welcomeEmail: true,
        orderConfirmation: true,
        passwordReset: true,
        promotionalEmails: false,
        newsletterEnabled: false,
    });
    const [saving, setSaving] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testLoading, setTestLoading] = useState(false);

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
            if (success) toast.success('Email settings updated successfully!');
            else toast.error('Failed to update settings.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Please enter a test email address');
            return;
        }
        setTestLoading(true);
        try {
            // In production: await ApiService.post('/admin/settings/test-email', { email: testEmail });
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Test email sent to ${testEmail}`);
            setTestEmail('');
        } catch (error) {
            toast.error('Failed to send test email');
        } finally {
            setTestLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading email settings...</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">SMTP Configuration</p>
                        <p className="text-xs text-blue-600">Configure your email server settings to send emails.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                        <input
                            type="text"
                            name="smtpHost"
                            value={formData.smtpHost || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                        <input
                            type="number"
                            name="smtpPort"
                            value={formData.smtpPort || 587}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                        <input
                            type="text"
                            name="smtpUser"
                            value={formData.smtpUser || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                        <input
                            type="password"
                            name="smtpPassword"
                            value={formData.smtpPassword || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                        <input
                            type="email"
                            name="senderEmail"
                            value={formData.senderEmail || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                        <input
                            type="text"
                            name="senderName"
                            value={formData.senderName || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                    <input
                        type="email"
                        name="replyToEmail"
                        value={formData.replyToEmail || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Send Test Email</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter email to send test"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleTestEmail}
                            disabled={testLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <FiSend className="w-4 h-4" />
                            {testLoading ? 'Sending...' : 'Send Test'}
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['emailVerification', 'welcomeEmail', 'orderConfirmation', 'passwordReset', 'promotionalEmails', 'newsletterEnabled'].map((key) => (
                            <label key={key} className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name={key}
                                    checked={formData[key] || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </label>
                        ))}
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

export default EmailSettings;