/**
 * Backfill Script: Restore missing fields in Sub-Admin records
 * Run: node scripts/fixSubAdminFields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/zyvento';

const SubAdminRaw = mongoose.connection.collection('subadmins');
const UserRaw = mongoose.connection.collection('users');

function generateSubAdminCode() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SUBA-${ts}${rand}`;
}

async function fix() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected\n');

    const all = await SubAdminRaw.find({}).toArray();
    console.log(`Total Sub-Admins: ${all.length}\n`);

    const existingCodes = new Set(all.map((s) => s.sub_admin_code).filter(Boolean));

    let fixed = 0;
    let skipped = 0;

    for (const sa of all) {
        const updates = {};
        let needs = false;

        const user = sa.user_id ? await UserRaw.findOne({ _id: sa.user_id }) : null;

        // ---- full_name ----
        if (!sa.full_name || String(sa.full_name).trim() === '') {
            if (user) {
                const fn = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                updates.full_name = fn || user.email || `Sub-Admin ${sa._id}`;
            } else {
                updates.full_name = `Sub-Admin ${String(sa._id).slice(-6)}`;
            }
            needs = true;
        }

        // ---- email ----
        if (!sa.email || String(sa.email).trim() === '') {
            updates.email = user?.email || `subadmin-${sa._id}@zyvento.local`;
            needs = true;
        }

        // ---- mobile_number ----
        if ((!sa.mobile_number || String(sa.mobile_number).trim() === '') && user?.mobile_number) {
            updates.mobile_number = user.mobile_number;
            needs = true;
        }

        // ---- sub_admin_code ----
        if (!sa.sub_admin_code || String(sa.sub_admin_code).trim() === '') {
            let code = generateSubAdminCode();
            let attempts = 0;
            while (existingCodes.has(code) && attempts < 5) {
                code = generateSubAdminCode();
                attempts++;
            }
            updates.sub_admin_code = code;
            existingCodes.add(code);
            needs = true;
        }

        // ---- is_deleted ----
        if (sa.is_deleted === undefined) {
            updates.is_deleted = false;
            needs = true;
        }

        if (needs) {
            await SubAdminRaw.updateOne({ _id: sa._id }, { $set: updates });
            console.log(
                `✅ Fixed: ${sa._id} → ${updates.full_name || sa.full_name} | ${updates.email || sa.email}`
            );
            fixed++;
        } else {
            skipped++;
        }
    }

    console.log(`\n✅ Fixed: ${fixed} | Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
}

fix().catch((e) => {
    console.error(e);
    process.exit(1);
});