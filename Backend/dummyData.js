// backend/seedSellerDocuments.js
// Run: node seedSellerDocuments.js
// Creates Seller documents for existing Seller users
// Also updates User.seller_id to link back

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const Seller = require('./src/models/seller.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-marketplace';

// ============================================================
// SELLER DATA - Linked to existing User accounts
// ============================================================
const SELLER_DATA = [
    // 1. Rahul Verma
    {
        user_id: '6aa3c3b2d375cdbf3b8e5156',
        business_name: 'Rahul Fashion Store',
        owner_name: 'Rahul Verma',
        email: 'rahul.seller@zyvento.com',
        mobile_number: '9000000021',
        business_registration_number: 'BRN-RAHUL-001',
        tax_id: 'TAX-RAHUL-001',
        business_type: 'individual',
        gst_number: '24AAAAA0000A1Z1',
        pan_number: 'AAAAA0001A',
        business_address: {
            street: '45, Ring Road',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
            zip_code: '395002',
        },
        bank_details: {
            account_holder_name: 'Rahul Verma',
            bank_name: 'HDFC Bank',
            account_number: '1234567890001',
            ifsc_code: 'HDFC0001234',
            upi_id: 'rahul@hdfc',
        },
        commission_rate: 10,
        settings: {
            order_processing_time: 24,
            return_policy: '30 days return policy',
            shipping_methods: [],
        },
        verification_status: 'approved',
        account_status: 'active',
    },

    // 2. Priya Mehta
    {
        user_id: '6aa3c3b2d375cdbf3b8e5157',
        business_name: 'Priya Electronics',
        owner_name: 'Priya Mehta',
        email: 'priya.seller@zyvento.com',
        mobile_number: '9000000022',
        business_registration_number: 'BRN-PRIYA-002',
        tax_id: 'TAX-PRIYA-002',
        business_type: 'company',
        gst_number: '24AAAAA0000A1Z2',
        pan_number: 'AAAAA0002A',
        business_address: {
            street: '12, Adajan Road',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
            zip_code: '395009',
        },
        bank_details: {
            account_holder_name: 'Priya Mehta',
            bank_name: 'ICICI Bank',
            account_number: '1234567890002',
            ifsc_code: 'ICIC0001234',
            upi_id: 'priya@icici',
        },
        commission_rate: 12,
        settings: {
            order_processing_time: 24,
            return_policy: '15 days return policy',
            shipping_methods: [],
        },
        verification_status: 'approved',
        account_status: 'active',
    },

    // 3. Vikram Singh
    {
        user_id: '6aa3c3b2d375cdbf3b8e5158',
        business_name: 'Vikram Home Decor',
        owner_name: 'Vikram Singh',
        email: 'vikram.seller@zyvento.com',
        mobile_number: '9000000023',
        business_registration_number: 'BRN-VIKRAM-003',
        tax_id: 'TAX-VIKRAM-003',
        business_type: 'individual',
        gst_number: '24AAAAA0000A1Z3',
        pan_number: 'AAAAA0003A',
        business_address: {
            street: '78, Vesu Main Road',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
            zip_code: '395007',
        },
        bank_details: {
            account_holder_name: 'Vikram Singh',
            bank_name: 'State Bank of India',
            account_number: '1234567890003',
            ifsc_code: 'SBIN0001234',
            upi_id: 'vikram@sbi',
        },
        commission_rate: 10,
        settings: {
            order_processing_time: 24,
            return_policy: '30 days return policy',
            shipping_methods: [],
        },
        verification_status: 'approved',
        account_status: 'active',
    },

    // 4. Anjali Shah
    {
        user_id: '6aa3c3b2d375cdbf3b8e5159',
        business_name: 'Anjali Beauty Products',
        owner_name: 'Anjali Shah',
        email: 'anjali.seller@zyvento.com',
        mobile_number: '9000000024',
        business_registration_number: 'BRN-ANJALI-004',
        tax_id: 'TAX-ANJALI-004',
        business_type: 'brand',
        gst_number: '24AAAAA0000A1Z4',
        pan_number: 'AAAAA0004A',
        business_address: {
            street: '23, Krishna Complex',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            zip_code: '380009',
        },
        bank_details: {
            account_holder_name: 'Anjali Shah',
            bank_name: 'Axis Bank',
            account_number: '1234567890004',
            ifsc_code: 'UTIB0001234',
            upi_id: 'anjali@axis',
        },
        commission_rate: 10,
        settings: {
            order_processing_time: 24,
            return_policy: '30 days return policy',
            shipping_methods: [],
        },
        verification_status: 'approved',
        account_status: 'active',
    },

    // 5. John Seller (existing user)
    {
        user_id: '6aa269654ff18a01deaec15f',
        business_name: 'John Seller Store',
        owner_name: 'John Seller',
        email: 'seller@zyvento.com',
        mobile_number: '9000000006',
        business_registration_number: 'BRN-JOHN-005',
        tax_id: 'TAX-JOHN-005',
        business_type: 'individual',
        gst_number: '24AAAAA0000A1Z5',
        pan_number: 'AAAAA0005A',
        business_address: {
            street: '101, Main Bazaar',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
            zip_code: '395003',
        },
        bank_details: {
            account_holder_name: 'John Seller',
            bank_name: 'Kotak Mahindra Bank',
            account_number: '1234567890005',
            ifsc_code: 'KKBK0001234',
            upi_id: 'john@kotak',
        },
        commission_rate: 10,
        settings: {
            order_processing_time: 24,
            return_policy: '30 days return policy',
            shipping_methods: [],
        },
        verification_status: 'approved',
        account_status: 'active',
    },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
const seedSellerDocuments = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🏪 Creating seller documents...\n');

        let created = 0;
        let skipped = 0;
        const createdSellers = [];

        for (const sellerData of SELLER_DATA) {
            // 1. Verify the User exists
            const user = await User.findById(sellerData.user_id);
            if (!user) {
                console.log(`   ⚠️  User not found for ${sellerData.email} (ID: ${sellerData.user_id})`);
                console.log(`       Skipping...\n`);
                skipped += 1;
                continue;
            }

            // 2. Check if seller already exists
            const existingSeller = await Seller.findOne({
                $or: [
                    { user_id: sellerData.user_id },
                    { email: sellerData.email },
                ],
            });

            if (existingSeller) {
                console.log(`   ℹ️  Seller already exists: ${existingSeller.business_name} (${existingSeller.seller_code})`);
                skipped += 1;
                createdSellers.push(existingSeller);
                continue;
            }

            // 3. Create the Seller document (user_id as ObjectId)
            const seller = new Seller({
                ...sellerData,
                user_id: new mongoose.Types.ObjectId(sellerData.user_id),
            });
            await seller.save();
            created += 1;

            // 4. Update the User's seller_id to link back
            user.seller_id = seller._id;
            await user.save();

            console.log(`   ✅ Created: ${seller.business_name}`);
            console.log(`      Seller Code: ${seller.seller_code}`);
            console.log(`      Owner:       ${seller.owner_name}`);
            console.log(`      Email:       ${seller.email}`);
            console.log(`      Linked User: ${user.user_code} (${user.email})`);
            console.log('');

            createdSellers.push(seller);
        }

        // ============================================================
        // SUMMARY
        // ============================================================
        console.log('═══════════════════════════════════════════════');
        console.log('🎉 SEED COMPLETE');
        console.log('═══════════════════════════════════════════════');
        console.log(`✅ New sellers created:    ${created}`);
        console.log(`ℹ️  Skipped (existing):     ${skipped}`);
        console.log('');
        console.log('📋 ALL SELLERS:');
        createdSellers.forEach((s, idx) => {
            console.log(`   ${idx + 1}. ${(s.business_name || 'N/A').padEnd(28)} → ${s.seller_code || 'N/A'}`);
        });
        console.log('═══════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedSellerDocuments();