const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiError = require('./apiError');

/**
 * File Upload Utility
 * Handles file upload configuration and management
 */
class FileUpload {
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
                cb(new ApiError(400, `File type ${file.mimetype} is not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
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

    // ============ DELETE TEMP FILE ============
    deleteTempFile(filePath) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting temp file:', error);
            return false;
        }
    }

    // ============ DELETE MULTIPLE TEMP FILES ============
    deleteTempFiles(filePaths) {
        const results = [];
        for (const filePath of filePaths) {
            const success = this.deleteTempFile(filePath);
            results.push({ filePath, success });
        }
        return results;
    }

    // ============ CLEANUP OLD TEMP FILES ============
    cleanupOldTempFiles(ageInHours = 1) {
        if (!fs.existsSync(this.tempDir)) return;

        const files = fs.readdirSync(this.tempDir);
        const now = Date.now();
        let deletedCount = 0;

        for (const file of files) {
            const filePath = path.join(this.tempDir, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtimeMs) / (1000 * 60 * 60);

            if (fileAge > ageInHours) {
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (error) {
                    console.error('Error deleting temp file:', filePath, error);
                }
            }
        }

        return { deletedCount, ageLimit: ageInHours };
    }

    // ============ GET FILE SIZE ============
    getFileSize(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                return stats.size;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    // ============ GET FILE EXTENSION ============
    getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    }

    // ============ GET FILE NAME WITHOUT EXTENSION ============
    getFileNameWithoutExtension(filename) {
        return path.basename(filename, path.extname(filename));
    }
}

// Schedule cleanup every hour
const fileUpload = new FileUpload();
setInterval(() => {
    fileUpload.cleanupOldTempFiles(1);
}, 60 * 60 * 1000);

module.exports = fileUpload;