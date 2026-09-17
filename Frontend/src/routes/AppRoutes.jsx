
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ====== Route Guards ======
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';


// ====== Layouts ======
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';



// ====== Public Pages ======
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/changePassword';
import Profile from '../pages/auth/Profile';

import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Page404 from '../pages/public/Page404';
import Careers from '../pages/public/Careers';
import Blog from '../pages/public/Blog';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsConditions from '../pages/public/TermsConditions';
import Cookies from "../pages/public/Cookies";

import Notifications from '../pages/public/Notifications';
import Settings from '../pages/public/Settings';
import HelpCenter from '../pages/public/HelpCenter';
import FAQs from '../pages/public/FAQs';
import SavedAddresses from '../pages/public/SavedAddresses';

import Products from '../pages/public/product/Products';
import ProductDetail from '../pages/public/product/ProductDetail';
import Wishlist from '../pages/public/product/Wishlist';
import Cart from '../pages/public/product/Cart';
import Orders from '../pages/public/product/Orders';
import OrderDetails from '../pages/public/product/OrderDetails';

import Checkout from '../pages/public/product/Checkout';
import SearchResults from '../pages/public/product/SearchResults';
import Shipping from '../pages/public/product/Shipping';
import ReturnsRefunds from '../pages/public/product/ReturnsRefunds';
import OrderTracking from '../pages/public/product/OrderTracking';


// ====== Seller ======
import BecomeSeller from "../pages/public/seller/BecomeSeller"
import SellerStatus from "../pages/public/seller/SellerStatus"


// ====== Admin + Sub-Admin  ======

// Admin Dashboard
import AdminDashboard from '../pages/admin/dashboard/Dashboard';



// Admin - Roles
import RolePermission from '../pages/admin/roles/RolePermission';
import RoleDetails from '../pages/admin/roles/RoleDetails';
import PermissionDetails from '../pages/admin/roles/PermissionDetails';


// Admin - Users
import Users from '../pages/admin/users/Users';
import UserDetails from '../pages/admin/users/UserDetails';
import UserManagement from '../pages/admin/users/UserManagement';

// Admin - Sellers
import Sellers from '../pages/admin/sellers/Sellers';
import SellerDetails from '../pages/admin/sellers/SellerDetails';
import SellerEdit from '../pages/admin/sellers/SellerEdit';

import SubAdminList from '../pages/admin/sub-admins/SubAdminList';
import SubAdminDetails from '../pages/admin/sub-admins/SubAdminDetails';
import SubAdminManagement from '../pages/admin/sub-admins/SubAdminManagement';


// Admin - Employees
import EmployeeList from '../pages/admin/employees/EmployeeList';
import EmployeeDetails from '../pages/admin/employees/EmployeeDetails';
import EmployeeManagement from '../pages/admin/employees/EmployeeManagement';

// Admin - Products
import AdminProducts from '../pages/admin/products/Products';
import AdminProductDetails from '../pages/admin/products/ProductDetails';
import AdminProductEdit from '../pages/admin/products/ProductEdit'
import AdminCreateProduct from '../pages/admin/products/CreateProduct'

// Admin - Categories
import AdminCategories from '../pages/admin/categories/Categories';
import AdminCreateCategory from '../pages/admin/categories/CreateCategory';
import AdminCategoryEdit from '../pages/admin/categories/EditCategory';
import AdminCategoryDetails from '../pages/admin/categories/CategoryDetails';

// Admin - Sub-Categories
import AdminSubCategories from '../pages/admin/sub-categories/SubCategories';
import AdminCreateSubCategory from '../pages/admin/sub-categories/CreateSubCategory';
import AdminEditSubCategory from '../pages/admin/sub-categories/EditSubCategory';
import AdminSubCategoryDetails from '../pages/admin/sub-categories/SubCategoryDetails';

// Admin - Inventory
import Inventory from '../pages/admin/inventory/Inventory';

// Admin - Orders
import AdminOrders from '../pages/admin/orders/Orders';
import AdminOrderDetails from '../pages/admin/orders/OrderDetails';

// Admin - Payments
import Payments from '../pages/admin/payments/Payments';
import PaymentDetails from '../pages/admin/payments/PaymentDetails';

// Admin - Transactions
import Transactions from '../pages/admin/transactions/Transactions';
import TransactionDetails from '../pages/admin/transactions/TransactionDetails';

// Admin - Finance 
import AdminCompanyFinance from '../pages/admin/finance/CompanyFinance';


// Admin - Returns
import Returns from '../pages/admin/returns/Returns';
import ReturnDetails from '../pages/admin/returns/ReturnDetails';

// Admin - Reviews
import AdminReviewDetails from '../pages/admin/reviews/ReviewDetails';
import AdminReviews from '../pages/admin/reviews/Reviews';


// Admin - Coupons
import AdminCoupons from '../pages/admin/coupons/Coupons';
import AdminCreateCoupon from '../pages/admin/coupons/CreateCoupon';
import AdminEditCoupon from '../pages/admin/coupons/EditCoupon';
import AdminCouponDetails from '../pages/admin/coupons/CouponDetails';


// Admin - Notifications
import AdminNotifications from '../pages/admin/notifications/Notifications';
import AdminSendNotification from '../pages/admin/notifications/SendNotification';
import AdminNotificationDetails from '../pages/admin/notifications/NotificationDetails';


// Admin - Reports
import Reports from '../pages/admin/reports/Reports';

// Admin - Settings
import AdminSettings from '../pages/admin/settings/Settings';


const AppRoutes = () => {
    return (
        <Routes>
            {/* ===== 404 ===== */}
            <Route path="*" element={<Page404 />} />

            {/* ===== AUTH ROUTES (Login, Register, Forgot, Reset) ===== */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* ===== PUBLIC ROUTES (No auth required ) ===== */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/search-results" element={<SearchResults />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns-refunds" element={<ReturnsRefunds />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route path="/status-seller" element={<SellerStatus />} />
                <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* ===== PRIVATE ROUTES (Visible for only Logedin users ) ===== */}
            <Route element={<PrivateRoute />}>
                <Route element={<PublicLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/addresses" element={<SavedAddresses />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:orderId" element={<OrderDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                </Route>
            </Route>

            {/* ===== ADMIN ROUTES (Super Admin & Sub Admin) ===== */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute>
                        <RoleBasedRoute allowedRoles={['super_admin', 'sub_admin']}>
                            <AdminLayout />
                        </RoleBasedRoute>
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* Roles */}
                <Route path="roles" element={<RolePermission />} />
                <Route path="roles/create" element={<RolePermission />} />
                <Route path="roles/:roleId" element={<RoleDetails />} />
                <Route path="permissions" element={<RolePermission />} />
                <Route path="permissions/:permissionId" element={<PermissionDetails />} />

                {/* Users */}
                <Route path="users" element={<Users />} />
                <Route path="users/:userId" element={<UserDetails />} />
                <Route path="users/create" element={<UserManagement />} />
                <Route path="users/edit/:userId" element={<UserManagement />} />

                {/* Sellers - Order matters — most specific first */}
                <Route path="sellers/edit/:sellerCode" element={<SellerEdit />} />
                <Route path="sellers/:sellerCode" element={<SellerDetails />} />
                <Route path="sellers" element={<Sellers />} />

                {/* Sub-Admins  */}
                <Route path="/admin/sub-admins" element={<SubAdminList />} />
                <Route path="/admin/sub-admins/create" element={<SubAdminManagement />} />
                <Route path="/admin/sub-admins/:subAdminCode" element={<SubAdminDetails />} />
                <Route path="/admin/sub-admins/:subAdminCode/edit" element={<SubAdminManagement />} />

                {/* Employees */}
                <Route path="/admin/employees" element={<EmployeeList />} />
                <Route path="/admin/employees/create" element={<EmployeeManagement />} />
                <Route path="/admin/employees/:employeeCode" element={<EmployeeDetails />} />
                <Route path="/admin/employees/:employeeCode/edit" element={<EmployeeManagement />} />

                {/* Products */}
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/create" element={<AdminCreateProduct />} />
                <Route path="products/:productCode" element={<AdminProductDetails />} />
                <Route path="products/:productCode/edit" element={<AdminProductEdit />} />

                {/* Categories */}
                <Route path="categories" element={<AdminCategories />} />
                <Route path="categories/create" element={<AdminCreateCategory />} />
                <Route path="categories/:categoryCode" element={<AdminCategoryDetails />} />
                <Route path="categories/:categoryCode/edit" element={<AdminCategoryEdit />} />

                {/* Sub-Categories */}
                <Route path="sub-categories" element={<AdminSubCategories />} />
                <Route path="sub-categories/create" element={<AdminCreateSubCategory />} />
                <Route path="sub-categories/:code" element={<AdminSubCategoryDetails />} />
                <Route path="sub-categories/:code/edit" element={<AdminEditSubCategory />} />

                {/* Inventory */}
                <Route path="inventory" element={<Inventory />} />

                {/* Orders */}
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderCode" element={<AdminOrderDetails />} />

                {/* Payments */}
                <Route path="payments" element={<Payments />} />
                <Route path="payments/:paymentCode" element={<PaymentDetails />} />

                {/* Transactions */}
                <Route path="transactions" element={<Transactions />} />
                <Route path="transactions/:transactionCode" element={<TransactionDetails />} />


                {/* Finance */}
                <Route path="company-finance" element={<AdminCompanyFinance />} />

                {/* Returns */}
                <Route path="returns" element={<Returns />} />
                <Route path="returns/:orderCode" element={<ReturnDetails />} />

                {/* Reviews */}
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reviews/:reviewCode" element={<AdminReviewDetails />} />

                {/* Coupons */}
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="coupons/create" element={<AdminCreateCoupon />} />
                <Route path="coupons/:code" element={<AdminCouponDetails />} />
                <Route path="coupons/edit/:code" element={<AdminEditCoupon />} />

                {/* Notifications */}
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="notifications/send" element={<AdminSendNotification />} />
                <Route path="notifications/:notificationCode" element={<AdminNotificationDetails />} />

                {/* Reports */}
                <Route path="reports" element={<Reports />} />

                {/* Settings */}
                <Route path="settings" element={<AdminSettings />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;