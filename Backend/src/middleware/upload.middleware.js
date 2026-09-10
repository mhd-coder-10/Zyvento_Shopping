const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiError = require('../utils/apiError');

/**
 * Upload Middleware
 * Handles file upload with temporary storage
 */
class UploadMiddleware {
    constructor() {
        this.tempDir = path.join(__dirname, '../uploads/temp');
        this.ensureTempDirectory();
    }

    // ============ ENSURE TEMP DIRECTORY ============
    ensureTempDirectory() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // ============ FILE FILTER ============
    getFileFilter() {
        return (req, file, cb) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'image/webp',
                'image/gif',
                'image/svg+xml',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(
                    new ApiError(
                        400,
                        `File type not allowed. Allowed: ${allowedTypes.join(', ')}`
                    ),
                    false
                );
            }
        };
    }

    // ============ GET STORAGE ============
    getStorage() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.tempDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
                const ext = path.extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        });
    }

    // ============ GET MAX SIZE ============
    getMaxSize() {
        return parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
    }

    // ============ UPLOAD SINGLE ============
    uploadSingle(fieldName) {
        const upload = multer({
            storage: this.getStorage(),
            limits: {
                fileSize: this.getMaxSize(),
            },
            fileFilter: this.getFileFilter(),
        });

        return upload.single(fieldName);
    }

    // ============ UPLOAD MULTIPLE ============
    uploadMultiple(fieldName, maxCount = 10) {
        const upload = multer({
            storage: this.getStorage(),
            limits: {
                fileSize: this.getMaxSize(),
            },
            fileFilter: this.getFileFilter(),
        });

        return upload.array(fieldName, maxCount);
    }

    // ============ UPLOAD FIELDS ============
    uploadFields(fields) {
        const upload = multer({
            storage: this.getStorage(),
            limits: {
                fileSize: this.getMaxSize(),
            },
            fileFilter: this.getFileFilter(),
        });

        return upload.fields(fields);
    }

    // ============ ERROR HANDLER ============
    handleUploadError() {
        return (err, req, res, next) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(ApiError.badRequest('File too large. Maximum size is 10MB.'));
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(ApiError.badRequest('Unexpected file field'));
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(ApiError.badRequest('Too many files uploaded'));
                }
                return next(ApiError.badRequest(`Upload error: ${err.message}`));
            }
            next(err);
        };
    }
}

// ============ CLEANUP OLD TEMP FILES ============
const uploadMiddleware = new UploadMiddleware();

// Cleanup every hour
setInterval(() => {
    const tempDir = uploadMiddleware.tempDir;
    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtimeMs) / (1000 * 60 * 60);

        // Delete files older than 1 hour
        if (fileAge > 1) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error('Error deleting temp file:', filePath, error);
            }
        }
    }
}, 60 * 60 * 1000);

// module.exports = uploadMiddleware;
module.exports = {
    uploadSingle: uploadMiddleware.uploadSingle.bind(uploadMiddleware),
    uploadMultiple: uploadMiddleware.uploadMultiple.bind(uploadMiddleware),
    uploadFields: uploadMiddleware.uploadFields.bind(uploadMiddleware),
    handleUploadError: uploadMiddleware.handleUploadError.bind(uploadMiddleware),
};