/**
 * Utility to handle image URLs correctly
 * Supports both local fallback paths (/Images/...) and Cloudinary full URLs (http://...)
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/Images/default-placeholder.jpg';

    // If it's already a full URL (Cloudinary or absolute), return it as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // For local paths, we need to decide if we are in production or local
    // On Railway, /Images/... won't work if they are missing, but static ones might
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Only prepend API_URL for paths starting with /Images/ or /uploads/
    if (imagePath.startsWith('/Images/') || imagePath.startsWith('/uploads/')) {
        return `${API_URL}${imagePath}`;
    }

    return imagePath;
};
