/**
 * Combined Seed Script — User + Employee
 * Handles: duplicate username auto-resolution
 *
 * Run: node scripts/seedEmployees.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI =
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/zyvento';

// ============ CONFIG ============
const SELLER_ID = new mongoose.Types.ObjectId('6aa3c650c8e44020ce480a8b');
const COMMON_PASSWORD = 'Test@1234';

// Raw collections
const UserRaw = mongoose.connection.collection('users');
const EmployeeRaw = mongoose.connection.collection('employees');
const SellerRaw = mongoose.connection.collection('sellers');

// ============ HELPERS ============
const log = {
    info: (m) => console.log(`\x1b[36m[INFO]\x1b[0m ${m}`),
    ok: (m) => console.log(`\x1b[32m[✅]\x1b[0m ${m}`),
    warn: (m) => console.log(`\x1b[33m[⚠️ ]\x1b[0m ${m}`),
    err: (m) => console.log(`\x1b[31m[❌]\x1b[0m ${m}`),
    section: (m) => console.log(`\n\x1b[35m========== ${m} ==========\x1b[0m\n`)
};

function generateEmployeeCode() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EMP-${ts}${rand}`;
}

// 👇 NEW: Generate unique username
async function getUniqueUsername(baseUsername) {
    let username = baseUsername;
    let counter = 0;
    while (await UserRaw.findOne({ username })) {
        counter++;
        username = `${baseUsername}${counter}`;
        if (counter > 100) {
            // Fallback — timestamp add karo
            username = `${baseUsername}${Date.now().toString(36).slice(-4)}`;
            break;
        }
    }
    return username;
}

// ============ DEMO DATA ============
const EMPLOYEES = [
    {
        first_name: 'Rahul', last_name: 'Sharma',
        username: 'rahulsharma',
        email: 'rahul.sharma@zyvento.com',
        mobile_number: '9000000031',
        user_code: 'USR-rahulsharma01',
        gender: 'male', city: 'Surat', state: 'Gujarat',
        employee_type: 'order_manager',
        designation: 'Order Processing Executive',
        department: 'Operations',
        joining_date: new Date('2025-06-15')
    },
    {
        first_name: 'Priya', last_name: 'Patel',
        username: 'priyapatel',
        email: 'priya.patel@zyvento.com',
        mobile_number: '9000000032',
        user_code: 'USR-priyapatel02',
        gender: 'female', city: 'Ahmedabad', state: 'Gujarat',
        employee_type: 'product_manager',
        designation: 'Product Catalog Manager',
        department: 'Catalog',
        joining_date: new Date('2025-07-01')
    },
    {
        first_name: 'Amit', last_name: 'Verma',
        username: 'amitverma',
        email: 'amit.verma@zyvento.com',
        mobile_number: '9000000033',
        user_code: 'USR-amitverma03',
        gender: 'male', city: 'Mumbai', state: 'Maharashtra',
        employee_type: 'inventory_manager',
        designation: 'Inventory Supervisor',
        department: 'Warehouse',
        joining_date: new Date('2025-05-20')
    },
    {
        first_name: 'Sneha', last_name: 'Reddy',
        username: 'snehareddy',
        email: 'sneha.reddy@zyvento.com',
        mobile_number: '9000000034',
        user_code: 'USR-snehareddy04',
        gender: 'female', city: 'Chennai', state: 'Tamil Nadu',
        employee_type: 'support_staff',
        designation: 'Customer Support Executive',
        department: 'Support',
        joining_date: new Date('2025-08-10')
    },
    {
        first_name: 'Karan', last_name: 'Singh',
        username: 'karansingh',
        email: 'karan.singh@zyvento.com',
        mobile_number: '9000000035',
        user_code: 'USR-karansingh05',
        gender: 'male', city: 'Kolkata', state: 'West Bengal',
        employee_type: 'account_manager',
        designation: 'Accounts Executive',
        department: 'Finance',
        joining_date: new Date('2025-04-05')
    }
];

// ============ MAIN SEED ============
async function seed() {
    await mongoose.connect(MONGO_URI);
    log.ok('Connected to MongoDB\n');

    // Verify Seller
    const seller = await SellerRaw.findOne({ _id: SELLER_ID });
    if (!seller) {
        log.err(`Seller not found with ID: ${SELLER_ID.toString()}`);
        process.exit(1);
    }
    log.info(`Using Seller: ${seller.business_name} (${seller._id})\n`);

    // Fetch Super Admin for created_by
    const superAdmin = await UserRaw.findOne({ user_type: 'super_admin' });
    const createdBy = superAdmin?._id || seller.user_id || SELLER_ID;

    let userCreated = 0;
    let empCreated = 0;
    let skipped = 0;
    let failed = 0;

    for (const data of EMPLOYEES) {
        try {
            log.section(`Processing: ${data.first_name} ${data.last_name}`);

            // ---------- Check User by email ----------
            let user = await UserRaw.findOne({ email: data.email });

            if (user) {
                log.warn(`User already exists: ${data.email}`);
            } else {
                // ---------- STEP 1: Create User ----------
                const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 10);
                const now = new Date();

                // 👇 Unique username
                const uniqueUsername = await getUniqueUsername(data.username);
                if (uniqueUsername !== data.username) {
                    log.warn(`Username "${data.username}" taken → using "${uniqueUsername}"`);
                }

                const userDoc = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    username: uniqueUsername,
                    email: data.email,
                    mobile_number: data.mobile_number,
                    password: hashedPassword,
                    profile_image: null,
                    profile_image_public_id: null,
                    user_type: 'seller_employee',
                    sub_admin_type: null,
                    employee_type: data.employee_type,
                    date_of_birth: null,
                    gender: data.gender,
                    address: null,
                    city: data.city,
                    state: data.state,
                    country: 'India',
                    postal_code: null,
                    role_ids: [],
                    direct_permissions: [],
                    seller_id: SELLER_ID,
                    employee_id: null,
                    is_email_verified: true,
                    is_mobile_verified: true,
                    account_status: 'active',
                    refresh_token: null,
                    password_reset_token: null,
                    password_reset_expiry: null,
                    last_login: null,
                    preferences: {
                        notifications: { email: true, push: true, sms: false },
                        language: 'en',
                        timezone: 'UTC'
                    },
                    created_at: now,
                    updated_at: now,
                    user_code: data.user_code,
                    __v: 0
                };

                const userResult = await UserRaw.insertOne(userDoc);
                user = { _id: userResult.insertedId };
                userCreated++;
                log.ok(`User created: ${data.email} (username: ${uniqueUsername}) → ${userResult.insertedId}`);
            }

            // ---------- Check Employee ----------
            const existingEmp = await EmployeeRaw.findOne({ user_id: user._id });
            if (existingEmp) {
                log.warn(`Employee already exists for user ${user._id} (skipping)`);
                skipped++;
                continue;
            }

            // ---------- STEP 2: Create Employee ----------
            const now = new Date();
            const empCode = generateEmployeeCode();

            const empDoc = {
                employee_code: empCode,
                user_id: user._id,
                seller_id: SELLER_ID,
                created_by: createdBy,
                full_name: `${data.first_name} ${data.last_name}`.trim(),
                email: data.email,
                mobile_number: data.mobile_number,
                employee_type: data.employee_type,
                designation: data.designation,
                department: data.department,
                joining_date: data.joining_date,
                role_ids: [],
                role_history: [],
                status: 'active',
                status_history: [{
                    from: null,
                    to: 'active',
                    changed_by: createdBy,
                    reason: 'Employee seeded (initial creation)',
                    notes: '',
                    changed_at: now
                }],
                notes: '',
                is_deleted: false,
                deleted_at: null,
                deleted_by: null,
                created_at: now,
                updated_at: now,
                __v: 0
            };

            const empResult = await EmployeeRaw.insertOne(empDoc);
            empCreated++;
            log.ok(`Employee created: ${empCode} → ${empResult.insertedId}`);

            // ---------- STEP 3: Back-link User → Employee ----------
            await UserRaw.updateOne(
                { _id: user._id },
                {
                    $set: {
                        employee_id: empResult.insertedId,
                        employee_type: data.employee_type,
                        seller_id: SELLER_ID,
                        updated_at: new Date()
                    }
                }
            );
            log.ok(`User back-linked: employee_id = ${empResult.insertedId}`);

        } catch (err) {
            failed++;
            log.err(`Failed for ${data.email}: ${err.message}`);
        }
    }

    // ============ SUMMARY ============
    log.section('SEED SUMMARY');
    console.log(`  Users Created:     ${userCreated}`);
    console.log(`  Employees Created: ${empCreated}`);
    console.log(`  Skipped (exists):  ${skipped}`);
    console.log(`  Failed:            ${failed}`);

    if (failed === 0) {
        log.ok('\nAll employees seeded successfully! 🎉');
    }

    log.section('LOGIN CREDENTIALS');
    console.log(`  Password (all):  ${COMMON_PASSWORD}\n`);
    EMPLOYEES.forEach((e) => console.log(`  ${e.email}`));

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    log.err(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
});