// Common helper functions like ID generation, date formatting, pagination
// Contains reusable utilities like generateOrderNumber, calculateDiscount
// Used across multiple services and controllers

const crypto = require('crypto');

class Helpers {
    // ============ ORDER NUMBER ============
    static generateOrderNumber() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    // ============ TRANSACTION ID ============
    static generateTransactionId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(6).toString('hex').toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }

    // ============ COUPON CODE ============
    static generateCouponCode(prefix = 'CPN') {
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}-${random}`;
    }

    // ============ SKU ============
    static generateSKU(productName, category) {
        const namePrefix = productName.substring(0, 3).toUpperCase();
        const catPrefix = category.substring(0, 3).toUpperCase();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        return `${catPrefix}-${namePrefix}-${random}`;
    }

    // ============ PAGINATION ============
    static getPagination(page = 1, limit = 10, total = 0) {
        const currentPage = parseInt(page, 10) || 1;
        const perPage = parseInt(limit, 10) || 10;
        const totalPages = Math.ceil(total / perPage);
        const skip = (currentPage - 1) * perPage;

        return {
            page: currentPage,
            limit: perPage,
            totalPages: totalPages,
            total: total,
            skip: skip,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
        };
    }

    // ============ DISCOUNT CALCULATOR ============
    static calculateDiscount(price, discountPercentage) {
        const discount = (price * discountPercentage) / 100;
        const finalPrice = price - discount;
        return {
            originalPrice: price,
            discount: discount,
            discountPercentage: discountPercentage,
            finalPrice: finalPrice,
        };
    }

    // ============ TAX CALCULATOR ============
    static calculateTax(amount, taxRate = 18) {
        const tax = (amount * taxRate) / 100;
        return {
            tax: tax,
            taxRate: taxRate,
            totalWithTax: amount + tax,
        };
    }

    // ============ FORMAT CURRENCY ============
    static formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    // ============ SANITIZE OBJECT ============
    static sanitizeObject(obj, ...keysToRemove) {
        const sanitized = { ...obj };
        keysToRemove.forEach(key => {
            delete sanitized[key];
        });
        return sanitized;
    }

    // ============ SLEEP ============
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============ GET DATE RANGE ============
    static getDateRange(startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }

    // ============ GET DAYS ============
    static getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // ============ TRUNCATE STRING ============
    static truncateString(str, length = 100) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    // ============ RANDOM STRING ============
    static randomString(length = 16) {
        return crypto.randomBytes(length).toString('hex');
    }

    // ============ REMOVE NULL/UNDEFINED ============
    static removeEmpty(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined && value !== '') {
                result[key] = value;
            }
        }
        return result;
    }
}

module.exports = Helpers;