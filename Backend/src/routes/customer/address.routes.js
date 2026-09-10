    // Address route definitions
    // Create, update, delete address, set default
    // All address routes require customer authentication

    const express = require('express');
    const router = express.Router();

    const addressController = require('../../controllers/customer/address.controller');
    const auth = require('../../middleware/auth.middleware');
    const { authorize } = require('../../middleware/authorization.middleware');
    const { validate } = require('../../middleware/validation.middleware');
    const addressValidation = require('../../validations/address.validation');

    /**
     * @swagger
     * tags:
     *   name: Customer Address
     *   description: Customer address management endpoints
     */

    // ============ ALL ADDRESS ROUTES REQUIRE AUTH ============
    router.use(auth);
    router.use(authorize('customer'));

    // ============ CREATE ADDRESS ============

    /**
     * @swagger
     * /address:
     *   post:
     *     summary: Create a new address
     *     description: Add a new shipping/billing address for the customer
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - full_name
     *               - mobile_number
     *               - city
     *               - state
     *               - country
     *               - pincode
     *             properties:
     *               address_type:
     *                 type: string
     *                 enum: [home, office, other]
     *                 default: home
     *               full_name:
     *                 type: string
     *                 example: John Doe
     *               mobile_number:
     *                 type: string
     *                 example: "9876543210"
     *               house_number:
     *                 type: string
     *                 example: "123"
     *               street:
     *                 type: string
     *                 example: "Main Street"
     *               landmark:
     *                 type: string
     *                 example: "Near City Mall"
     *               city:
     *                 type: string
     *                 example: "Mumbai"
     *               state:
     *                 type: string
     *                 example: "Maharashtra"
     *               country:
     *                 type: string
     *                 example: "India"
     *               pincode:
     *                 type: string
     *                 example: "400001"
     *               is_default:
     *                 type: boolean
     *                 default: false
     *     responses:
     *       201:
     *         description: Address created successfully
     *       401:
     *         description: Unauthorized
     *       422:
     *         description: Validation error
     */
    router.post(
        '/',
        validate(addressValidation.createAddress),
        addressController.createAddress
    );

    // ============ GET ADDRESSES ============

    /**
     * @swagger
     * /address:
     *   get:
     *     summary: Get all addresses
     *     description: Get all addresses of the authenticated customer
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Addresses fetched successfully
     *       401:
     *         description: Unauthorized
     */
    router.get(
        '/',
        addressController.getAddresses
    );

    // ============ GET ADDRESS BY ID ============

    /**
     * @swagger
     * /address/{addressId}:
     *   get:
     *     summary: Get address by ID
     *     description: Get detailed information of a specific address
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: addressId
     *         required: true
     *         schema:
     *           type: string
     *         description: Address ID
     *     responses:
     *       200:
     *         description: Address details fetched successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Address not found
     */
    router.get(
        '/:addressId',
        validate(addressValidation.addressIdParam),
        addressController.getAddressById
    );

    // ============ UPDATE ADDRESS ============

    /**
     * @swagger
     * /address/{addressId}:
     *   put:
     *     summary: Update address
     *     description: Update an existing address
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: addressId
     *         required: true
     *         schema:
     *           type: string
     *         description: Address ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               address_type:
     *                 type: string
     *                 enum: [home, office, other]
     *               full_name:
     *                 type: string
     *               mobile_number:
     *                 type: string
     *               house_number:
     *                 type: string
     *               street:
     *                 type: string
     *               landmark:
     *                 type: string
     *               city:
     *                 type: string
     *               state:
     *                 type: string
     *               country:
     *                 type: string
     *               pincode:
     *                 type: string
     *               is_default:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Address updated successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Address not found
     *       422:
     *         description: Validation error
     */
    router.put(
        '/:addressId',
        validate(addressValidation.updateAddress),
        addressController.updateAddress
    );

    // ============ DELETE ADDRESS ============

    /**
     * @swagger
     * /address/{addressId}:
     *   delete:
     *     summary: Delete address
     *     description: Delete an address (if default, another address becomes default)
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: addressId
     *         required: true
     *         schema:
     *           type: string
     *         description: Address ID
     *     responses:
     *       200:
     *         description: Address deleted successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Address not found
     */
    router.delete(
        '/:addressId',
        validate(addressValidation.addressIdParam),
        addressController.deleteAddress
    );

    // ============ SET DEFAULT ADDRESS ============

    /**
     * @swagger
     * /address/{addressId}/default:
     *   patch:
     *     summary: Set default address
     *     description: Set a specific address as default
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: addressId
     *         required: true
     *         schema:
     *           type: string
     *         description: Address ID
     *     responses:
     *       200:
     *         description: Default address set successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Address not found
     */
    router.patch(
        '/:addressId/default',
        validate(addressValidation.addressIdParam),
        addressController.setDefaultAddress
    );

    // ============ GET DEFAULT ADDRESS ============

    /**
     * @swagger
     * /address/default:
     *   get:
     *     summary: Get default address
     *     description: Get the default address of the customer
     *     tags: [Customer Address]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Default address fetched successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: No default address found
     */
    router.get(
        '/default',
        addressController.getDefaultAddress
    );

    module.exports = router;