import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageUtils';

export default function ProfileImageUpload({ currentImage, onImageUpdate, userName }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState(false);

    // Update preview when currentImage changes
    useEffect(() => {
        if (currentImage) {
            setPreview(currentImage);
            setImageError(false);
        }
    }, [currentImage]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/jfif'];
        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
            setError('Unsupported format. Please use JPG, PNG, WEBP or AVIF.');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size too large. Max limit is 5MB.');
            return;
        }

        setError('');
        setImageError(false);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('Please login to upload a profile image');
                setPreview(currentImage);
                setUploading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(
                `${API_URL}/api/upload/profile-image`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                onImageUpdate(response.data.imageUrl);
                setError('');

                // Update sessionStorage with new profile image
                const savedUser = sessionStorage.getItem('user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    userData.profile_image = response.data.imageUrl;
                    sessionStorage.setItem('user', JSON.stringify(userData));
                }
            }
        } catch (error) {
            console.error('❌ Upload failed:', error);
            setError(error.response?.data?.error || 'Failed to upload image. Please check your file format.');
            setPreview(currentImage);
        } finally {
            setUploading(false);
        }
    };

    // Get initials from userName
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative bg-gray-200 dark:bg-gray-700 mx-auto">
                    {preview && !imageError ? (
                        <img
                            src={getImageUrl(preview)}
                            alt="Profile"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ecoGreen to-emerald-600 text-white">
                            <span className="text-4xl font-black tracking-tighter">
                                {getInitials(userName)}
                            </span>
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <FaCamera className="text-white text-3xl drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform" />
                    </div>

                    {/* Uploading State Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
                            <FaSpinner className="animate-spin text-white text-3xl" />
                        </div>
                    )}
                </div>

                <label className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 text-ecoGreen p-3 rounded-full cursor-pointer hover:bg-ecoGreen hover:text-white transition-all shadow-lg border-2 border-gray-100 dark:border-gray-700 z-10 group-hover:scale-110 active:scale-95">
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploading}
                    />
                    <FaCamera className="w-4 h-4" />
                </label>
            </div>

            <div className="text-center space-y-2">
                {uploading && (
                    <p className="text-xs font-bold text-ecoGreen animate-pulse uppercase tracking-widest">Uploading...</p>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-red-100 dark:border-red-900/30 max-w-[200px]">
                        {error}
                    </div>
                )}

                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest max-w-[150px] leading-relaxed mx-auto">
                    Max 5MB • JPG, PNG, WEBP
                </p>
            </div>
        </div>
    );
}
