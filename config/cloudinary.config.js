import { Cloudinary } from "cloudinary-react-native";

// Initialize Cloudinary
// Replace these placeholders with your actual Cloudinary credentials
export const cld = new Cloudinary({
    cloud: {
        cloudName: 'YOUR_CLOUD_NAME',
    },
    url: {
        secure: true
    }
});

// For unsigned uploads, you'll also need an Upload Preset
export const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';
