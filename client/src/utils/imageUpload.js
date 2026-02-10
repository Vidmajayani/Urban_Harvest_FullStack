/**
 * Image Upload Helper
 * Handles uploading image file to server
 */

export const uploadImage = async (file, type, oldImage = null) => {
    if (!file) return null;

    try {
        const formData = new FormData();
        formData.append('image', file);

        // Build URL with type and oldImage parameters
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let uploadUrl = `${API_URL}/api/upload?type=${type}`;
        if (oldImage && oldImage !== '') {
            uploadUrl += `&oldImage=${encodeURIComponent(oldImage)}`;
        }

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.imageUrl; // Returns: /Images/products/filename.jpg
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

/**
 * Delete Image Helper
 * Deletes an uploaded image from server (used for cleanup when form submission fails)
 */
export const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const deleteUrl = `${API_URL}/api/upload?imageUrl=${encodeURIComponent(imageUrl)}`;

        const response = await fetch(deleteUrl, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Delete failed');
        }

        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};
