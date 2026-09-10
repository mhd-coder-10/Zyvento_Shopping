
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiSearch, FiEye, FiTrash2, FiCheckCircle, FiBell, FiClock, FiRefreshCw, FiSend } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const Notifications = () => {
//     const navigate = useNavigate();
//     const [notifications, setNotifications] = useState([]);
//     const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, failed: 0 });
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [typeFilter, setTypeFilter] = useState('all');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });
//     const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

//     const fetchNotifications = useCallback(async () => {
//         setLoading(true);
//         try {
//             // Build params dynamically - ONLY include filters that are NOT 'all'
//             const params = {
//                 page: pagination.page,
//                 limit: pagination.limit,
//                 search,
//                 ...(typeFilter !== 'all' && { type: typeFilter }),
//                 ...(statusFilter !== 'all' && { status: statusFilter })
//             };

//             const res = await ApiService.getAllNotifications(params);
//             if (res.data.success) {
//                 setNotifications(res.data.data || []);
//                 setStats(res.data.stats || {});
//                 setPagination(res.data.pagination || {});
//             }
//         } catch (error) {
//             toast.error('Failed to load notifications');
//         } finally {
//             setLoading(false);
//         }
//     }, [pagination.page, pagination.limit, search, typeFilter, statusFilter]);


//     useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

//     const handleMarkAsRead = async (code) => {
//         try {
//             await ApiService.markNotificationAsRead(code);
//             toast.success('Notification marked as read');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to mark as read');
//         }
//     };

//     const handleMarkAllAsRead = async () => {
//         try {
//             await ApiService.markAllNotificationsAsRead();
//             toast.success('All notifications marked as read');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to mark all as read');
//         }
//     };

//     const handleDelete = async () => {
//         if (!deleteConfirm.code) return;
//         try {
//             await ApiService.deleteNotification(deleteConfirm.code);
//             toast.success('Notification deleted');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to delete notification');
//         } finally {
//             setDeleteConfirm({ open: false, code: null });
//         }
//     };

//     const getStatusBadge = (status) => {
//         const map = {
//             sent: 'bg-emerald-50 text-emerald-700',
//             pending: 'bg-amber-50 text-amber-700',
//             failed: 'bg-red-50 text-red-700',
//             delivered: 'bg-blue-50 text-blue-700',
//             read: 'bg-gray-100 text-gray-600'
//         };
//         return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
//     };

//     const getPriorityBadge = (priority) => {
//         const map = {
//             low: 'bg-gray-100 text-gray-600',
//             medium: 'bg-blue-100 text-blue-700',
//             high: 'bg-orange-100 text-orange-700',
//             critical: 'bg-red-100 text-red-700'
//         };
//         return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[priority] || 'bg-gray-100 text-gray-600'}`}>{priority}</span>;
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Notification Management"
//                 subtitle="Manage all system notifications"
//                 actions={
//                     <div className="flex gap-2">
//                         <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-gray-100 !text-gray-700 rounded-lg">
//                             <FiCheckCircle /> Mark All Read
//                         </button>
//                         <button onClick={() => navigate('/admin/notifications/send')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-lg">
//                             <FiSend /> Send Notification
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-black">{stats.total}</p>
//                         <p className="text-xs !text-gray-600">Total Notifications</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-amber-600">{stats.unread}</p>
//                         <p className="text-xs !text-gray-600">Unread</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-emerald-600">{stats.read}</p>
//                         <p className="text-xs !text-gray-600">Read</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-red-600">{stats.failed}</p>
//                         <p className="text-xs !text-gray-600">Failed</p>
//                     </div>
//                 </div>

//                 {/* Filters */}
//                 <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
//                     <div className="flex-1 relative">
//                         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search by title, message, or code..."
//                             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                     </div>
//                     <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
//                         <option value="all">All Types</option>
//                         <option value="order">Order</option>
//                         <option value="payment">Payment</option>
//                         <option value="system">System</option>
//                         <option value="promotion">Promotion</option>
//                     </select>
//                     <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
//                         <option value="all">All Status</option>
//                         <option value="sent">Sent</option>
//                         <option value="pending">Pending</option>
//                         <option value="failed">Failed</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="read">Read</option>
//                     </select>
//                 </div>

//                 {/* Desktop Table */}
//                 <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
//                     {loading ?
//                         <div className=" flex item-center justify-center w-full h-64 p-10">
//                             <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
//                         </div>
//                         : (
//                             <table className="w-full">
//                                 <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
//                                     <tr>
//                                         <th className="px-4 py-3 pl-16 text-left text-xs font-bold !text-blue-900 uppercase">Notification</th>
//                                         <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Type</th>
//                                         <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Priority</th>
//                                         <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Status</th>
//                                         <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Date</th>
//                                         <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {notifications.length > 0 ? (
//                                         notifications.map((notification) => (
//                                             <tr key={notification._id} className="hover:bg-blue-50/30"
//                                                 onClick={() => { navigate(`/admin/notifications/${notification.notification_code}`) }}>

//                                                 <td className="px-4 py-4">
//                                                     <div className="flex items-start gap-3">
//                                                         <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
//                                                             <FiBell className="w-4 h-4" />
//                                                         </div>
//                                                         <div>
//                                                             <p className={`font-semibold text-start !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>
//                                                                 {notification.title}
//                                                             </p>
//                                                             <p className="text-xs text-start !text-gray-600 mt-1 line-clamp-2 max-w-md">{notification.message}</p>
//                                                             <p className="text-xs text-start !text-blue-500 mt-1">{notification.notification_code}</p>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-4 py-4 !text-gray-700 capitalize">{notification.notification_type}</td>
//                                                 <td className="px-4 py-4">{getPriorityBadge(notification.priority)}</td>
//                                                 <td className="px-4 py-4">{getStatusBadge(notification.status)}</td>
//                                                 <td className="px-4 py-4 !text-gray-600">
//                                                     {new Date(notification.created_at).toLocaleDateString('en-IN', {
//                                                         day: '2-digit',
//                                                         month: 'short',
//                                                         year: 'numeric'
//                                                     })}
//                                                 </td>
//                                                 <td className="px-4 py-4 text-right">
//                                                     <div className="flex justify-end gap-2">
//                                                         <button onClick={() => navigate(`/admin/notifications/${notification.notification_code}`)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
//                                                         {!notification.is_read && (
//                                                             <button onClick={() => handleMarkAsRead(notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
//                                                         )}
//                                                         <button onClick={() => setDeleteConfirm({ open: true, code: notification.notification_code })} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="6" className="px-4 py-10 text-center !text-gray-500">No notifications found</td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         )}
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="md:hidden space-y-4">
//                     {loading ?
//                         <div className="flex item-center justify-center w-full p-10 text-center">
//                             <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
//                         </div>
//                         : (
//                             notifications.map((notification) => (
//                                 <div key={notification._id}
//                                     onClick={() => { navigate(`/admin/notifications/${notification.notification_code}`) }}
//                                     className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                                     <div className="flex justify-between items-start">
//                                         <div className="flex items-start gap-3">
//                                             <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
//                                                 <FiBell className="w-4 h-4" />
//                                             </div>
//                                             <div>
//                                                 <p className={`font-semibold !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>{notification.title}</p>
//                                                 <p className="text-xs !text-gray-600 mt-1 line-clamp-3">{notification.message}</p>
//                                                 <p className="text-xs !text-blue-500 mt-1">{notification.notification_code}</p>
//                                             </div>
//                                         </div>
//                                         {getStatusBadge(notification.status)}
//                                     </div>
//                                     <div className="mt-3 flex justify-between items-center">
//                                         {getPriorityBadge(notification.priority)}
//                                         <div className="flex gap-2">
//                                             <button onClick={() => navigate(`/admin/notifications/${notification.notification_code}`)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
//                                             {!notification.is_read && (
//                                                 <button onClick={() => handleMarkAsRead(notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
//                                             )}
//                                             <button onClick={() => setDeleteConfirm({ open: true, code: notification.notification_code })} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         )}
//                 </div>

//                 {/* Pagination */}
//                 {pagination.totalPages > 1 && (
//                     <div className="flex justify-between items-center">
//                         <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Previous</button>
//                         <span className="text-sm !text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
//                         <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Next</button>
//                     </div>
//                 )}
//             </div>

//             <ConfirmDialog
//                 isOpen={deleteConfirm.open}
//                 onClose={() => setDeleteConfirm({ open: false, code: null })}
//                 onConfirm={handleDelete}
//                 title="Delete Notification"
//                 message="Are you sure you want to delete this notification?"
//                 confirmColor="bg-gradient-to-r from-red-500 to-rose-600"
//             />
//         </div>
//     );
// };

// export default Notifications;





// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FiSearch, FiEye, FiTrash2, FiCheckCircle, FiBell, FiClock, FiRefreshCw, FiSend } from 'react-icons/fi';
// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import ConfirmDialog from '../../../components/common/ConfirmDialog';

// const Notifications = () => {
//     const navigate = useNavigate();
//     const [notifications, setNotifications] = useState([]);
//     const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, failed: 0 });
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [typeFilter, setTypeFilter] = useState('all');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });
//     const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

//     const fetchNotifications = useCallback(async () => {
//         setLoading(true);
//         try {
//             const params = {
//                 page: pagination.page,
//                 limit: pagination.limit,
//                 search,
//                 ...(typeFilter !== 'all' && { type: typeFilter }),
//                 ...(statusFilter !== 'all' && { status: statusFilter })
//             };
//             const res = await ApiService.getAllNotifications(params);
//             if (res.data.success) {
//                 setNotifications(res.data.data || []);
//                 setStats(res.data.stats || {});
//                 setPagination(res.data.pagination || {});
//             }
//         } catch (error) {
//             toast.error('Failed to load notifications');
//         } finally {
//             setLoading(false);
//         }
//     }, [pagination.page, pagination.limit, search, typeFilter, statusFilter]);

//     useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

//     const handleMarkAsRead = async (e, code) => {
//         e.stopPropagation(); // IMPORTANT: Prevent row navigation
//         try {
//             await ApiService.markNotificationAsRead(code);
//             toast.success('Notification marked as read');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to mark as read');
//         }
//     };

//     const handleMarkAllAsRead = async () => {
//         try {
//             await ApiService.markAllNotificationsAsRead();
//             toast.success('All notifications marked as read');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to mark all as read');
//         }
//     };

//     const handleDelete = (e, code) => {
//         e.stopPropagation(); // IMPORTANT: Prevent row navigation
//         setDeleteConfirm({ open: true, code });
//     };

//     const confirmDelete = async () => {
//         if (!deleteConfirm.code) return;
//         try {
//             await ApiService.deleteNotification(deleteConfirm.code);
//             toast.success('Notification deleted successfully');
//             fetchNotifications();
//         } catch (error) {
//             toast.error('Failed to delete notification');
//         } finally {
//             setDeleteConfirm({ open: false, code: null });
//         }
//     };

//     const handleView = (e, code) => {
//         e.stopPropagation(); // Safe navigation
//         navigate(`/admin/notifications/${code}`);
//     };

//     const getStatusBadge = (status) => {
//         const map = {
//             sent: 'bg-emerald-50 text-emerald-700',
//             pending: 'bg-amber-50 text-amber-700',
//             failed: 'bg-red-50 text-red-700',
//             delivered: 'bg-blue-50 text-blue-700',
//             read: 'bg-gray-100 text-gray-600'
//         };
//         return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
//     };

//     const getPriorityBadge = (priority) => {
//         const map = {
//             low: 'bg-gray-100 text-gray-600',
//             medium: 'bg-blue-100 text-blue-700',
//             high: 'bg-orange-100 text-orange-700',
//             critical: 'bg-red-100 text-red-700'
//         };
//         return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[priority] || 'bg-gray-100 text-gray-600'}`}>{priority}</span>;
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Notification Management"
//                 subtitle="Manage all system notifications"
//                 actions={
//                     <div className="flex gap-2">
//                         <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-gray-100 !text-gray-700 rounded-lg">
//                             <FiCheckCircle /> Mark All Read
//                         </button>
//                         <button onClick={() => navigate('/admin/notifications/send')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-lg">
//                             <FiSend /> Send Notification
//                         </button>
//                     </div>
//                 }
//             />

//             <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-black">{stats.total}</p>
//                         <p className="text-xs !text-gray-600">Total Notifications</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-amber-600">{stats.unread}</p>
//                         <p className="text-xs !text-gray-600">Unread</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-emerald-600">{stats.read}</p>
//                         <p className="text-xs !text-gray-600">Read</p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
//                         <p className="text-2xl font-bold !text-red-600">{stats.failed}</p>
//                         <p className="text-xs !text-gray-600">Failed</p>
//                     </div>
//                 </div>

//                 {/* Filters */}
//                 <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
//                     <div className="flex-1 relative">
//                         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search by title, message, or code..."
//                             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                     </div>
//                     <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
//                         <option value="all">All Types</option>
//                         <option value="order">Order</option>
//                         <option value="payment">Payment</option>
//                         <option value="system">System</option>
//                         <option value="promotion">Promotion</option>
//                     </select>
//                     <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
//                         <option value="all">All Status</option>
//                         <option value="sent">Sent</option>
//                         <option value="pending">Pending</option>
//                         <option value="failed">Failed</option>
//                         <option value="delivered">Delivered</option>
//                         <option value="read">Read</option>
//                     </select>
//                 </div>

//                 {/* Desktop Table */}
//                 <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
//                     {loading ? (
//                         <div className="flex items-center justify-center w-full h-64">
//                             <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
//                         </div>
//                     ) : notifications.length === 0 ? (
//                         <div className="flex items-center justify-center w-full h-64 !text-gray-500">No notifications found</div>
//                     ) : (
//                         <table className="w-full">
//                             <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
//                                 <tr>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Notification</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Type</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Priority</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Status</th>
//                                     <th className="px-4 py-3 text-left text-xs font-bold !text-blue-900 uppercase">Date</th>
//                                     <th className="px-4 py-3 text-right text-xs font-bold !text-blue-900 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {notifications.map((notification) => (
//                                     <tr key={notification._id} className="hover:bg-blue-50/30">
//                                         <td className="px-4 py-4">
//                                             <div className="flex items-start gap-3">
//                                                 <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
//                                                     <FiBell className="w-4 h-4" />
//                                                 </div>
//                                                 <div>
//                                                     <p className={`font-semibold !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>
//                                                         {notification.title}
//                                                     </p>
//                                                     <p className="text-xs !text-gray-600 mt-1 line-clamp-2 max-w-md">{notification.message}</p>
//                                                     <p className="text-xs !text-blue-500 mt-1">{notification.notification_code}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-4 !text-gray-700 capitalize">{notification.notification_type}</td>
//                                         <td className="px-4 py-4">{getPriorityBadge(notification.priority)}</td>
//                                         <td className="px-4 py-4">{getStatusBadge(notification.status)}</td>
//                                         <td className="px-4 py-4 !text-gray-600">
//                                             {new Date(notification.created_at).toLocaleDateString('en-IN', {
//                                                 day: '2-digit',
//                                                 month: 'short',
//                                                 year: 'numeric'
//                                             })}
//                                         </td>
//                                         <td className="px-4 py-4 text-right">
//                                             <div className="flex justify-end gap-2">
//                                                 {/* View - e.stopPropagation added */}
//                                                 <button onClick={(e) => handleView(e, notification.notification_code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>

//                                                 {/* Mark as Read - e.stopPropagation added */}
//                                                 {!notification.is_read && (
//                                                     <button onClick={(e) => handleMarkAsRead(e, notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
//                                                 )}

//                                                 {/* Delete - e.stopPropagation added */}
//                                                 <button onClick={(e) => handleDelete(e, notification.notification_code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="md:hidden space-y-4">
//                     {loading ? (
//                         <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm">
//                             <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
//                         </div>
//                     ) : notifications.length === 0 ? (
//                         <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm !text-gray-500">No notifications found</div>
//                     ) : (
//                         notifications.map((notification) => (
//                             <div key={notification._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
//                                 <div className="flex justify-between items-start">
//                                     <div className="flex items-start gap-3">
//                                         <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
//                                             <FiBell className="w-4 h-4" />
//                                         </div>
//                                         <div>
//                                             <p className={`font-semibold !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>{notification.title}</p>
//                                             <p className="text-xs !text-gray-600 mt-1 line-clamp-3">{notification.message}</p>
//                                             <p className="text-xs !text-blue-500 mt-1">{notification.notification_code}</p>
//                                         </div>
//                                     </div>
//                                     {getStatusBadge(notification.status)}
//                                 </div>
//                                 <div className="mt-3 flex justify-between items-center">
//                                     {getPriorityBadge(notification.priority)}
//                                     <div className="flex gap-2">
//                                         <button onClick={(e) => handleView(e, notification.notification_code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
//                                         {!notification.is_read && (
//                                             <button onClick={(e) => handleMarkAsRead(e, notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
//                                         )}
//                                         <button onClick={(e) => handleDelete(e, notification.notification_code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 {/* Pagination */}
//                 {pagination.totalPages > 1 && (
//                     <div className="flex justify-between items-center">
//                         <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Previous</button>
//                         <span className="text-sm !text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
//                         <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Next</button>
//                     </div>
//                 )}
//             </div>

//             <ConfirmDialog
//                 isOpen={deleteConfirm.open}
//                 onClose={() => setDeleteConfirm({ open: false, code: null })}
//                 onConfirm={confirmDelete}
//                 title="Delete Notification"
//                 message="Are you sure you want to delete this notification?"
//                 confirmColor="bg-gradient-to-r from-red-500 to-rose-600"
//             />
//         </div>
//     );
// };

// export default Notifications;



import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiTrash2, FiCheckCircle, FiBell, FiClock, FiRefreshCw, FiSend } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, code: null });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                ...(typeFilter !== 'all' && { type: typeFilter }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            };
            const res = await ApiService.getAllNotifications(params);
            if (res.data.success) {
                setNotifications(res.data.data || []);
                setStats(res.data.stats || {});
                setPagination(res.data.pagination || {});
            }
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, typeFilter, statusFilter]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const handleMarkAsRead = async (e, code) => {
        e.stopPropagation(); // FIX: Prevent row navigation
        try {
            await ApiService.markNotificationAsRead(code);
            toast.success('Notification marked as read');
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await ApiService.markAllNotificationsAsRead();
            toast.success('All notifications marked as read');
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDeleteClick = (e, code) => {
        e.stopPropagation(); // FIX: Prevent row navigation
        setDeleteConfirm({ open: true, code });
    };

    const handleView = (e, code) => {
        e.stopPropagation(); // Safe navigation (prevents double navigation)
        navigate(`/admin/notifications/${code}`);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.code) return;
        try {
            await ApiService.deleteNotification(deleteConfirm.code);
            toast.success('Notification deleted');
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to delete notification');
        } finally {
            setDeleteConfirm({ open: false, code: null });
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            sent: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            failed: 'bg-red-50 text-red-700',
            delivered: 'bg-blue-50 text-blue-700',
            read: 'bg-gray-100 text-gray-600'
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        const map = {
            low: 'bg-gray-100 text-gray-600',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            critical: 'bg-red-100 text-red-700'
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[priority] || 'bg-gray-100 text-gray-600'}`}>{priority}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Notification Management"
                subtitle="Manage all system notifications"
                actions={
                    <div className="flex gap-2">
                        <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-gray-100 !text-gray-700 rounded-lg">
                            <FiCheckCircle /> Mark All Read
                        </button>
                        <button onClick={() => navigate('/admin/notifications/send')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 !text-white rounded-lg">
                            <FiSend /> Send Notification
                        </button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-2xl font-bold !text-black">{stats.total}</p>
                        <p className="text-xs !text-gray-600">Total Notifications</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                        <p className="text-2xl font-bold !text-amber-600">{stats.unread}</p>
                        <p className="text-xs !text-gray-600">Unread</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-2xl font-bold !text-emerald-600">{stats.read}</p>
                        <p className="text-xs !text-gray-600">Read</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                        <p className="text-2xl font-bold !text-red-600">{stats.failed}</p>
                        <p className="text-xs !text-gray-600">Failed</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, message, or code..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl !text-black"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                        <option value="all">All Types</option>
                        <option value="order">Order</option>
                        <option value="payment">Payment</option>
                        <option value="system">System</option>
                        <option value="promotion">Promotion</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl !text-black bg-white">
                        <option value="all">All Status</option>
                        <option value="sent">Sent</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="delivered">Delivered</option>
                        <option value="read">Read</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-64">
                            <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-64 !text-gray-500">No notifications found</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-sky-50"> 
                                <tr>
                                    <th className="px-4 py-3 pl-10 text-left text-xs font-bold !text-blue-900 uppercase">Notification</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Priority</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Date</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold !text-blue-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <tr key={notification._id} className="hover:bg-blue-50/30"
                                        onClick={() => { navigate(`/admin/notifications/${notification.notification_code}`) }}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
                                                    <FiBell className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-start !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-start !text-gray-600 mt-1 line-clamp-2 max-w-md">{notification.message}</p>
                                                    <p className="text-xs text-start !text-blue-500 mt-1">{notification.notification_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 !text-gray-700 capitalize">{notification.notification_type}</td>
                                        <td className="px-4 py-4">{getPriorityBadge(notification.priority)}</td>
                                        <td className="px-4 py-4">{getStatusBadge(notification.status)}</td>
                                        <td className="px-4 py-4 !text-gray-600">
                                            {new Date(notification.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* FIX: Added e.stopPropagation() to all buttons */}
                                                <button onClick={(e) => handleView(e, notification.notification_code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                                {!notification.is_read && (
                                                    <button onClick={(e) => handleMarkAsRead(e, notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
                                                )}
                                                <button onClick={(e) => handleDeleteClick(e, notification.notification_code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm">
                            <FiRefreshCw className="animate-spin !text-blue-600 w-8 h-8" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-64 bg-white rounded-2xl border border-blue-100 shadow-sm !text-gray-500">No notifications found</div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification._id}
                                onClick={() => { navigate(`/admin/notifications/${notification.notification_code}`) }}
                                className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-100 !text-gray-500' : 'bg-blue-100 !text-blue-600'}`}>
                                            <FiBell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold !text-black text-sm ${notification.is_read ? 'opacity-60' : ''}`}>{notification.title}</p>
                                            <p className="text-xs !text-gray-600 mt-1 line-clamp-3">{notification.message}</p>
                                            <p className="text-xs !text-blue-500 mt-1">{notification.notification_code}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(notification.status)}
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    {getPriorityBadge(notification.priority)}
                                    <div className="flex gap-2">
                                        {/* FIX: Added e.stopPropagation() to all buttons */}
                                        <button onClick={(e) => handleView(e, notification.notification_code)} className="p-2 bg-blue-50 !text-blue-600 rounded-lg"><FiEye /></button>
                                        {!notification.is_read && (
                                            <button onClick={(e) => handleMarkAsRead(e, notification.notification_code)} className="p-2 bg-emerald-50 !text-emerald-600 rounded-lg"><FiCheckCircle /></button>
                                        )}
                                        <button onClick={(e) => handleDeleteClick(e, notification.notification_code)} className="p-2 bg-red-50 !text-red-600 rounded-lg"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center">
                        <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Previous</button>
                        <span className="text-sm !text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
                        <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-4 py-2 border rounded-lg !text-black disabled:opacity-50">Next</button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, code: null })}
                onConfirm={confirmDelete}
                title="Delete Notification"
                message="Are you sure you want to delete this notification?"
                confirmColor="bg-gradient-to-r from-red-500 to-rose-600"
            />
        </div>
    );
};

export default Notifications;