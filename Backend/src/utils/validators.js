// Common validation functions for email, phone, password, pincode
// Reusable validation utilities across the application
// Used in services and validation files

class Validators {
    // ============ EMAIL ============
    static isValidEmail(email) {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // ============ PHONE ============
    static isValidPhone(phone) {
        if (!phone) return false;
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return re.test(String(phone));
    }

    // ============ PASSWORD ============
    static isValidPassword(password) {
        if (!password) return false;
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return re.test(String(password));
    }

    // ============ PINCODE ============
    static isValidPincode(pincode) {
        if (!pincode) return false;
        const re = /^[0-9]{5,6}$/;
        return re.test(String(pincode));
    }

    // ============ URL ============
    static isValidUrl(url) {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // ============ MONGO ID ============
    static isValidMongoId(id) {
        if (!id) return false;
        const re = /^[0-9a-fA-F]{24}$/;
        return re.test(String(id));
    }

    // ============ EMPTY CHECK ============
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    // ============ NUMERIC ============
    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // ============ BOOLEAN ============
    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    // ============ DATE ============
    static isValidDate(value) {
        return !isNaN(Date.parse(value));
    }

    // ============ RANGE ============
    static isInRange(value, min, max) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    // ============ LENGTH ============
    static isLength(value, min, max) {
        const length = String(value).length;
        return length >= min && length <= max;
    }

    // ============ ARRAY ============
    static isArray(value) {
        return Array.isArray(value);
    }

    // ============ OBJECT ============
    static isObject(value) {
        return value && typeof value === 'object' && !Array.isArray(value);
    }

    // ============ SANITIZE ============
    static sanitizeString(str) {
        if (!str) return '';
        return String(str).trim().replace(/<[^>]*>/g, '');
    }

    // ============ SANITIZE EMAIL ============
    static sanitizeEmail(email) {
        if (!email) return '';
        return String(email).trim().toLowerCase();
    }
}

module.exports = Validators;