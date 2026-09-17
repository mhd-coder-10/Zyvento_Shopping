// /**
//  * Seed default Roles + Permissions (Amazon-style)
//  * Run: node scripts/seedRolesPermissions.js
//  */

// require('dotenv').config();
// const mongoose = require('mongoose');

// const MONGO_URI =
//     process.env.MONGO_URI ||
//     process.env.MONGODB_URI ||
//     'mongodb://localhost:27017/zyvento';

// const PermissionRaw = mongoose.connection.collection('permissions');
// const RoleRaw = mongoose.connection.collection('roles');

// const log = {
//     info: (m) => console.log(`\x1b[36m[INFO]\x1b[0m ${m}`),
//     ok: (m) => console.log(`\x1b[32m[✅]\x1b[0m ${m}`),
//     warn: (m) => console.log(`\x1b[33m[⚠️ ]\x1b[0m ${m}`),
//     err: (m) => console.log(`\x1b[31m[❌]\x1b[0m ${m}`),
//     section: (m) => console.log(`\n\x1b[35m========== ${m} ==========\x1b[0m\n`)
// };

// // ============================================================
// // PERMISSIONS DEFINITION — module → actions
// // ============================================================
// const PERMISSIONS_MAP = {
//     dashboard: ['read'],
//     users: ['read', 'create', 'update', 'delete'],
//     sub_admins: ['read', 'create', 'update', 'delete'],
//     employees: ['read', 'create', 'update', 'delete'],
//     sellers: ['read', 'create', 'update', 'delete', 'approve', 'reject'],
//     products: ['read', 'create', 'update', 'delete', 'approve', 'reject'],
//     categories: ['read', 'create', 'update', 'delete'],
//     inventory: ['read', 'update'],
//     orders: ['read', 'update', 'manage'],
//     returns: ['read', 'approve', 'reject', 'manage'],
//     payments: ['read', 'manage', 'export'],
//     transactions: ['read', 'export'],
//     finance: ['read', 'export'],
//     reviews: ['read', 'update', 'delete', 'manage'],
//     coupons: ['read', 'create', 'update', 'delete'],
//     notifications: ['read', 'create', 'delete'],
//     reports: ['read', 'export'],
//     marketing: ['read', 'create', 'update', 'delete'],
//     roles: ['read', 'create', 'update', 'delete', 'assign'],
//     permissions: ['read', 'create', 'update', 'delete'],
//     settings: ['read', 'update']
// };

// const ACTION_LABEL = {
//     read: 'View',
//     create: 'Create',
//     update: 'Update',
//     delete: 'Delete',
//     manage: 'Manage',
//     approve: 'Approve',
//     reject: 'Reject',
//     export: 'Export',
//     import: 'Import',
//     assign: 'Assign'
// };

// // ============================================================
// // ROLE TEMPLATES — Amazon-style defaults
// // ============================================================
// const ROLE_TEMPLATES = [
//     {
//         role_name: 'Manager',
//         role_key: 'MANAGER',
//         role_type: 'sub_admin',
//         description: 'Full platform access (except Settings and Roles)',
//         data_scope: 'all',
//         is_system_role: true,
//         priority: 90,
//         permissions: {
//             // Only these modules
//             dashboard: ['read'],
//             users: ['read', 'create', 'update', 'delete'],
//             sellers: ['read', 'create', 'update', 'delete', 'approve', 'reject'],
//             employees: ['read', 'create', 'update', 'delete'],
//             products: ['read', 'create', 'update', 'delete', 'approve', 'reject'],
//             categories: ['read', 'create', 'update', 'delete'],
//             inventory: ['read', 'update'],
//             orders: ['read', 'update', 'manage'],
//             returns: ['read', 'approve', 'reject', 'manage'],
//             payments: ['read', 'manage', 'export'],
//             transactions: ['read', 'export'],
//             finance: ['read', 'export'],
//             reviews: ['read', 'update', 'delete', 'manage'],
//             coupons: ['read', 'create', 'update', 'delete'],
//             notifications: ['read', 'create', 'delete'],
//             reports: ['read', 'export'],
//             marketing: ['read', 'create', 'update', 'delete']
//         }
//     },
//     {
//         role_name: 'Finance Manager',
//         role_key: 'FINANCE_MANAGER',
//         role_type: 'sub_admin',
//         description: 'Finance, Payments, Reports only',
//         data_scope: 'all',
//         is_system_role: true,
//         priority: 70,
//         permissions: {
//             dashboard: ['read'],
//             orders: ['read'],
//             returns: ['read', 'approve', 'reject'],
//             payments: ['read', 'manage', 'export'],
//             transactions: ['read', 'export'],
//             finance: ['read', 'export'],
//             reports: ['read', 'export']
//         }
//     },
//     {
//         role_name: 'Support Manager',
//         role_key: 'SUPPORT_MANAGER',
//         role_type: 'sub_admin',
//         description: 'Users, Orders, Returns (view)',
//         data_scope: 'all',
//         is_system_role: true,
//         priority: 60,
//         permissions: {
//             dashboard: ['read'],
//             users: ['read'],
//             orders: ['read', 'update'],
//             returns: ['read', 'approve', 'reject', 'manage'],
//             reviews: ['read', 'update']
//         }
//     },
//     {
//         role_name: 'Seller Manager',
//         role_key: 'SELLER_MANAGER',
//         role_type: 'sub_admin',
//         description: 'Seller verification & management',
//         data_scope: 'all',
//         is_system_role: true,
//         priority: 65,
//         permissions: {
//             dashboard: ['read'],
//             sellers: ['read', 'create', 'update', 'approve', 'reject'],
//             employees: ['read', 'create', 'update', 'delete'],
//             reports: ['read', 'export']
//         }
//     },
//     {
//         role_name: 'Seller',
//         role_key: 'SELLER',
//         role_type: 'seller',
//         description: 'Seller dashboard access',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 50,
//         permissions: {
//             dashboard: ['read'],
//             products: ['read', 'create', 'update', 'delete'],
//             inventory: ['read', 'update'],
//             orders: ['read', 'update', 'manage'],
//             returns: ['read'],
//             reviews: ['read'],
//             reports: ['read']
//         }
//     },
//     {
//         role_name: 'Order Manager',
//         role_key: 'ORDER_MANAGER',
//         role_type: 'employee',
//         description: 'Manages orders only',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 40,
//         permissions: {
//             dashboard: ['read'],
//             orders: ['read', 'update', 'manage'],
//             returns: ['read']
//         }
//     },
//     {
//         role_name: 'Product Manager',
//         role_key: 'PRODUCT_MANAGER',
//         role_type: 'employee',
//         description: 'Manages products only',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 40,
//         permissions: {
//             dashboard: ['read'],
//             products: ['read', 'create', 'update', 'delete']
//         }
//     },
//     {
//         role_name: 'Inventory Manager',
//         role_key: 'INVENTORY_MANAGER',
//         role_type: 'employee',
//         description: 'Stock management',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 40,
//         permissions: {
//             dashboard: ['read'],
//             inventory: ['read', 'update'],
//             products: ['read']
//         }
//     },
//     {
//         role_name: 'Support Staff',
//         role_key: 'SUPPORT_STAFF',
//         role_type: 'employee',
//         description: 'Customer queries',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 40,
//         permissions: {
//             dashboard: ['read'],
//             orders: ['read'],
//             returns: ['read'],
//             reviews: ['read']
//         }
//     },
//     {
//         role_name: 'Account Manager',
//         role_key: 'ACCOUNT_MANAGER',
//         role_type: 'employee',
//         description: 'Accounts & payouts',
//         data_scope: 'own',
//         is_system_role: true,
//         priority: 40,
//         permissions: {
//             dashboard: ['read'],
//             payments: ['read'],
//             transactions: ['read'],
//             reports: ['read', 'export']
//         }
//     }
// ];

// // ============================================================
// // MAIN SEED
// // ============================================================
// async function seed() {
//     await mongoose.connect(MONGO_URI);
//     log.ok('Connected to MongoDB\n');

//     // ---------- 1. Seed permissions ----------
//     log.section('Seeding Permissions');

//     const permissionKeyToId = {}; // "USERS.READ" → ObjectId
//     let permCreated = 0;
//     let permSkipped = 0;

//     for (const [module, actions] of Object.entries(PERMISSIONS_MAP)) {
//         for (const action of actions) {
//             const key = `${module.toUpperCase()}_${action.toUpperCase()}`;
//             const name = `${ACTION_LABEL[action] || action} ${module.replace(/_/g, ' ')}`;

//             const existing = await PermissionRaw.findOne({ permission_key: key });
//             if (existing) {
//                 permissionKeyToId[`${module}.${action}`] = existing._id;
//                 permSkipped++;
//                 continue;
//             }

//             const result = await PermissionRaw.insertOne({
//                 permission_name: name,
//                 permission_key: key,
//                 module_name: module,
//                 sub_module: null,
//                 action,
//                 description: `${name} access`,
//                 is_system: true,
//                 is_active: true,
//                 priority: 0,
//                 created_by: null,
//                 updated_by: null,
//                 metadata: {},
//                 created_at: new Date(),
//                 updated_at: new Date(),
//                 __v: 0
//             });

//             permissionKeyToId[`${module}.${action}`] = result.insertedId;
//             permCreated++;
//         }
//     }

//     log.ok(`Permissions → Created: ${permCreated}, Skipped: ${permSkipped}`);

//     // ---------- 2. Seed roles ----------
//     log.section('Seeding Roles');

//     let roleCreated = 0;
//     let roleSkipped = 0;

//     for (const tpl of ROLE_TEMPLATES) {
//         const existing = await RoleRaw.findOne({ role_key: tpl.role_key });
//         if (existing) {
//             log.warn(`Role exists: ${tpl.role_key} (skipped)`);
//             roleSkipped++;
//             continue;
//         }

//         // Map permission keys to ObjectIds
//         const permissionIds = [];
//         for (const [module, actions] of Object.entries(tpl.permissions)) {
//             for (const action of actions) {
//                 const id = permissionKeyToId[`${module}.${action}`];
//                 if (id) permissionIds.push(id);
//             }
//         }

//         await RoleRaw.insertOne({
//             role_name: tpl.role_name,
//             role_key: tpl.role_key,
//             role_type: tpl.role_type,
//             description: tpl.description,
//             permission_ids: permissionIds,
//             data_scope: tpl.data_scope,
//             is_system_role: tpl.is_system_role,
//             is_active: true,
//             priority: tpl.priority,
//             created_by: null,
//             updated_by: null,
//             created_at: new Date(),
//             updated_at: new Date(),
//             __v: 0
//         });

//         log.ok(`Role created: ${tpl.role_name} (${permissionIds.length} permissions)`);
//         roleCreated++;
//     }

//     // ---------- SUMMARY ----------
//     log.section('SEED SUMMARY');
//     console.log(`  Permissions Created: ${permCreated}`);
//     console.log(`  Permissions Skipped: ${permSkipped}`);
//     console.log(`  Roles Created:       ${roleCreated}`);
//     console.log(`  Roles Skipped:       ${roleSkipped}`);

//     log.ok('\nSeed complete! 🎉');

//     await mongoose.disconnect();
//     process.exit(0);
// }

// seed().catch((err) => {
//     log.err(`Fatal error: ${err.message}`);
//     console.error(err);
//     process.exit(1);
// });