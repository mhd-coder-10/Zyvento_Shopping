import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiRefreshCw, FiBell, FiUser, FiCheckCircle, FiClock } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const NotificationDetails = () => {
    const { notificationCode  } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotification();
    }, [notificationCode ]);

    const fetchNotification = async () => {
        try {
            const res = await ApiService.getNotificationByCode(notificationCode );
            if (res.data.success) {
                setNotification(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load notification details');
            navigate('/admin/notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async () => {
        try {
            await ApiService.markNotificationAsRead(notificationCode);
            toast.success('Notification marked as read');
            fetchNotification();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" /></div>;
    if (!notification) return <div className="text-center py-12 !text-gray-600">Notification not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Notification Details"
                subtitle={notification.notification_code}
                actions={
                    <div className="flex gap-2">
                        {!notification.is_read && (
                            <button onClick={handleMarkAsRead} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 !text-white rounded-xl">
                                <FiCheckCircle /> Mark as Read
                            </button>
                        )}
                        <button onClick={() => navigate('/admin/notifications')} className="flex items-center gap-2 px-4 py-2 border border-blue-200 !text-blue-600 rounded-xl bg-white">
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                }
            />

            <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6">
                {/* Notification Content */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-full !text-blue-600">
                            <FiBell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold !text-black">{notification.title}</h3>
                            <p className="mt-2 !text-gray-700">{notification.message}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{notification.notification_type}</span>
                                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs capitalize">{notification.priority}</span>
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">{notification.channel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Notification Info</h3>
                        <p className="text-sm !text-gray-600">Code: {notification.notification_code}</p>
                        <p className="text-sm !text-gray-600">Status: {notification.status}</p>
                        <p className="text-sm !text-gray-600">Receiver: {notification.receiver_type}</p>
                        <p className="text-sm !text-gray-600">Created: {new Date(notification.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                        <h3 className="font-semibold !text-black mb-3">Timestamps</h3>
                        <p className="text-sm !text-gray-600">Sent: {notification.sent_at ? new Date(notification.sent_at).toLocaleString('en-IN') : 'N/A'}</p>
                        <p className="text-sm !text-gray-600">Read: {notification.read_at ? new Date(notification.read_at).toLocaleString('en-IN') : 'Not read yet'}</p>
                        <p className="text-sm !text-gray-600">Updated: {new Date(notification.updated_at).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetails;