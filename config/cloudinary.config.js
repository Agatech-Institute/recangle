import { Cloudinary } from "cloudinary-react-native";

// Initialize Cloudinary
// Replace these placeholders with your actual Cloudinary credentials
export const cld = new Cloudinary({
    cloud: {
        cloudName: "dc2wu6xw9",
    },
    url: {
        secure: true
    }
});

// For unsigned uploads, you'll also need an Upload Preset
export const CLOUDINARY_UPLOAD_PRESET = "ANGLEAPP";
