const { Readable } = require('stream');
const { v2: cloudinary } = require('cloudinary');

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

const uploadToCloudinary = (file, folder = 'retroova/items') => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(file.buffer).pipe(uploadStream);
});

const storeImage = async (file) => {
    if (!file) return null;
    if (cloudinaryConfigured) {
        const result = await uploadToCloudinary(file);
        return { filename: result.public_id, url: result.secure_url };
    }
    if (cloudinaryRequired) {
        const error = new Error('Cloudinary is not configured for production uploads.');
        error.code = 'CLOUDINARY_NOT_CONFIGURED';
        throw error;
    }
    return { filename: file.filename, url: `/uploads/${file.filename}` };
};

module.exports = { cloudinaryConfigured, cloudinaryRequired, storeImage };
