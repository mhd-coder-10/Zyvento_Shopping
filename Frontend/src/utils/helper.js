// ============================================================
// FRONTEND HELPERS FILE
// Description: All reusable helper functions for UI display
// 
// This file is for frontend use only. It is separate from backend helpers.
// Contains only UI display helper functions.
//
// Where It Will Be Used?
// - formatCurrency: Products, Cart, Orders, Payments, Dashboard, Reports
// - formatDate: Orders, Users, Sellers, Reviews, Notifications, Profile
// - formatTime: Notifications, Activity logs, Order timestamps
// - formatDateTime: Order details, Audit logs
// - timeAgo: Notifications, Reviews, Recent activities
// - truncateText: Product cards, Tables, Long text display
// - capitalize: Status display, Dropdown options, Headers
// - capitalizeWords: Name display, Title display
// - getInitials: User avatars, Profile pictures
// - getStatusColor: Status badges everywhere
// - formatNumber: Dashboard stats, Report counts
// - getPercentage: Reports, Analytics, Dashboard
// - groupBy: Reports, Dashboard charts
// - getFileSize: File upload, Document display
// - getDashboardPath: Login redirect, Role-based routing
// ============================================================

// ============================================================
// 1. CURRENCY FORMATTER
// Description: Converts a number to Indian Rupee (INR) format
// Used In: Products, Cart, Orders, Payments, Dashboard, Reports
// Example: formatCurrency(2499) → "₹2,499"
// ============================================================

export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `₹${amount}`;
    }
};

// With decimal points (for exact amounts)
export const formatCurrencyWithDecimal = (amount) => {
    if (!amount && amount !== 0) return '-';
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `₹${amount}`;
    }
};

// ============================================================
// 2. DATE FORMATTERS
// Description: Converts a date to a readable format
// Used In: Orders, Users, Sellers, Reviews, Notifications, Profile
// Example: formatDate("2024-01-15") → "15 Jan 2024"
// ============================================================

export const formatDate = (date) => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

export const formatTime = (date) => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return '-';
    }
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return `${formatDate(date)} ${formatTime(date)}`;
};

// ============================================================
// 3. RELATIVE TIME (Time Ago)
// Description: Converts a date to "2 hours ago", "3 days ago", etc
// Used In: Notifications, Reviews, Recent activities
// Example: timeAgo("2024-01-15T14:30:00") → "2 hours ago"
// ============================================================

export const timeAgo = (date) => {
    if (!date) return '-';
    try {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000);

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
        return `${Math.floor(diff / 31536000)} years ago`;
    } catch {
        return '-';
    }
};

// ============================================================
// 4. TEXT HELPERS
// Description: Truncates, capitalizes text, etc
// Used In: Product names, Descriptions, Titles, Dropdowns
// Example: truncateText("Very long text...", 20) → "Very long text..."
// ============================================================

export const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const capitalize = (str) => {
    if (!str) return '-';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
    if (!str) return '-';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// ============================================================
// 5. USER INITIALS
// Description: Generates initials from a user's name
// Used In: User avatars, Profile pictures (fallback)
// Example: getInitials("John Doe") → "JD"
// ============================================================

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

// ============================================================
// 6. STATUS COLOR HELPER
// Description: Returns a color based on the status
// Used In: Status badges everywhere
// Example: getStatusColor("pending") → "yellow"
// ============================================================

export const getStatusColor = (status) => {
    const colors = {
        // Account/User Status
        active: 'green',
        inactive: 'gray',
        blocked: 'red',
        deleted: 'red',

        // Order Status
        pending: 'yellow',
        confirmed: 'blue',
        packed: 'indigo',
        shipped: 'purple',
        out_for_delivery: 'orange',
        delivered: 'green',
        cancelled: 'red',
        returned: 'red',

        // Payment Status
        paid: 'green',
        failed: 'red',
        refunded: 'orange',
        partially_refunded: 'yellow',

        // Verification Status
        approved: 'green',
        rejected: 'red',
        suspended: 'red',
        under_review: 'yellow',

        // Return Status
        requested: 'yellow',
        picked: 'indigo',
        completed: 'green',
    };
    return colors[status?.toLowerCase()] || 'gray';
};

// ============================================================
// 7. NUMBER FORMATTER
// Description: Converts a number to Indian format
// Used In: Dashboard stats, Report counts
// Example: formatNumber(100000) → "1,00,000"
// ============================================================

export const formatNumber = (num) => {
    if (!num && num !== 0) return '-';
    try {
        return new Intl.NumberFormat('en-IN').format(num);
    } catch {
        return num;
    }
};

// ============================================================
// 8. PERCENTAGE CALCULATOR
// Description: Calculates percentage
// Used In: Reports, Analytics, Dashboard
// Example: getPercentage(50, 200) → 25
// ============================================================

export const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

// ============================================================
// 9. ARRAY GROUPING
// Description: Groups an array by a specific key
// Used In: Reports, Dashboard charts
// Example: groupBy(orders, 'status') → { pending: [...], delivered: [...] }
// ============================================================

export const groupBy = (array, key) => {
    if (!array) return {};
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// ============================================================
// 10. FILE SIZE FORMATTER
// Description: Converts file size to a readable format
// Used In: File upload, Document display
// Example: getFileSize(1048576) → "1 MB"
// ============================================================

export const getFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// ============================================================
// 11. ROLE-BASED DASHBOARD PATH
// Description: Returns the dashboard path based on user role
// Used In: Login redirect, Role-based routing
// Example: getDashboardPath("super_admin") → "/admin/dashboard"
// ============================================================

export const getDashboardPath = (role) => {
    const paths = {
        super_admin: '/admin/dashboard',
        sub_admin: '/admin/dashboard',
        seller: '/seller/dashboard',
        seller_employee: '/seller/dashboard',
        customer: '/',
    };
    return paths[role] || '/';
};

// ============================================================
// 12. EMAIL VALIDATOR (Frontend Validation)
// Description: Validates email format
// Used In: Login, Register, Profile forms
// Example: validateEmail("test@test.com") → true
// ============================================================

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// ============================================================
// 13. PHONE VALIDATOR (Frontend Validation)
// Description: Validates phone number format (10 digits)
// Used In: Register, Profile forms
// Example: validatePhone("9876543210") → true
// ============================================================

export const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
};

// ============================================================
// 14. PASSWORD VALIDATOR (Frontend Validation)
// Description: Validates password strength
// Used In: Register, Reset Password, Change Password
// Example: validatePassword("Password@123") → true
// ============================================================

export const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
};

// ============================================================
// 15. OBJECT TO QUERY STRING
// Description: Converts an object to URL query string
// Used In: API calls with params
// Example: objectToQueryString({ page: 1, limit: 10 }) → "?page=1&limit=10"
// ============================================================

export const objectToQueryString = (obj) => {
    if (!obj) return '';
    const params = new URLSearchParams();
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            params.append(key, obj[key]);
        }
    });
    const query = params.toString();
    return query ? `?${query}` : '';
};

// ============================================================
// 16. COPY TO CLIPBOARD
// Description: Copies text to clipboard
// Used In: Copy order ID, Copy coupon code
// Example: copyToClipboard("ORDER123") → true
// ============================================================

export const copyToClipboard = (text) => {
    if (!text) return false;
    try {
        navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

// ============================================================
// 17. DOWNLOAD FILE
// Description: Downloads a blob as a file
// Used In: Export reports, Download invoices
// Example: downloadFile(blobData, "report.pdf")
// ============================================================

export const downloadFile = (blob, filename) => {
    if (!blob || !filename) return;
    try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
    }
};

// ============================================================
// 18. SCROLL TO TOP
// Description: Scrolls the page to the top
// Used In: Page navigation, Pagination
// ============================================================

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

// ============================================================
// 19. GENERATE RANDOM ID
// Description: Generates a random ID
// Used In: Temporary IDs, Keys
// Example: generateRandomId() → "xyz123"
// ============================================================

export const generateRandomId = (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2);
};

// ============================================================
// 20. DARK/LIGHT MODE TOGGLE
// Description: Toggles dark/light mode
// Used In: Settings, Theme switcher
// ============================================================

export const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    return isDark;
};

export const getStoredTheme = () => {
    return localStorage.getItem('theme') || 'light';
};