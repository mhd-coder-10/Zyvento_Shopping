// Handles file uploads, deletion, and management on Cloudinary
// Uploads images/files to Cloudinary and returns URLs
// Used for product images, profile pictures, seller documents

const { cloudinary } = require('../config/cloudinary.config');
const environment = require('../config/environment');
const fs = require('fs');
const path = require('path');
const ApiError = require('./apiError');
const logger = require('./logger');

class CloudinaryHelper {
    // ============ UPLOAD FILE ============
    async uploadFile(filePath, options = {}) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('File does not exist');
            }

            const uploadOptions = {
                folder: options.folder || environment.CLOUDINARY_FOLDER,
                resource_type: options.resource_type || 'auto',
                use_filename: true,
                unique_filename: true,
                ...options,
            };

            const result = await cloudinary.uploader.upload(filePath, uploadOptions);

            // Delete temp file after upload
            this.deleteTempFile(filePath);

            return {
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
            };
        } catch (error) {
            this.deleteTempFile(filePath);
            logger.error('Cloudinary upload failed:', error);
            throw ApiError.internal(`File upload failed: ${error.message}`);
        }
    }

    // ============ UPLOAD MULTIPLE FILES ============
    async uploadMultipleFiles(filePaths, options = {}) {
        const results = [];
        const errors = [];

        for (const filePath of filePaths) {
            try {
                const result = await this.uploadFile(filePath, options);
                results.push(result);
            } catch (error) {
                errors.push({ file: filePath, error: error.message });
            }
        }

        return { success: results, errors };
    }

    // ============ UPLOAD BUFFER ============
    async uploadBuffer(buffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: options.folder || environment.CLOUDINARY_FOLDER,
                resource_type: options.resource_type || 'auto',
                use_filename: true,
                unique_filename: true,
                ...options,
            };

            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    logger.error('Cloudinary upload failed:', error);
                    reject(ApiError.internal(`File upload failed: ${error.message}`));
                } else {
                    resolve({
                        success: true,
                        url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                        created_at: result.created_at,
                    });
                }
            });

            uploadStream.end(buffer);
        });
    }

    // ============ DELETE FILE ============
    async deleteFile(publicId) {
        try {
            if (!publicId) {
                throw new Error('Public ID is required');
            }

            const result = await cloudinary.uploader.destroy(publicId);
            
            if (result.result === 'ok') {
                return { success: true, result };
            } else {
                return { success: false, result };
            }
        } catch (error) {
            logger.error('Cloudinary delete failed:', error);
            throw ApiError.internal(`File delete failed: ${error.message}`);
        }
    }

    // ============ DELETE MULTIPLE FILES ============
    async deleteMultipleFiles(publicIds) {
        const results = [];
        for (const publicId of publicIds) {
            try {
                const result = await this.deleteFile(publicId);
                results.push({ publicId, ...result });
            } catch (error) {
                results.push({ publicId, success: false, error: error.message });
            }
        }
        return results;
    }

    // ============ GET OPTIMIZED URL ============
    getOptimizedUrl(publicId, options = {}) {
        if (!publicId) return null;

        return cloudinary.url(publicId, {
            width: options.width || 500,
            height: options.height || 500,
            crop: options.crop || 'fill',
            quality: options.quality || 'auto',
            format: options.format || 'webp',
            gravity: options.gravity || 'center',
            ...options,
        });
    }

    // ============ GET THUMBNAIL URL ============
    getThumbnailUrl(publicId, size = 200) {
        return this.getOptimizedUrl(publicId, {
            width: size,
            height: size,
            crop: 'thumb',
            gravity: 'face',
            format: 'webp',
        });
    }

    // ============ DELETE TEMP FILE ============
    deleteTempFile(filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Error deleting temp file:', error);
            return false;
        }
    }

    // ============ CLEANUP TEMP FOLDER ============
    cleanupTempFolder(ageInHours = 1) {
        const tempDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(tempDir)) return { deletedCount: 0 };

        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        let deletedCount = 0;

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtimeMs) / (1000 * 60 * 60);

            if (fileAge > ageInHours) {
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (error) {
                    logger.error('Error deleting temp file:', filePath, error);
                }
            }
        }

        return { deletedCount, ageLimit: ageInHours };
    }

    // ============ GET FILE INFO ============
    async getFileInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return {
                success: true,
                public_id: result.public_id,
                format: result.format,
                version: result.version,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                url: result.secure_url,
                created_at: result.created_at,
            };
        } catch (error) {
            logger.error('Cloudinary get file info failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Schedule cleanup every hour
const cloudinaryHelper = new CloudinaryHelper();
setInterval(() => {
    cloudinaryHelper.cleanupTempFolder(1);
}, 60 * 60 * 1000);

module.exports = cloudinaryHelper;