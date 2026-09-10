// Handles all address related business logic
// Manages create, update, delete addresses and set default address
// Also handles fetching all addresses and default address

const Address = require('../../models/address.model');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

class AddressService {

    // ============ CREATE ADDRESS ============
    async createAddress({
        userId,
        address_type,
        full_name,
        mobile_number,
        house_number,
        street,
        landmark,
        city,
        state,
        country,
        pincode,
        is_default = false
    }) {
        // If is_default is true, remove default from other addresses
        if (is_default) {
            await Address.updateMany(
                { user_id: userId },
                { is_default: false }
            );
        }

        const address = new Address({
            user_id: userId,
            address_type: address_type || 'home',
            full_name,
            mobile_number,
            house_number: house_number || '',
            street: street || '',
            landmark: landmark || '',
            city,
            state,
            country,
            pincode,
            is_default
        });

        await address.save();

        logger.info(`Address created for user: ${userId}`, { addressId: address._id });

        return address;
    }

    // ============ GET ADDRESSES ============
    async getAddresses(userId) {
        const addresses = await Address.find({ user_id: userId })
            .sort({ is_default: -1, created_at: -1 });

        return addresses;
    }

    // ============ GET ADDRESS BY ID ============
    async getAddressById({ addressId, userId }) {
        const address = await Address.findOne({
            _id: addressId,
            user_id: userId
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        return address;
    }

    // ============ UPDATE ADDRESS ============
    async updateAddress({ addressId, userId, updateData }) {
        const address = await Address.findOne({
            _id: addressId,
            user_id: userId
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        const allowedFields = [
            'address_type', 'full_name', 'mobile_number', 'house_number',
            'street', 'landmark', 'city', 'state', 'country', 'pincode'
        ];

        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        // If is_default is being set to true, remove default from other addresses
        if (updateData.is_default === true) {
            await Address.updateMany(
                { user_id: userId },
                { is_default: false }
            );
            filteredData.is_default = true;
        }

        Object.assign(address, filteredData);
        await address.save();

        logger.info(`Address updated: ${addressId}`, { userId });

        return address;
    }

    // ============ DELETE ADDRESS ============
    async deleteAddress({ addressId, userId }) {
        const address = await Address.findOne({
            _id: addressId,
            user_id: userId
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        // If deleting default address, set another as default if exists
        if (address.is_default) {
            const anotherAddress = await Address.findOne({
                user_id: userId,
                _id: { $ne: addressId }
            });

            if (anotherAddress) {
                anotherAddress.is_default = true;
                await anotherAddress.save();
            }
        }

        await address.deleteOne();

        logger.info(`Address deleted: ${addressId}`, { userId });

        return { message: 'Address deleted successfully' };
    }

    // ============ SET DEFAULT ADDRESS ============
    async setDefaultAddress({ addressId, userId }) {
        const address = await Address.findOne({
            _id: addressId,
            user_id: userId
        });

        if (!address) {
            throw ApiError.notFound('Address not found');
        }

        // Remove default from all addresses
        await Address.updateMany(
            { user_id: userId },
            { is_default: false }
        );

        // Set this address as default
        address.is_default = true;
        await address.save();

        logger.info(`Default address set: ${addressId}`, { userId });

        return address;
    }

    // ============ GET DEFAULT ADDRESS ============
    async getDefaultAddress(userId) {
        const address = await Address.findOne({
            user_id: userId,
            is_default: true
        });

        return address;
    }
}

module.exports = new AddressService();