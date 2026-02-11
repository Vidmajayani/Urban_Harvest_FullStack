import { useState, useEffect } from 'react';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageUtils';

function ImageUpload({ currentImage, onImageChange, onFileChange, label = "Image", type = "products" }) {
    const [preview, setPreview] = useState(currentImage || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    // Update preview when currentImage changes (for Edit forms)
    useEffect(() => {
        setPreview(currentImage || '');
    }, [currentImage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB');
                return;
            }

            setSelectedFile(file);
            setError('');
            onFileChange(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview('');
        setSelectedFile(null);
        onFileChange(null);
        onImageChange('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">{label}</label>

            {/* Preview */}
            {preview && (
                <div className="relative inline-block">
                    <img
                        src={getImageUrl(preview)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition">
                    <FaUpload />
                    <span>
                        {(preview && !preview.includes('default.jpg') && !preview.startsWith('data:'))
                            ? 'Change Image'
                            : 'Upload Image'
                        }
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {!preview && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FaImage className="mr-2" />
                        Max 5MB (JPG, PNG, WEBP, AVIF, JFIF)
                    </div>
                )}
            </div>

            {/* Read-only Image Path Display */}
            {preview && !preview.startsWith('data:') && (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Current Image Path (Read-Only)
                    </label>
                    <input
                        type="text"
                        value={preview}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        title="Image path cannot be manually edited. Use the upload button to change the image."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        🔒 This field is read-only for security. Use "Upload Image" button to change.
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Info message */}
            {selectedFile && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    ✓ Image selected. Will upload when you save the form.
                </p>
            )}
        </div>
    );
}

export default ImageUpload;
