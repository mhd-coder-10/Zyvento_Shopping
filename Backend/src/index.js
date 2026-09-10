// Routes aggregation file
// Imports and mounts all API route modules
// Single entry point for all routes in the application

const express = require('express');
const router = express.Router();

// IMPORT ALL ROUTES
const authRoutes = require('./routes/auth_routes');

const adminRoutes = require('./routes/admin/admin.routes');
const roleRoutes = require('./routes/admin/role.routes');
const permissionRoutes = require('./routes/admin/permission.routes');

const subAdminRoutes = require('./routes/subAdmin/subAdmin.routes');

const sellerRoutes = require('./routes/seller/seller.routes');
const sellerRegistrationRoutes = require('./routes/seller/sellerRegistration.routes');
const sellerApprovalRoutes = require('./routes/seller/sellerApproval.routes');

const employeeRoutes = require('./routes/employee/employee.routes');

const productRoutes = require('./routes/product/product.routes');
const categoryRoutes = require('./routes/product/category.routes');
const inventoryRoutes = require('./routes/product/inventory.routes');

const orderRoutes = require('./routes/order/order.routes');
const returnRoutes = require('./routes/order/return.routes');

const cartRoutes = require('./routes/customer/cart.routes');
const wishlistRoutes = require('./routes/customer/wishlist.routes');
const addressRoutes = require('./routes/customer/address.routes');

const paymentRoutes = require('./routes/payment/payment.routes');

const notificationRoutes = require('./routes/notification/notification.routes');

const reportRoutes = require('./routes/report/report.routes');


// MOUNT ALL ROUTES
router.use('/auth', authRoutes);

router.use('/admin', adminRoutes);
router.use('/admin/roles', roleRoutes);
router.use('/admin/permissions', permissionRoutes);

router.use('/sub-admin', subAdminRoutes);

router.use('/seller', sellerRoutes);
router.use('/seller/registration', sellerRegistrationRoutes);
router.use('/seller/approval', sellerApprovalRoutes);

router.use('/employee', employeeRoutes);

router.use('/product', productRoutes);
router.use('/category', categoryRoutes);
router.use('/inventory', inventoryRoutes);

router.use('/order', orderRoutes);
router.use('/return', returnRoutes);

router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/address', addressRoutes);

router.use('/payment', paymentRoutes);

router.use('/notification', notificationRoutes);

router.use('/report', reportRoutes);


module.exports = router;