// // User Create / Edit Form 


// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiLock,
//     FiShield, FiCamera, FiX, FiEye, FiEyeOff, FiCalendar, FiAlertCircle, FiRefreshCw
// } from 'react-icons/fi';
// import { FaStore, FaUsersCog, FaUserTag } from 'react-icons/fa';
// import { motion } from 'framer-motion';
// import ApiService from '../../../api/ApiService';

// /* ================= OPTIONS ================= */
// const MAIN_USER_TYPES = [
//     { value: 'customer', label: 'Customer' },
//     { value: 'seller', label: 'Seller' },
//     { value: 'seller_employee', label: 'Seller Employee' },
//     { value: 'sub_admin', label: 'Sub Admin (Platform Staff)' },
//     { value: 'super_admin', label: 'Super Admin' },
// ];

// const SUB_ADMIN_TYPES = [
//     { value: 'manager', label: 'Manager' },
//     { value: 'finance_manager', label: 'Finance Manager' },
//     { value: 'support_manager', label: 'Support Manager' },
//     { value: 'seller_manager', label: 'Seller Manager' },
// ];

// const EMPLOYEE_TYPES = [
//     { value: 'manager', label: 'Manager (Full Seller Access)' },
//     { value: 'product_manager', label: 'Product Manager' },
//     { value: 'order_manager', label: 'Order Manager' },
//     { value: 'inventory_manager', label: 'Inventory Manager' },
//     { value: 'support_staff', label: 'Support Staff' },
//     { value: 'account_manager', label: 'Account Manager' },
// ];

// const STATUS_OPTIONS = [
//     { value: 'active', label: 'Active' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'blocked', label: 'Blocked' },
// ];

// const EMPTY_FORM = {
//     first_name: '', last_name: '', email: '', phone: '', username: '',
//     password: '', password_confirmation: '',
//     user_type: 'customer',
//     sub_admin_type: '',
//     employee_type: '',
//     seller_id: '',
//     status: 'active',
//     date_of_birth: '', gender: '', address: '', city: '', state: '',
//     country: '', postal_code: '',
// };

// /* ================= FIELD COMPONENTS ================= */
// const InputField = ({ label, name, type = 'text', icon: Icon, required = false, value, error, onChange, hint, ...props }) => (
//     <div className="space-y-2">
//         <label className="block text-sm font-medium text-slate-700">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="relative">
//             {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500"><Icon size={18} /></div>}
//             <input
//                 type={type}
//                 name={name}
//                 value={value ?? ''}
//                 onChange={onChange}
//                 className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
//                 {...props}
//             />
//         </div>
//         {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
//         {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
//     </div>
// );

// const SelectField = ({ label, name, icon: Icon, options = [], required = false, value, error, onChange, hint }) => (
//     <div className="space-y-2">
//         <label className="block text-sm font-medium text-slate-700">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="relative">
//             {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"><Icon size={18} /></div>}
//             <select
//                 name={name}
//                 value={value ?? ''}
//                 onChange={onChange}
//                 className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all`}
//             >
//                 {options.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
//             </select>
//             <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
//         </div>
//         {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
//         {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
//     </div>
// );

// /* ================= MAIN COMPONENT ================= */
// const UserManagement = () => {
//     const params = useParams();
//     const location = useLocation();
//     const navigate = useNavigate();

//     const userId =
//         params.userId || params.id ||
//         new URLSearchParams(location.search).get('id') || '';
//     const isEditMode = Boolean(userId) && !location.pathname.includes('/create');

//     const [formData, setFormData] = useState(EMPTY_FORM);
//     const [loading, setLoading] = useState(false);
//     const [fetchLoading, setFetchLoading] = useState(isEditMode);
//     const [fetchError, setFetchError] = useState('');
//     const [errors, setErrors] = useState({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [sellersList, setSellersList] = useState([]);

//     /* ---------- FETCH USER (Edit Mode) ---------- */
//     const fetchUserData = useCallback(async () => {
//         if (!userId) return;
//         setFetchLoading(true);
//         setFetchError('');
//         try {
//             const res = await ApiService.getUserById(userId);
//             const u = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || {};

//             setFormData({
//                 ...EMPTY_FORM,
//                 first_name: u.first_name || '',
//                 last_name: u.last_name || '',
//                 email: u.email || '',
//                 phone: u.mobile_number || u.phone || '',
//                 username: u.username || '',
//                 user_type: u.user_type || 'customer',
//                 sub_admin_type: u.sub_admin_type || '',
//                 employee_type: u.employee_type || '',
//                 seller_id: (typeof u.seller_id === 'object' ? u.seller_id?._id : u.seller_id) || '',
//                 status: u.account_status || 'active',
//                 date_of_birth: u.date_of_birth ? new Date(u.date_of_birth).toISOString().slice(0, 10) : '',
//                 gender: u.gender || '',
//                 address: u.address || '',
//                 city: u.city || '',
//                 state: u.state || '',
//                 country: u.country || '',
//                 postal_code: u.postal_code || '',
//                 password: '',
//                 password_confirmation: '',
//             });
//         } catch (error) {
//             console.error('Error fetching user:', error);
//             setFetchError(error?.response?.data?.message || error?.message || 'Failed to fetch user');
//             toast.error(error?.response?.data?.message || 'Failed to fetch user');
//         } finally {
//             setFetchLoading(false);
//         }
//     }, [userId]);

//     /* ---------- FETCH SELLERS LIST (for seller_employee) ---------- */
//     const fetchSellers = useCallback(async () => {
//         try {
//             // Try both possible endpoints
//             let list = [];
//             try {
//                 const res = await ApiService.getAllSellers?.({ limit: 200 });
//                 list = res?.data?.data?.sellers || res?.data?.data || res?.data?.sellers || res?.data || [];
//             } catch {
//                 // ignore
//             }
//             if (!Array.isArray(list)) list = [];
//             setSellersList(list);
//         } catch {
//             setSellersList([]);
//         }
//     }, []);

//     useEffect(() => { if (isEditMode) fetchUserData(); }, [isEditMode, fetchUserData]);
//     useEffect(() => { fetchSellers(); }, [fetchSellers]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => {
//             const next = { ...prev, [name]: value };
//             // Clear sub-fields when user_type changes
//             if (name === 'user_type') {
//                 if (value !== 'sub_admin') next.sub_admin_type = '';
//                 if (value !== 'seller_employee') {
//                     next.employee_type = '';
//                     next.seller_id = '';
//                 }
//             }
//             return next;
//         });
//         if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
//     };

//     const validateForm = () => {
//         const e = {};
//         if (!formData.first_name.trim()) e.first_name = 'First name is required';
//         if (!formData.last_name.trim()) e.last_name = 'Last name is required';
//         if (!formData.email.trim()) e.email = 'Email is required';
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
//         if (!formData.phone.trim()) e.phone = 'Phone is required';
//         else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) e.phone = 'Invalid phone';

//         if (formData.user_type === 'sub_admin' && !formData.sub_admin_type) {
//             e.sub_admin_type = 'Sub-admin type is required';
//         }
//         if (formData.user_type === 'seller_employee' && !formData.employee_type) {
//             e.employee_type = 'Employee type is required';
//         }

//         if (!isEditMode) {
//             if (!formData.password) e.password = 'Password is required';
//             else if (formData.password.length < 6) e.password = 'Min 6 characters';
//             if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
//         } else if (formData.password) {
//             if (formData.password.length < 6) e.password = 'Min 6 characters';
//             if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
//         }

//         setErrors(e);
//         return Object.keys(e).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) { toast.error('Please fix form errors'); return; }

//         setLoading(true);
//         try {
//             const payload = {
//                 first_name: formData.first_name.trim(),
//                 last_name: formData.last_name.trim(),
//                 email: formData.email.trim(),
//                 mobile_number: formData.phone.trim(),
//                 username: formData.username.trim() || undefined,
//                 user_type: formData.user_type,
//                 account_status: formData.status,
//                 date_of_birth: formData.date_of_birth || undefined,
//                 gender: formData.gender || undefined,
//                 address: formData.address || undefined,
//                 city: formData.city || undefined,
//                 state: formData.state || undefined,
//                 country: formData.country || undefined,
//                 postal_code: formData.postal_code || undefined,
//             };

//             if (formData.user_type === 'sub_admin') {
//                 payload.sub_admin_type = formData.sub_admin_type;
//             }
//             if (formData.user_type === 'seller_employee') {
//                 payload.employee_type = formData.employee_type;
//                 if (formData.seller_id) payload.seller_id = formData.seller_id;
//             }

//             if (formData.password) payload.password = formData.password;

//             if (isEditMode) {
//                 await ApiService.updateUserByAdmin(userId, payload);
//                 toast.success('User updated successfully');
//             } else {
//                 await ApiService.createUserByAdmin(payload);
//                 toast.success('User created successfully');
//             }
//             navigate('/admin/users');
//         } catch (error) {
//             console.error('Save error:', error);
//             const fieldErrors = error?.response?.data?.errors;
//             if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
//                 const normalized = {};
//                 Object.entries(fieldErrors).forEach(([k, v]) => {
//                     normalized[k] = Array.isArray(v) ? v[0] : (typeof v === 'object' ? v?.message : v);
//                 });
//                 setErrors(normalized);
//                 toast.error('Please fix the validation errors');
//             } else {
//                 toast.error(error?.response?.data?.message || error?.message || 'Failed to save user');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase() || 'U';
//     const showSubAdmin = formData.user_type === 'sub_admin';
//     const showEmployee = formData.user_type === 'seller_employee';

//     if (fetchLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white flex items-center justify-center">
//                 <div className="flex flex-col items-center">
//                     <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
//                     <p className="text-slate-700 font-medium">Loading user...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">
//             {/* HEADER */}
//             <div className="bg-white/90 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-20">
//                 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                     <div className="flex items-center gap-3 min-w-0">
//                         <button
//                             onClick={() => navigate('/admin/users')}
//                             className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 shrink-0"
//                             style={{ color: '#0f172a' }}
//                         >
//                             <FiArrowLeft size={20} />
//                         </button>
//                         <div className="min-w-0">
//                             <h1
//                                 className="truncate"
//                                 style={{
//                                     color: '#0f172a',
//                                     WebkitTextFillColor: '#0f172a',
//                                     fontWeight: 900,
//                                     fontSize: '1.75rem',
//                                     lineHeight: '2.25rem',
//                                     letterSpacing: '-0.02em',
//                                     opacity: 1,
//                                     filter: 'none',
//                                     mixBlendMode: 'normal',
//                                 }}
//                             >
//                                 {isEditMode ? 'Edit User' : 'Create User'}
//                             </h1>
//                             <p
//                                 className="truncate mt-0.5"
//                                 style={{
//                                     color: '#475569',
//                                     WebkitTextFillColor: '#475569',
//                                     opacity: 1,
//                                     filter: 'none',
//                                 }}
//                             >
//                                 {isEditMode ? 'Update user profile, role and access' : 'Add a new user to the platform'}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {isEditMode && (
//                             <button
//                                 type="button"
//                                 onClick={fetchUserData}
//                                 className="flex items-center gap-2 px-4 py-2.5 bg-white border border-sky-200 rounded-xl hover:bg-sky-50 text-sm"
//                                 style={{ color: '#334155' }}
//                             >
//                                 <FiRefreshCw size={16} /> Reload
//                             </button>
//                         )}
//                         <button
//                             onClick={handleSubmit}
//                             disabled={loading}
//                             className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium"
//                         >
//                             <FiSave size={18} /> {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {fetchError && (
//                 <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
//                     <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//                         <span className="flex items-center gap-2"><FiAlertCircle /> {fetchError}</span>
//                         <button onClick={fetchUserData} className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium">Retry</button>
//                     </div>
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
//                 {/* LEFT SIDEBAR - Avatar + Role */}
//                 <div className="lg:col-span-1 space-y-5">
//                     <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 text-center">
//                         <div className="relative inline-block">
//                             <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-3xl font-bold border-4 border-sky-100 shadow-md mx-auto">
//                                 {initials}
//                             </div>
//                         </div>
//                         <p className="mt-4 font-semibold text-slate-900 truncate">
//                             {`${formData.first_name} ${formData.last_name}`.trim() || 'New User'}
//                         </p>
//                         <p className="text-xs text-slate-500 truncate">{formData.email || 'no-email@example.com'}</p>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6 space-y-4">
//                         <h3 className="font-semibold text-slate-900 flex items-center gap-2">
//                             <FaUsersCog className="text-blue-600" /> Role &amp; Access
//                         </h3>

//                         {/* Main user type */}
//                         <SelectField
//                             label="User Type"
//                             name="user_type"
//                             icon={FiShield}
//                             required
//                             value={formData.user_type}
//                             error={errors.user_type}
//                             onChange={handleChange}
//                             options={MAIN_USER_TYPES}
//                         />

//                         {/* Conditional: Sub-Admin Type */}
//                         {showSubAdmin && (
//                             <SelectField
//                                 label="Sub-Admin Type"
//                                 name="sub_admin_type"
//                                 icon={FiShield}
//                                 required
//                                 value={formData.sub_admin_type}
//                                 error={errors.sub_admin_type}
//                                 onChange={handleChange}
//                                 options={[{ value: '', label: 'Select Sub-Admin Type' }, ...SUB_ADMIN_TYPES]}
//                                 hint="Platform staff department"
//                             />
//                         )}

//                         {/* Conditional: Employee Type */}
//                         {showEmployee && (
//                             <>
//                                 <SelectField
//                                     label="Employee Type"
//                                     name="employee_type"
//                                     icon={FaUserTag}
//                                     required
//                                     value={formData.employee_type}
//                                     error={errors.employee_type}
//                                     onChange={handleChange}
//                                     options={[{ value: '', label: 'Select Employee Type' }, ...EMPLOYEE_TYPES]}
//                                 />
//                                 {sellersList.length > 0 && (
//                                     <SelectField
//                                         label="Associated Seller (Optional)"
//                                         name="seller_id"
//                                         icon={FaStore}
//                                         value={formData.seller_id}
//                                         error={errors.seller_id}
//                                         onChange={handleChange}
//                                         options={[
//                                             { value: '', label: 'Select Seller' },
//                                             ...sellersList.map(s => ({
//                                                 value: s._id,
//                                                 label: s.business_name || s.store_name || s._id
//                                             }))
//                                         ]}
//                                     />
//                                 )}
//                             </>
//                         )}

//                         {/* Account Status */}
//                         <SelectField
//                             label="Account Status"
//                             name="status"
//                             icon={FiShield}
//                             value={formData.status}
//                             error={errors.status}
//                             onChange={handleChange}
//                             options={STATUS_OPTIONS}
//                         />
//                     </div>
//                 </div>

//                 {/* RIGHT - Main fields */}
//                 <div className="lg:col-span-2 space-y-5">
//                     {/* Basic Info */}
//                     <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
//                         <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                             <FiUser className="text-blue-600" /> Basic Information
//                         </h3>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <InputField label="First Name" name="first_name" icon={FiUser} required placeholder="John" value={formData.first_name} error={errors.first_name} onChange={handleChange} />
//                             <InputField label="Last Name" name="last_name" icon={FiUser} required placeholder="Doe" value={formData.last_name} error={errors.last_name} onChange={handleChange} />
//                             <InputField label="Email" name="email" type="email" icon={FiMail} required placeholder="john@example.com" value={formData.email} error={errors.email} onChange={handleChange} />
//                             <InputField label="Phone" name="phone" icon={FiPhone} required placeholder="9876543210" value={formData.phone} error={errors.phone} onChange={handleChange} />
//                             <InputField
//                                 label="Username"
//                                 name="username"
//                                 icon={FiUser}
//                                 placeholder="johndoe"
//                                 value={formData.username}
//                                 error={errors.username}
//                                 onChange={handleChange}
//                                 hint="Used to generate user code (USR-username)"
//                             />
//                             <InputField label="Date of Birth" name="date_of_birth" type="date" icon={FiCalendar} value={formData.date_of_birth} error={errors.date_of_birth} onChange={handleChange} />
//                             <SelectField
//                                 label="Gender"
//                                 name="gender"
//                                 icon={FiUser}
//                                 value={formData.gender}
//                                 error={errors.gender}
//                                 onChange={handleChange}
//                                 options={[
//                                     { value: '', label: 'Select Gender' },
//                                     { value: 'male', label: 'Male' },
//                                     { value: 'female', label: 'Female' },
//                                     { value: 'other', label: 'Other' },
//                                 ]}
//                             />
//                         </div>
//                     </div>

//                     {/* Password */}
//                     <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
//                         <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                             <FiLock className="text-blue-600" /> {isEditMode ? 'Change Password (Optional)' : 'Password'}
//                         </h3>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="relative">
//                                 <InputField
//                                     label="Password"
//                                     name="password"
//                                     type={showPassword ? 'text' : 'password'}
//                                     icon={FiLock}
//                                     required={!isEditMode}
//                                     placeholder="••••••"
//                                     value={formData.password}
//                                     error={errors.password}
//                                     onChange={handleChange}
//                                     hint={isEditMode ? 'Leave blank to keep current' : 'Minimum 6 characters'}
//                                     autoComplete="new-password"
//                                 />
//                                 <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
//                                     {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
//                                 </button>
//                             </div>
//                             <div className="relative">
//                                 <InputField
//                                     label="Confirm Password"
//                                     name="password_confirmation"
//                                     type={showConfirmPassword ? 'text' : 'password'}
//                                     icon={FiLock}
//                                     required={!isEditMode}
//                                     placeholder="••••••"
//                                     value={formData.password_confirmation}
//                                     error={errors.password_confirmation}
//                                     onChange={handleChange}
//                                     autoComplete="new-password"
//                                 />
//                                 <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
//                                     {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Address */}
//                     <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
//                         <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                             <FiMapPin className="text-blue-600" /> Address
//                         </h3>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="sm:col-span-2">
//                                 <InputField label="Street Address" name="address" icon={FiMapPin} placeholder="123, Main Street" value={formData.address} onChange={handleChange} />
//                             </div>
//                             <InputField label="City" name="city" placeholder="Surat" value={formData.city} onChange={handleChange} />
//                             <InputField label="State" name="state" placeholder="Gujarat" value={formData.state} onChange={handleChange} />
//                             <InputField label="Country" name="country" placeholder="India" value={formData.country} onChange={handleChange} />
//                             <InputField label="Postal Code" name="postal_code" placeholder="395006" value={formData.postal_code} onChange={handleChange} />
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex flex-col sm:flex-row gap-3">
//                         <button type="button" onClick={() => navigate('/admin/users')} className="flex-1 px-4 py-3 border border-sky-200 text-slate-700 bg-white rounded-xl hover:bg-sky-50 font-medium">
//                             Cancel
//                         </button>
//                         <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium">
//                             <FiSave size={18} /> {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
//                         </button>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default UserManagement;






import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiLock,
    FiShield, FiEye, FiEyeOff, FiCalendar, FiAlertCircle, FiRefreshCw,
    FiX,
} from 'react-icons/fi';
import { FaStore, FaUsersCog, FaUserTag } from 'react-icons/fa';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

/* ================= OPTIONS ================= */
const MAIN_USER_TYPES = [
    { value: 'customer', label: 'Customer' },
    { value: 'seller', label: 'Seller' },
    { value: 'seller_employee', label: 'Seller Employee' },
    { value: 'sub_admin', label: 'Sub Admin (Platform Staff)' },
    { value: 'super_admin', label: 'Super Admin' },
];

const SUB_ADMIN_TYPES = [
    { value: 'manager', label: 'Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'seller_manager', label: 'Seller Manager' },
];

const EMPLOYEE_TYPES = [
    { value: 'manager', label: 'Manager (Full Seller Access)' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'order_manager', label: 'Order Manager' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'account_manager', label: 'Account Manager' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'blocked', label: 'Blocked' },
];

const EMPTY_FORM = {
    first_name: '', last_name: '', email: '', phone: '', username: '',
    password: '', password_confirmation: '',
    user_type: 'customer',
    sub_admin_type: '',
    employee_type: '',
    seller_id: '',
    status: 'active',
    date_of_birth: '', gender: '', address: '', city: '', state: '',
    country: '', postal_code: '',
};

/* ================= FIELD COMPONENTS ================= */
const InputField = ({ label, name, type = 'text', icon: Icon, required = false, value, error, onChange, hint, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500"><Icon size={18} /></div>}
            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:border-red-500' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                {...props}
            />
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
    </div>
);

const SelectField = ({ label, name, icon: Icon, options = [], required = false, value, error, onChange, hint }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"><Icon size={18} /></div>}
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-9 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-sky-200 focus:border-blue-500'} rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none transition-all`}
            >
                {options.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} /> {error}</p>}
    </div>
);

/* ================= MAIN COMPONENT ================= */
const UserManagement = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const userId =
        params.userId || params.id ||
        new URLSearchParams(location.search).get('id') || '';
    const isEditMode = Boolean(userId) && !location.pathname.includes('/create');

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditMode);
    const [fetchError, setFetchError] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sellersList, setSellersList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);


    /* ---------- FETCH USER (Edit Mode) ---------- */
    // const fetchUserData = useCallback(async () => {
    //     if (!userId) return;
    //     setFetchLoading(true);
    //     setFetchError('');
    //     try {
    //         const res = await ApiService.getUserById(userId);
    //         const u = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || {};

    //         setFormData({
    //             ...EMPTY_FORM,
    //             first_name: u.first_name || '',
    //             last_name: u.last_name || '',
    //             email: u.email || '',
    //             phone: u.mobile_number || u.phone || '',
    //             username: u.username || '',
    //             user_type: u.user_type || 'customer',
    //             sub_admin_type: u.sub_admin_type || '',
    //             employee_type: u.employee_type || '',
    //             seller_id: (typeof u.seller_id === 'object' ? u.seller_id?._id : u.seller_id) || '',
    //             status: u.account_status || 'active',
    //             date_of_birth: u.date_of_birth ? new Date(u.date_of_birth).toISOString().slice(0, 10) : '',
    //             gender: u.gender || '',
    //             address: u.address || '',
    //             city: u.city || '',
    //             state: u.state || '',
    //             country: u.country || '',
    //             postal_code: u.postal_code || '',
    //             password: '',
    //             password_confirmation: '',
    //         });
    //     } catch (error) {
    //         console.error('Error fetching user:', error);
    //         setFetchError(error?.response?.data?.message || error?.message || 'Failed to fetch user');
    //         toast.error(error?.response?.data?.message || 'Failed to fetch user');
    //     } finally {
    //         setFetchLoading(false);
    //     }
    // }, [userId]);

    const fetchUserData = useCallback(async (silent = false) => {
        if (!userId) return;

        if (!silent) {
            setFetchLoading(true);
        } else {
            setRefreshing(true);
        }

        setFetchError('');
        try {
            const res = await ApiService.getUserById(userId);
            const u = res?.data?.data?.user || res?.data?.user || res?.data?.data || res?.data || {};

            setFormData({
                ...EMPTY_FORM,
                first_name: u.first_name || '',
                last_name: u.last_name || '',
                email: u.email || '',
                phone: u.mobile_number || u.phone || '',
                username: u.username || '',
                user_type: u.user_type || 'customer',
                sub_admin_type: u.sub_admin_type || '',
                employee_type: u.employee_type || '',
                seller_id: (typeof u.seller_id === 'object' ? u.seller_id?._id : u.seller_id) || '',
                status: u.account_status || 'active',
                date_of_birth: u.date_of_birth ? new Date(u.date_of_birth).toISOString().slice(0, 10) : '',
                gender: u.gender || '',
                address: u.address || '',
                city: u.city || '',
                state: u.state || '',
                country: u.country || '',
                postal_code: u.postal_code || '',
                password: '',
                password_confirmation: '',
            });

            if (silent) {
                toast.success('Data refreshed');
            }

        } catch (error) {
            console.error('Error fetching user:', error);
            setFetchError(error?.response?.data?.message || error?.message || 'Failed to fetch user');
            if (silent) {
                toast.error('Failed to refresh');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to fetch user');
            }
        } finally {
            if (!silent) {
                setFetchLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [userId]);

    /* ---------- FETCH SELLERS LIST ---------- */
    const fetchSellers = useCallback(async () => {
        try {
            let list = [];
            try {
                const res = await ApiService.getAllSellers?.({ limit: 200 });
                list = res?.data?.data?.sellers || res?.data?.data || res?.data?.sellers || res?.data || [];
            } catch {
                // ignore
            }
            if (!Array.isArray(list)) list = [];
            setSellersList(list);
        } catch {
            setSellersList([]);
        }
    }, []);

    useEffect(() => { if (isEditMode) fetchUserData(); }, [isEditMode, fetchUserData]);
    useEffect(() => { fetchSellers(); }, [fetchSellers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'user_type') {
                if (value !== 'sub_admin') next.sub_admin_type = '';
                if (value !== 'seller_employee') {
                    next.employee_type = '';
                    next.seller_id = '';
                }
            }
            return next;
        });
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const e = {};
        if (!formData.first_name.trim()) e.first_name = 'First name is required';
        if (!formData.last_name.trim()) e.last_name = 'Last name is required';
        if (!formData.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
        if (!formData.phone.trim()) e.phone = 'Phone is required';
        else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) e.phone = 'Invalid phone';

        if (formData.user_type === 'sub_admin' && !formData.sub_admin_type) {
            e.sub_admin_type = 'Sub-admin type is required';
        }
        if (formData.user_type === 'seller_employee' && !formData.employee_type) {
            e.employee_type = 'Employee type is required';
        }

        if (!isEditMode) {
            if (!formData.password) e.password = 'Password is required';
            else if (formData.password.length < 6) e.password = 'Min 6 characters';
            if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
        } else if (formData.password) {
            if (formData.password.length < 6) e.password = 'Min 6 characters';
            if (formData.password !== formData.password_confirmation) e.password_confirmation = 'Passwords do not match';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) { toast.error('Please fix form errors'); return; }

        setLoading(true);
        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                mobile_number: formData.phone.trim(),
                username: formData.username.trim() || undefined,
                user_type: formData.user_type,
                account_status: formData.status,
                date_of_birth: formData.date_of_birth || undefined,
                gender: formData.gender || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                country: formData.country || undefined,
                postal_code: formData.postal_code || undefined,
            };

            if (formData.user_type === 'sub_admin') {
                payload.sub_admin_type = formData.sub_admin_type;
            }
            if (formData.user_type === 'seller_employee') {
                payload.employee_type = formData.employee_type;
                if (formData.seller_id) payload.seller_id = formData.seller_id;
            }

            if (formData.password) payload.password = formData.password;

            if (isEditMode) {
                await ApiService.updateUserByAdmin(userId, payload);
                toast.success('User updated successfully');
            } else {
                await ApiService.createUserByAdmin(payload);
                toast.success('User created successfully');
            }
            navigate('/admin/users');

        } catch (error) {
            console.error('Save error:', error);
            const fieldErrors = error?.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
                const normalized = {};
                Object.entries(fieldErrors).forEach(([k, v]) => {
                    normalized[k] = Array.isArray(v) ? v[0] : (typeof v === 'object' ? v?.message : v);
                });
                setErrors(normalized);
                toast.error('Please fix the validation errors');
            } else {
                toast.error(error?.response?.data?.message || error?.message || 'Failed to save user');
            }
        } finally {
            setLoading(false);
        }
    };

    /* ---------- NAVIGATION ---------- */
    const handleBack = () => {
        if (isEditMode && window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/admin/users');
        }
    };

    const initials = `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}`.toUpperCase() || 'U';
    const showSubAdmin = formData.user_type === 'sub_admin';
    const showEmployee = formData.user_type === 'seller_employee';

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-700 font-medium">Loading user...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-[#eaf4ff] to-white pb-10">

            {/* HEADER */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5">
                <AdminTopbar
                    title={isEditMode ? 'Edit User' : 'Create User'}
                    subtitle={isEditMode ? 'Update user profile, role and access' : 'Add a new user to the platform'}
                    actions={
                        <>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fetchUserData(true);
                                    }}
                                    disabled={refreshing}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:px-4 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FiRefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                                    <span>{refreshing ? 'Refreshing...' : 'Reload'}</span>
                                </button>
                            )}

                        </>
                    }
                />
            </div>

            {fetchError && (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <span className="flex items-center gap-2"><FiAlertCircle /> {fetchError}</span>
                        <button onClick={fetchUserData} className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium">Retry</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-3xl font-bold border-4 border-sky-100 shadow-md mx-auto">
                                {initials}
                            </div>
                        </div>
                        <p className="mt-4 font-semibold text-slate-900 truncate">
                            {`${formData.first_name} ${formData.last_name}`.trim() || 'New User'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{formData.email || 'no-email@example.com'}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6 space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <FaUsersCog className="text-blue-600" /> Role &amp; Access
                        </h3>

                        <SelectField
                            label="User Type"
                            name="user_type"
                            icon={FiShield}
                            required
                            value={formData.user_type}
                            error={errors.user_type}
                            onChange={handleChange}
                            options={MAIN_USER_TYPES}
                        />

                        {showSubAdmin && (
                            <SelectField
                                label="Sub-Admin Type"
                                name="sub_admin_type"
                                icon={FiShield}
                                required
                                value={formData.sub_admin_type}
                                error={errors.sub_admin_type}
                                onChange={handleChange}
                                options={[{ value: '', label: 'Select Sub-Admin Type' }, ...SUB_ADMIN_TYPES]}
                                hint="Platform staff department"
                            />
                        )}

                        {showEmployee && (
                            <>
                                <SelectField
                                    label="Employee Type"
                                    name="employee_type"
                                    icon={FaUserTag}
                                    required
                                    value={formData.employee_type}
                                    error={errors.employee_type}
                                    onChange={handleChange}
                                    options={[{ value: '', label: 'Select Employee Type' }, ...EMPLOYEE_TYPES]}
                                />
                                {sellersList.length > 0 && (
                                    <SelectField
                                        label="Associated Seller (Optional)"
                                        name="seller_id"
                                        icon={FaStore}
                                        value={formData.seller_id}
                                        error={errors.seller_id}
                                        onChange={handleChange}
                                        options={[
                                            { value: '', label: 'Select Seller' },
                                            ...sellersList.map(s => ({
                                                value: s._id,
                                                label: s.business_name || s.store_name || s._id
                                            }))
                                        ]}
                                    />
                                )}
                            </>
                        )}

                        <SelectField
                            label="Account Status"
                            name="status"
                            icon={FiShield}
                            value={formData.status}
                            error={errors.status}
                            onChange={handleChange}
                            options={STATUS_OPTIONS}
                        />
                    </div>
                </div>

                {/* RIGHT - Main fields */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiUser className="text-blue-600" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="First Name" name="first_name" icon={FiUser} required placeholder="John" value={formData.first_name} error={errors.first_name} onChange={handleChange} />
                            <InputField label="Last Name" name="last_name" icon={FiUser} required placeholder="Doe" value={formData.last_name} error={errors.last_name} onChange={handleChange} />
                            <InputField label="Email" name="email" type="email" icon={FiMail} required placeholder="john@example.com" value={formData.email} error={errors.email} onChange={handleChange} />
                            <InputField label="Phone" name="phone" icon={FiPhone} required placeholder="9876543210" value={formData.phone} error={errors.phone} onChange={handleChange} />
                            <InputField
                                label="Username"
                                name="username"
                                icon={FiUser}
                                placeholder="johndoe"
                                value={formData.username}
                                error={errors.username}
                                onChange={handleChange}
                                hint="Used to generate user code (USR-username)"
                            />
                            <InputField label="Date of Birth" name="date_of_birth" type="date" icon={FiCalendar} value={formData.date_of_birth} error={errors.date_of_birth} onChange={handleChange} />
                            <SelectField
                                label="Gender"
                                name="gender"
                                icon={FiUser}
                                value={formData.gender}
                                error={errors.gender}
                                onChange={handleChange}
                                options={[
                                    { value: '', label: 'Select Gender' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiLock className="text-blue-600" /> {isEditMode ? 'Change Password (Optional)' : 'Password'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <InputField
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={FiLock}
                                    required={!isEditMode}
                                    placeholder="••••••"
                                    value={formData.password}
                                    error={errors.password}
                                    onChange={handleChange}
                                    hint={isEditMode ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            <div className="relative">
                                <InputField
                                    label="Confirm Password"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    icon={FiLock}
                                    required={!isEditMode}
                                    placeholder="••••••"
                                    value={formData.password_confirmation}
                                    error={errors.password_confirmation}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3 top-[42px] text-slate-400 hover:text-slate-600">
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FiMapPin className="text-blue-600" /> Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <InputField label="Street Address" name="address" icon={FiMapPin} placeholder="123, Main Street" value={formData.address} onChange={handleChange} />
                            </div>
                            <InputField label="City" name="city" placeholder="Surat" value={formData.city} onChange={handleChange} />
                            <InputField label="State" name="state" placeholder="Gujarat" value={formData.state} onChange={handleChange} />
                            <InputField label="Country" name="country" placeholder="India" value={formData.country} onChange={handleChange} />
                            <InputField label="Postal Code" name="postal_code" placeholder="395006" value={formData.postal_code} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 px-4 py-3 border border-sky-200 text-slate-700 bg-white rounded-xl hover:bg-sky-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-700 hover:to-sky-600 shadow-lg shadow-blue-200 disabled:opacity-60 font-medium"
                        >
                            <FiSave size={18} /> {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserManagement;