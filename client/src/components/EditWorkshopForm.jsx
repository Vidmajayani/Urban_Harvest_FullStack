import { useState, useEffect } from 'react';
import { workshopsAPI } from '../services/api';
import { FaSave, FaTimes, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import { API_URL } from '../config/api';

function EditWorkshopForm({ workshopId, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [workshopId]);

    const fetchData = async () => {
        try {
            const [wsRes, catRes, instRes] = await Promise.all([
                workshopsAPI.getOne(workshopId),
                fetch(`${API_URL}/api/categories?type=workshop`).then(r => r.json()),
                fetch(`${API_URL}/api/instructors`).then(r => r.json())
            ]);

            const ws = wsRes.data.workshop;
            // Format date to YYYY-MM-DD for the HTML date input
            // Robust parsing to handle ISO ('T'), MySQL DateStrings (' '), or clean dates
            const rawDate = ws.workshop_date || '';
            const formattedDate = rawDate ? rawDate.split('T')[0].split(' ')[0] : '';

            setFormData({
                category_id: ws.category_id || '',
                instructor_id: ws.instructor_id || '',
                title: ws.title || '',
                description: ws.description || '',
                detailed_description: ws.detailed_description || '',
                workshop_date: formattedDate,
                workshop_time: ws.workshop_time || '',
                duration: ws.duration || '',
                location: ws.location || '',
                image: ws.image || '',
                price: ws.price || 0,
                total_spots: ws.total_spots || 30,
                spots_left: ws.spots_left || ws.total_spots || 30,
                level: ws.level || 'Beginner',
                rating: ws.rating || 0,
                learning_outcomes: ws.learning_outcomes?.length > 0 ? ws.learning_outcomes : [''],
                requirements: ws.requirements?.length > 0 ? ws.requirements : ['']
            });

            setCategories(catRes.categories || []);
            setInstructors(instRes.instructors || []);
        } catch (err) {
            setError('Error loading workshop data');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length > 1) {
            setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
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
                imageUrl = await uploadImage(imageFile, 'workshops', formData.image);
                uploadedNewImage = true;
                uploadedImageUrl = imageUrl;
            }

            const submitData = { ...formData, image: imageUrl };
            await workshopsAPI.update(workshopId, submitData);
            onSuccess?.(formData.title);
        } catch (err) {
            // Cleanup: Delete uploaded image if workshop update failed
            if (uploadedNewImage && uploadedImageUrl) {
                try {
                    await deleteImage(uploadedImageUrl);
                    console.log('Cleaned up orphan image:', uploadedImageUrl);
                } catch (deleteErr) {
                    console.error('Failed to cleanup image:', deleteErr);
                }
            }
            setError(err.response?.data?.error || 'Error updating workshop');
        } finally {
            setLoading(false);
        }
    };

    if (!formData) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-ecoYellow to-ecoYellowLight dark:from-ecoYellow dark:to-ecoYellowLight px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaEdit className="text-lg" />
                    Edit Workshop
                </h2>
                <p className="text-yellow-100 text-sm mt-0.5">Update workshop information</p>
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructor *</label>
                                <select name="instructor_id" value={formData.instructor_id} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="">Select Instructor</option>
                                    {instructors.map(i => <option key={i.instructor_id} value={i.instructor_id}>{i.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Workshop Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                placeholder="Enter workshop title"
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                        </div>

                        <ImageUpload
                            currentImage={formData.image}
                            onImageChange={(url) => setFormData({ ...formData, image: url })}
                            onFileChange={(file) => setImageFile(file)}
                            label="Workshop Image *"
                            type="workshops"
                        />

                        {/* Read-only Auto-Calculated Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 mt-4">
                            <div>
                                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                    ⭐ Rating (Auto-Calculated)
                                </label>
                                <input
                                    type="text"
                                    value={`${formData.rating} / 5.0`}
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                    title="Rating is automatically calculated from participant reviews. Cannot be manually edited."
                                />
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    🔒 Calculated from reviews
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                    👥 Spots Left (Auto-Updated)
                                </label>
                                <input
                                    type="text"
                                    value={`${formData.spots_left} of ${formData.total_spots} spots`}
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                    title="Spots left decreases automatically when users book this workshop. Cannot be manually edited."
                                />
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    🔒 Updates with bookings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Description
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3"
                                placeholder="Brief description of the workshop..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white resize-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
                            <textarea name="detailed_description" value={formData.detailed_description} onChange={handleChange} rows="4"
                                placeholder="Provide more details about the workshop..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white resize-none transition-all" />
                        </div>
                    </div>

                    {/* Schedule & Details Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📅 Schedule & Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                                <input type="date" name="workshop_date" value={formData.workshop_date} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time *</label>
                                <input type="text" name="workshop_time" value={formData.workshop_time} onChange={handleChange} required placeholder="e.g. 09:00 AM - 12:00 PM"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
                                <input type="text" name="duration" value={formData.duration} onChange={handleChange} required placeholder="2 hours"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Level *</label>
                                <select name="level" value={formData.level} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Workshop location"
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (Rs) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Spots *</label>
                                <input type="number" name="total_spots" value={formData.total_spots} onChange={handleChange} required min="1"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Learning Details Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ✨ Learning Details
                        </h3>

                        {/* Learning Outcomes */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Learning Outcomes</label>
                                <button type="button" onClick={() => addArrayItem('learning_outcomes')} className="flex items-center gap-1 px-3 py-1.5 bg-ecoYellow hover:bg-ecoYellowLight text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                    <FaPlus className="text-xs" /> Add Outcome
                                </button>
                            </div>
                            {formData.learning_outcomes.map((outcome, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                    <input type="text" placeholder="What participants will learn" value={outcome} onChange={(e) => handleArrayChange('learning_outcomes', i, e.target.value)}
                                        className="w-full flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    {formData.learning_outcomes.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('learning_outcomes', i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Requirements */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Requirements</label>
                                <button type="button" onClick={() => addArrayItem('requirements')} className="flex items-center gap-1 px-3 py-1.5 bg-ecoYellow hover:bg-ecoYellowLight text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                    <FaPlus className="text-xs" /> Add Requirement
                                </button>
                            </div>
                            {formData.requirements.map((req, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                    <input type="text" placeholder="What participants need to bring/know" value={req} onChange={(e) => handleArrayChange('requirements', i, e.target.value)}
                                        className="w-full flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoYellow focus:border-ecoYellow dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    {formData.requirements.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('requirements', i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button type="button" onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                            <FaTimes /> Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-6 py-3 bg-ecoYellow hover:bg-ecoYellowLight text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                            <FaSave /> {loading ? 'Updating...' : 'Update Workshop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditWorkshopForm;
