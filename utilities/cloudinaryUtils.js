import { CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary.config';

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * @param {string} imageUri - The local URI of the image to upload.
 * @returns {Promise<string|null>} - The secure URL of the uploaded image, or null if failed.
 */
export const uploadImageToCloudinary = async (imageUri) => {
    if (!imageUri) return null;

    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // Adjust based on your needs or use a library to detect type
        name: 'upload.jpg',
    });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const cloudName = 'YOUR_CLOUD_NAME'; // Hardcoded for fetch URL, or import from config
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const result = await response.json();
        if (result.secure_url) {
            return result.secure_url;
        } else {
            console.error('Cloudinary upload error:', result);
            return null;
        }
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};
