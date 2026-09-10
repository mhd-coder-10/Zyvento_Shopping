// Handles all address related API requests
// Manages create, update, delete addresses and set default address
// Also handles fetching all addresses and default address

const addressService = require('../../services/customer/address.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

const addressController = {

    // ============ CREATE ADDRESS ============
    createAddress: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const addressData = req.body;

        const address = await addressService.createAddress({
            userId,
            ...addressData
        });

        res.status(201).json(
            ApiResponse.created(address, 'Address created successfully')
        );
    }),

    // ============ GET ADDRESSES ============
    getAddresses: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const addresses = await addressService.getAddresses(userId);

        res.status(200).json(
            ApiResponse.success(addresses, 'Addresses fetched successfully')
        );
    }),

    // ============ GET ADDRESS BY ID ============
    getAddressById: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { addressId } = req.params;

        const address = await addressService.getAddressById({
            addressId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(address, 'Address details fetched successfully')
        );
    }),

    // ============ UPDATE ADDRESS ============
    updateAddress: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { addressId } = req.params;
        const updateData = req.body;

        const address = await addressService.updateAddress({
            addressId,
            userId,
            updateData
        });

        res.status(200).json(
            ApiResponse.success(address, 'Address updated successfully')
        );
    }),

    // ============ DELETE ADDRESS ============
    deleteAddress: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { addressId } = req.params;

        await addressService.deleteAddress({
            addressId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(null, 'Address deleted successfully')
        );
    }),

    // ============ SET DEFAULT ADDRESS ============
    setDefaultAddress: asyncHandler(async (req, res) => {
        const userId = req.userId;
        const { addressId } = req.params;

        const address = await addressService.setDefaultAddress({
            addressId,
            userId
        });

        res.status(200).json(
            ApiResponse.success(address, 'Default address set successfully')
        );
    }),

    // ============ GET DEFAULT ADDRESS ============
    getDefaultAddress: asyncHandler(async (req, res) => {
        const userId = req.userId;

        const address = await addressService.getDefaultAddress(userId);

        if (!address) {
            return res.status(200).json(
                ApiResponse.success(null, 'No default address found')
            );
        }

        res.status(200).json(
            ApiResponse.success(address, 'Default address fetched successfully')
        );
    })
};

module.exports = addressController;