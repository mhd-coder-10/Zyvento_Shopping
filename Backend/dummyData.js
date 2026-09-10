// backend/backfillUserCodes.js
// Run: node backfillUserCodes.js
// Converts existing user_codes to new format: USR-{username}{seq}

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-marketplace';

// ============================================================
// Counter Model
// ============================================================
const counter_schema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}, { versionKey: false });

const Counter = mongoose.models.Counter || mongoose.model('Counter', counter_schema);

// ============================================================
// Helper: generate new user_code
// ============================================================
const buildUserCode = async (user) => {
    let base = user.username
        || (user.email ? user.email.split('@')[0] : null)
        || user.first_name
        || 'user';

    base = base.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (!base) base = 'user';

    const counter = await Counter.findOneAndUpdate(
        { _id: 'user_code' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const seqNumber = String(counter.seq).padStart(2, '0');
    let code = `USR-${base}${seqNumber}`;

    let suffix = 1;
    while (await User.exists({ user_code: code, _id: { $ne: user._id } })) {
        code = `USR-${base}${seqNumber}-${suffix}`;
        suffix += 1;
    }

    return code;
};

// ============================================================
// MAIN BACKFILL
// ============================================================
const backfill = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all users sorted by created_at (oldest first)
        const users = await User.find()
            .sort({ created_at: 1 })
            .select('_id email username first_name last_name user_code user_type');

        console.log(`🔍 Found ${users.length} users to process\n`);

        let updated = 0;

        for (const user of users) {
            const oldCode = user.user_code;
            const newCode = await buildUserCode(user);

            await User.updateOne(
                { _id: user._id },
                { $set: { user_code: newCode } }
            );

            console.log(`   ${user.email}`);
            console.log(`   Old: ${oldCode || '(none)'}`);
            console.log(`   New: ${newCode}`);
            console.log('');

            updated += 1;
        }

        console.log('═══════════════════════════════════════════════');
        console.log(`🎉 BACKFILL COMPLETE`);
        console.log(`   Updated: ${updated} users`);
        console.log(`   Counter: ${updated} (final sequence number)`);
        console.log('═══════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Backfill failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

backfill();