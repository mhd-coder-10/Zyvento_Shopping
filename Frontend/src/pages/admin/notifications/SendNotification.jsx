
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSend, FiUsers, FiBell, FiMail, FiMessageSquare, FiInfo, FiX } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const SendNotification = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        notification_type: 'system',
        priority: 'medium',
        channel: 'in_app',
        receiver_type: 'admin',
        action_url: '',
        action_label: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Title and message are required');
            return;
        }
        setLoading(true);
        try {
            await ApiService.sendBroadcastNotification(formData);
            toast.success('Notification sent successfully');
            navigate('/admin/notifications');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Send Notification"
                subtitle="Send notification to users"
                actions={
                    <button onClick={() => navigate('/admin/notifications')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white">
                        <FiArrowLeft /> Back
                    </button>
                }
            />

            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                        <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">About Notifications</p>
                            <p className="text-xs text-blue-600">Send notifications to all users or specific user groups via different channels.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium !text-gray-700 mb-1">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter notification title"
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none !text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium !text-gray-700 mb-1">Message *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Type your message..."
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none !text-black resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium !text-gray-700 mb-1">Type</label>
                                <select
                                    name="notification_type"
                                    value={formData.notification_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 outline-none !text-black bg-white"
                                >
                                    <option value="system">System</option>
                                    <option value="order">Order</option>
                                    <option value="payment">Payment</option>
                                    <option value="promotion">Promotion</option>
                                    <option value="seller">Seller</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium !text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 outline-none !text-black bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium !text-gray-700 mb-1">Channel</label>
                                <select
                                    name="channel"
                                    value={formData.channel}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 outline-none !text-black bg-white"
                                >
                                    <option value="in_app">In-App</option>
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="push_notification">Push</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium !text-gray-700 mb-1">Receiver Type</label>
                                <select
                                    name="receiver_type"
                                    value={formData.receiver_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-blue-500 outline-none !text-black bg-white"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="seller_employee">Seller Employee</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 !text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                            >
                                <FiSend /> {loading ? 'Sending...' : 'Send Notification'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/notifications')}
                                className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 !text-gray-700 rounded-xl hover:bg-gray-50"
                            >
                                <FiX /> Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendNotification;