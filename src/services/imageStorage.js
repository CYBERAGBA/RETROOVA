const { Readable } = require('stream');
const fs = require('fs/promises');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const sensitiveCategories = new Set(['id-card', 'passport', 'license', 'bank-card', 'documents', 'birth-certificate', 'cmu-card', 'money-card']);

const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
);
const cloudinaryRequired = process.env.NODE_ENV === 'production';

if (cloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

const uploadToCloudinary = (file, folder = 'retroova/items', sensitive = false) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', ...(sensitive ? { transformation: [{ effect: 'blur:1200' }] } : {}) },
        (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(file.buffer).pipe(uploadStream);
});

const storeImage = async (file, { sensitive = false } = {}) => {
    if (!file) return null;
    if (cloudinaryConfigured) {
        const result = await uploadToCloudinary(file, 'retroova/items', sensitive);
        return { filename: result.public_id, url: result.secure_url };
    }
    if (cloudinaryRequired) {
        const error = new Error('Cloudinary is not configured for production uploads.');
        error.code = 'CLOUDINARY_NOT_CONFIGURED';
        throw error;
    }
    if (sensitive) {
        try {
            const blurredImage = await sharp(file.path || file.buffer).blur(12).toBuffer();
            await fs.writeFile(file.path, blurredImage);
        } catch (error) {
            console.error('Erreur protection photo sensible:', error);
            const protectionError = new Error('Sensitive image protection failed.');
            protectionError.code = 'SENSITIVE_IMAGE_PROTECTION_FAILED';
            throw protectionError;
        }
    }
    return { filename: file.filename, url: `/uploads/${file.filename}` };
};

module.exports = { cloudinaryConfigured, cloudinaryRequired, storeImage, sensitiveCategories };
