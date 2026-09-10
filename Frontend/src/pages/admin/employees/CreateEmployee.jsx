// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft,
//     FiUser,
//     FiMail,
//     FiPhone,
//     FiBriefcase,
//     FiCheck,
//     FiX,
//     FiShield,
//     FiInfo,
// } from 'react-icons/fi';

// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';
// import LoadingSpinner from '../../../components/common/LoadingSpinner';

// const CreateEmployee = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [roles, setRoles] = useState([]);
//     const [sellers, setSellers] = useState([]);
//     const [formData, setFormData] = useState({
//         first_name: '',
//         last_name: '',
//         email: '',
//         mobile_number: '',
//         password: '',
//         confirm_password: '',
//         employee_type: '',
//         seller_id: '',
//         status: 'active',
//     });
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         fetchFormData();
//     }, []);

//     const fetchFormData = async () => {
//         try {
//             const [rolesRes, sellersRes] = await Promise.all([
//                 ApiService.getAllRoles({ limit: 100 }),
//                 ApiService.getAllSellers({ limit: 100 }),
//             ]);

//             if (rolesRes.data.success) {
//                 setRoles(rolesRes.data.data || []);
//             }
//             if (sellersRes.data.success) {
//                 setSellers(sellersRes.data.data || []);
//             }
//         } catch (error) {
//             console.error('Failed to fetch form data:', error);
//             toast.error('Failed to load form data');
//         }
//     };

//     const validate = () => {
//         const newErrors = {};
//         if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//         if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
//         if (!formData.email.trim()) {
//             newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Enter a valid email address';
//         }
//         if (!formData.mobile_number.trim()) {
//             newErrors.mobile_number = 'Mobile number is required';
//         } else if (!/^[0-9]{10}$/.test(formData.mobile_number)) {
//             newErrors.mobile_number = 'Enter a valid 10-digit mobile number';
//         }
//         if (!formData.password) {
//             newErrors.password = 'Password is required';
//         } else if (formData.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters';
//         }
//         if (formData.password !== formData.confirm_password) {
//             newErrors.confirm_password = 'Passwords do not match';
//         }
//         if (!formData.employee_type) newErrors.employee_type = 'Employee type is required';
//         if (!formData.seller_id) newErrors.seller_id = 'Please select a seller';
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validate()) return;

//         setLoading(true);
//         try {
//             const data = {
//                 first_name: formData.first_name,
//                 last_name: formData.last_name,
//                 email: formData.email,
//                 mobile_number: formData.mobile_number,
//                 password: formData.password,
//                 employee_type: formData.employee_type,
//                 seller_id: formData.seller_id,
//                 status: formData.status,
//             };
//             await ApiService.createEmployeeBySeller(data);
//             toast.success('Employee created successfully');
//             navigate('/admin/employees');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to create employee');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return <LoadingSpinner fullPage text="Creating employee..." />;
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-100 p-4 md:p-6">
//             <AdminTopbar
//                 title="Create Employee"
//                 subtitle="Add a new employee with role assignment"
//                 actions={
//                     <button
//                         onClick={() => navigate('/admin/employees')}
//                         className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm bg-white"
//                     >
//                         <FiArrowLeft className="w-4 h-4" />
//                         Back to Employees
//                     </button>
//                 }
//             />

//             <div className="max-w-2xl">
//                 <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
//                     <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-start gap-3">
//                         <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-semibold text-blue-800">Role & Permissions</p>
//                             <p className="text-xs text-blue-600">
//                                 Employee will get permissions based on the selected role.
//                                 Roles and their permissions are managed in the Roles module.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 First Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="first_name"
//                                 value={formData.first_name}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.first_name ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                                 placeholder="John"
//                             />
//                             {errors.first_name && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Last Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="last_name"
//                                 value={formData.last_name}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.last_name ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                                 placeholder="Doe"
//                             />
//                             {errors.last_name && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Email <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             className={`w-full px-3 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                             placeholder="john@example.com"
//                         />
//                         {errors.email && (
//                             <p className="text-sm text-red-500 mt-1">{errors.email}</p>
//                         )}
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Mobile Number <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="tel"
//                             name="mobile_number"
//                             value={formData.mobile_number}
//                             onChange={handleChange}
//                             className={`w-full px-3 py-2.5 rounded-xl border ${errors.mobile_number ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                             placeholder="9876543210"
//                         />
//                         {errors.mobile_number && (
//                             <p className="text-sm text-red-500 mt-1">{errors.mobile_number}</p>
//                         )}
//                     </div>

//                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Select Seller <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 name="seller_id"
//                                 value={formData.seller_id}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.seller_id ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                             >
//                                 <option value="">Select Seller</option>
//                                 {sellers.map((seller) => (
//                                     <option key={seller._id} value={seller._id}>
//                                         {seller.business_name || seller.email}
//                                     </option>
//                                 ))}
//                             </select>
//                             {errors.seller_id && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.seller_id}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Employee Role <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 name="employee_type"
//                                 value={formData.employee_type}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.employee_type ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                             >
//                                 <option value="">Select Role</option>
//                                 {roles.map((role) => (
//                                     <option key={role._id} value={role.name}>
//                                         {role.name}
//                                     </option>
//                                 ))}
//                             </select>
//                             {errors.employee_type && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.employee_type}</p>
//                             )}
//                             <p className="text-xs text-gray-400 mt-1">
//                                 Role determines employee's permissions
//                             </p>
//                         </div>
//                     </div>

//                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Password <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                                 placeholder="Min 8 characters"
//                             />
//                             {errors.password && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.password}</p>
//                             )}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Confirm Password <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="password"
//                                 name="confirm_password"
//                                 value={formData.confirm_password}
//                                 onChange={handleChange}
//                                 className={`w-full px-3 py-2.5 rounded-xl border ${errors.confirm_password ? 'border-red-500' : 'border-gray-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm`}
//                                 placeholder="Confirm password"
//                             />
//                             {errors.confirm_password && (
//                                 <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Status
//                         </label>
//                         <select
//                             name="status"
//                             value={formData.status}
//                             onChange={handleChange}
//                             className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white shadow-sm text-sm"
//                         >
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="pending">Pending</option>
//                         </select>
//                     </div>

//                     <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
//                         >
//                             <FiCheck className="w-4 h-4" />
//                             Create Employee
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => navigate('/admin/employees')}
//                             className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
//                         >
//                             <FiX className="w-4 h-4" />
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateEmployee;







// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//     FiArrowLeft, FiInfo, FiSave, FiX,
// } from 'react-icons/fi';

// import ApiService from '../../../api/ApiService';
// import AdminTopbar from '../../../components/admin/AdminTopbar';

// const CreateEmployee = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [roles, setRoles] = useState([]);
//     const [sellers, setSellers] = useState([]);
//     const [formData, setFormData] = useState({
//         first_name: '', last_name: '', email: '', mobile_number: '',
//         password: '', confirm_password: '', employee_type: '', seller_id: '', status: 'active',
//     });
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         fetchFormData();
//     }, []);

//     const fetchFormData = async () => {
//         try {
//             const [rolesRes, sellersRes] = await Promise.all([
//                 ApiService.getAllRoles({ limit: 100 }),
//                 ApiService.getAllSellers({ limit: 100 }),
//             ]);
//             if (rolesRes.data.success) setRoles(rolesRes.data.data || []);
//             if (sellersRes.data.success) setSellers(sellersRes.data.data || []);
//         } catch (error) {
//             console.error('Failed to fetch form data:', error);
//             toast.error('Failed to load form data');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const validate = () => {
//         const newErrors = {};
//         if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//         if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
//         if (!formData.email.trim()) newErrors.email = 'Email is required';
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
//         if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
//         else if (!/^[0-9]{10}$/.test(formData.mobile_number)) newErrors.mobile_number = 'Enter a valid 10-digit mobile number';
//         if (!formData.password) newErrors.password = 'Password is required';
//         else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//         if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
//         if (!formData.employee_type) newErrors.employee_type = 'Employee role is required';
//         if (!formData.seller_id) newErrors.seller_id = 'Please select a seller';
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validate()) return;
//         setSubmitting(true);
//         try {
//             const data = {
//                 first_name: formData.first_name, last_name: formData.last_name,
//                 email: formData.email, mobile_number: formData.mobile_number,
//                 password: formData.password, employee_type: formData.employee_type,
//                 seller_id: formData.seller_id, status: formData.status,
//             };
//             await ApiService.createEmployeeBySeller(data);
//             toast.success('Employee created successfully');
//             navigate('/admin/employees');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to create employee');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                     <p className="mt-2 text-gray-600">Loading form data...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
//             <AdminTopbar
//                 title="Create Employee"
//                 subtitle="Add a new employee with role assignment"
//                 actions={
//                     <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
//                         <FiArrowLeft className="w-4 h-4" /> Back to Employees
//                     </button>
//                 }
//             />

//             <div className="max-w-2xl mx-auto p-4 md:p-6">
//                 <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
//                     <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-start gap-3">
//                         <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                         <div>
//                             <p className="text-sm font-semibold text-blue-800">Role & Permissions</p>
//                             <p className="text-xs text-blue-600">Employee will get permissions based on the selected role.</p>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
//                             <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="John" />
//                             {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
//                             <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="Doe" />
//                             {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
//                         <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="john@example.com" />
//                         {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
//                         <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.mobile_number ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="9876543210" />
//                         {errors.mobile_number && <p className="text-sm text-red-500 mt-1">{errors.mobile_number}</p>}
//                     </div>

//                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Select Seller <span className="text-red-500">*</span></label>
//                             <select name="seller_id" value={formData.seller_id} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.seller_id ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`}>
//                                 <option value="">Select Seller</option>
//                                 {sellers.map((seller) => <option key={seller._id} value={seller._id}>{seller.business_name || seller.email}</option>)}
//                             </select>
//                             {errors.seller_id && <p className="text-sm text-red-500 mt-1">{errors.seller_id}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Employee Role <span className="text-red-500">*</span></label>
//                             <select name="employee_type" value={formData.employee_type} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.employee_type ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`}>
//                                 <option value="">Select Role</option>
//                                 {roles.map((role) => <option key={role._id} value={role.name}>{role.name}</option>)}
//                             </select>
//                             {errors.employee_type && <p className="text-sm text-red-500 mt-1">{errors.employee_type}</p>}
//                         </div>
//                     </div>

//                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
//                             <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="Min 8 characters" />
//                             {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
//                             <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm`} placeholder="Confirm password" />
//                             {errors.confirm_password && <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>}
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                         <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm">
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="pending">Pending</option>
//                         </select>
//                     </div>

//                     <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//                         <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
//                             <FiSave className="w-4 h-4" /> {submitting ? 'Creating...' : 'Create Employee'}
//                         </button>
//                         <button type="button" onClick={() => navigate('/admin/employees')} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
//                             <FiX className="w-4 h-4" /> Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateEmployee;





import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiInfo, FiSave, FiX } from 'react-icons/fi';
import ApiService from '../../../api/ApiService';
import AdminTopbar from '../../../components/admin/AdminTopbar';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', mobile_number: '',
        password: '', confirm_password: '', employee_type: '', seller_id: '', status: 'active',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [rolesRes, sellersRes] = await Promise.all([
                ApiService.getAllRoles({ limit: 100 }),
                ApiService.getAllSellers({ limit: 100 }),
            ]);
            if (rolesRes.data.success) setRoles(rolesRes.data.data || []);
            if (sellersRes.data.success) setSellers(sellersRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
        if (!formData.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
        else if (!/^[0-9]{10}$/.test(formData.mobile_number)) newErrors.mobile_number = 'Enter a valid 10-digit mobile number';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
        if (!formData.employee_type) newErrors.employee_type = 'Employee role is required';
        if (!formData.seller_id) newErrors.seller_id = 'Please select a seller';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await ApiService.createEmployee(formData);
            toast.success('Employee created successfully');
            navigate('/admin/employees');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
            <AdminTopbar
                title="Create Employee"
                subtitle="Add a new employee with role assignment"
                actions={
                    <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <FiArrowLeft className="w-4 h-4" /> Back to Employees
                    </button>
                }
            />

            <div className="max-w-2xl mx-auto p-4 md:p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-start gap-3">
                        <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Role & Permissions</p>
                            <p className="text-xs text-blue-600">Employee will get permissions based on the selected role. Employee ID will be auto-generated.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="Rahul" />
                            {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="Sharma" />
                            {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="rahul@example.com" />
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                            <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.mobile_number ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="9876543210" />
                            {errors.mobile_number && <p className="text-sm text-red-500 mt-1">{errors.mobile_number}</p>}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Seller <span className="text-red-500">*</span></label>
                            <select name="seller_id" value={formData.seller_id} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.seller_id ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`}>
                                <option value="">Select Seller</option>
                                {sellers.map((seller) => <option key={seller._id} value={seller._id}>{seller.business_name || seller.email}</option>)}
                            </select>
                            {errors.seller_id && <p className="text-sm text-red-500 mt-1">{errors.seller_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Role <span className="text-red-500">*</span></label>
                            <select name="employee_type" value={formData.employee_type} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.employee_type ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`}>
                                <option value="">Select Role</option>
                                {roles.map((role) => <option key={role._id} value={role.name}>{role.name}</option>)}
                            </select>
                            {errors.employee_type && <p className="text-sm text-red-500 mt-1">{errors.employee_type}</p>}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="Min 8 characters" />
                            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} className={`w-full px-3 py-2.5 rounded-xl border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm`} placeholder="Confirm password" />
                            {errors.confirm_password && <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            <FiSave className="w-4 h-4" /> {submitting ? 'Creating...' : 'Create Employee'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/employees')} className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <FiX className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployee;