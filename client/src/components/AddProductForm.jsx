import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import { API_URL } from '../config/api';

function AddProductForm({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null); // Store selected image file

    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        price: 0,
        unit: 'kg',
        image: '/Images/products/default.jpg',
        description: '',
        stock_quantity: 100,
        origin: '',
        details: [{ key: '', value: '' }]
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories?type=product`).then(r => r.json());
            setCategories(res.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData({ ...formData, details: newDetails });
    };

    const addDetail = () => {
        setFormData({ ...formData, details: [...formData.details, { key: '', value: '' }] });
    };

    const removeDetail = (index) => {
        if (formData.details.length > 1) {
            setFormData({ ...formData, details: formData.details.filter((_, i) => i !== index) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let uploadedNewImage = false;
        let uploadedImageUrl = null;

        try {
            // Upload image first if file selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'products');
                uploadedNewImage = true;
                uploadedImageUrl = imageUrl;
            }

            // Convert details array to object
            const detailsObj = {};
            formData.details.forEach(d => {
                if (d.key && d.value) {
                    detailsObj[d.key] = d.value;
                }
            });

            const submitData = { ...formData, image: imageUrl, details: detailsObj };
            await productsAPI.create(submitData);
            onSuccess?.(formData.name);
        } catch (err) {
            // Cleanup: Delete uploaded image if product creation failed
            if (uploadedNewImage && uploadedImageUrl) {
                try {
                    await deleteImage(uploadedImageUrl);
                    console.log('Cleaned up orphan image:', uploadedImageUrl);
                } catch (deleteErr) {
                    console.error('Failed to cleanup image:', deleteErr);
                }
            }
            setError(err.response?.data?.error || 'Error creating product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-ecoGreen to-ecoLight dark:from-ecoGreen dark:to-ecoLight px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaPlus className="text-lg" />
                    Add New Product
                </h2>
                <p className="text-green-100 text-sm mt-0.5">Create a new product listing</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl text-red-700 dark:text-red-400 flex items-start gap-3">
                        <span className="text-red-500 text-xl">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📋 Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                    placeholder="Enter product name"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3"
                                placeholder="Brief description of the product..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white resize-none transition-all" />
                        </div>

                        <ImageUpload
                            currentImage={formData.image}
                            onImageChange={(url) => setFormData({ ...formData, image: url })}
                            onFileChange={(file) => setImageFile(file)}
                            label="Product Image *"
                            type="products"
                        />
                    </div>

                    {/* Pricing & Stock Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            💰 Pricing & Stock
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (Rs) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unit *</label>
                                <input type="text" name="unit" value={formData.unit} onChange={handleChange} required placeholder="kg, piece, bunch"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Quantity *</label>
                                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required min="0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Origin</label>
                                <input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="Sri Lanka"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ✨ Product Details
                        </h3>

                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Details</label>
                            <button type="button" onClick={addDetail} className="flex items-center gap-1 px-3 py-1.5 bg-ecoGreen hover:bg-ecoDark text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                <FaPlus className="text-xs" /> Add Detail
                            </button>
                        </div>
                        {formData.details.map((detail, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                <input type="text" placeholder="Key (e.g., Shelf Life)" value={detail.key} onChange={(e) => handleDetailChange(i, 'key', e.target.value)}
                                    className="w-full sm:w-1/3 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                <input type="text" placeholder="Value (e.g., 7 days)" value={detail.value} onChange={(e) => handleDetailChange(i, 'value', e.target.value)}
                                    className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoGreen focus:border-ecoGreen dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                {formData.details.length > 1 && (
                                    <button type="button" onClick={() => removeDetail(i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
                                        <FaTrash className="text-xs" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button type="button" onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                            <FaTimes /> Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-6 py-3 bg-ecoGreen hover:bg-ecoDark text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                            <FaSave /> {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductForm;
