// validations/index.js

const authValidation = require('./auth.validation');
const adminValidation = require('./admin.validation');
const sellerValidation = require('./seller.validation');
const productValidation = require('./product.validation');
const orderValidation = require('./order.validation');
const commonValidation = require('./common.validation');
const cartValidation = require('./cart.validation');
const wishlistValidation = require('./wishlist.validation');
const addressValidation = require('./address.validation');
const employeeValidation = require('./employee.validation');
const payamentValidation = require("./payment.validation");
const reportValidation = require('./report.validation');

module.exports = {
    authValidation,
    adminValidation,
    sellerValidation,
    productValidation,
    orderValidation,
    commonValidation,
    cartValidation,
    wishlistValidation,
    addressValidation,
    employeeValidation,
    reportValidation
};