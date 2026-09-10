import { ALL_MODULES } from './modules.config';

export const SIDEBAR_CONFIG = {
  sections: [
    {
      id: 'main',
      label: 'MAIN',
      items: ['dashboard', 'users', 'sellers', 'products', 'categories'],
    },
    {
      id: 'operations',
      label: 'OPERATIONS',
      items: ['orders', 'payments', 'reviews'],
    },
    {
      id: 'analytics',
      label: 'ANALYTICS',
      items: ['reports'],
    },
    {
      id: 'system',
      label: 'SYSTEM',
      items: ['roles', 'notifications', 'settings'],
    },
    {
      id: 'account',
      label: 'ACCOUNT',
      items: ['profile'],
    },
  ],

  subModules: {
    users: {
      label: 'Users',
      children: [
        { id: 'users-list', label: 'All Users', path: '/users', permission: 'view_users' },
        { id: 'users-add', label: 'Add User', path: '/users/add', permission: 'create_user' },
      ],
    },
    sellers: {
      label: 'Sellers',
      children: [
        { id: 'sellers-list', label: 'All Sellers', path: '/sellers', permission: 'view_sellers' },
        { id: 'sellers-pending', label: 'Pending Approval', path: '/sellers/pending', permission: 'approve_sellers' },
      ],
    },
    products: {
      label: 'Products',
      children: [
        { id: 'products-list', label: 'All Products', path: '/products', permission: 'view_products' },
        { id: 'products-add', label: 'Add Product', path: '/products/add', permission: 'create_product' },
        { id: 'products-pending', label: 'Pending Approval', path: '/products/pending', permission: 'approve_products' },
      ],
    },
    reports: {
      label: 'Reports',
      children: [
        { id: 'reports-sales', label: 'Sales Report', path: '/reports/sales', permission: 'view_reports' },
        { id: 'reports-revenue', label: 'Revenue Report', path: '/reports/revenue', permission: 'view_reports' },
        { id: 'reports-products', label: 'Product Report', path: '/reports/products', permission: 'view_reports' },
        { id: 'reports-users', label: 'User Report', path: '/reports/users', permission: 'view_reports' },
      ],
    },
    roles: {
      label: 'Roles & Permissions',
      children: [
        { id: 'roles-list', label: 'All Roles', path: '/roles', permission: 'view_roles' },
        { id: 'roles-create', label: 'Create Role', path: '/roles/create', permission: 'create_role' },
      ],
    },
    notifications: {
      label: 'Notifications',
      children: [
        { id: 'notifications-list', label: 'All Notifications', path: '/notifications', permission: 'view_notifications' },
        { id: 'notifications-broadcast', label: 'Broadcast', path: '/notifications/broadcast', permission: 'send_notifications' },
      ],
    },
    settings: {
      label: 'Settings',
      children: [
        { id: 'settings-general', label: 'General', path: '/settings/general', permission: 'manage_settings' },
        { id: 'settings-email', label: 'Email', path: '/settings/email', permission: 'manage_settings' },
        { id: 'settings-payment', label: 'Payment', path: '/settings/payment', permission: 'manage_settings' },
      ],
    },
    profile: {
      label: 'Profile',
      children: [
        { id: 'profile-info', label: 'Profile Info', path: '/profile', permission: 'view_profile' },
        { id: 'profile-password', label: 'Change Password', path: '/profile/password', permission: 'view_profile' },
      ],
    },
  },
};