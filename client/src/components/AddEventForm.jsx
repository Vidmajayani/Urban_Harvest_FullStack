import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import { API_URL } from '../config/api';

function AddEventForm({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        category_id: '',
        organizer_id: '',
        title: '',
        description: '',
        detailed_description: '',
        event_date: '',
        event_time: '',
        location: '',
        image: '/Images/events/default.jpg',
        price: 0,
        total_spots: 50,
        agenda: [{ time: '', activity: '' }],
        highlights: [''],
        what_to_expect: ['']
    });

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [catRes, orgRes] = await Promise.all([
                fetch(`${API_URL}/api/categories?type=event`).then(r => r.json()),
                fetch(`${API_URL}/api/organizers`).then(r => r.json())
            ]);
            setCategories(catRes.categories || []);
            setOrganizers(orgRes.organizers || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAgendaChange = (index, field, value) => {
        const newAgenda = [...formData.agenda];
        newAgenda[index][field] = value;
        setFormData({ ...formData, agenda: newAgenda });
    };

    const addAgendaItem = () => {
        setFormData({ ...formData, agenda: [...formData.agenda, { time: '', activity: '' }] });
    };

    const removeAgendaItem = (index) => {
        if (formData.agenda.length > 1) {
            setFormData({ ...formData, agenda: formData.agenda.filter((_, i) => i !== index) });
        }
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

        try {
            // Validate date is in the future (not today or past)
            const selectedDate = new Date(formData.event_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day

            if (selectedDate <= today) {
                setError('Event date must be in the future. Today and past dates are not allowed.');
                setLoading(false);
                return;
            }

            let uploadedNewImage = false;
            let uploadedImageUrl = null;

            // Upload image first if file selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'events');
                uploadedNewImage = true;
                uploadedImageUrl = imageUrl;
            }

            const submitData = { ...formData, image: imageUrl };
            await eventsAPI.create(submitData);
            onSuccess?.(formData.title);
        } catch (err) {
            // Cleanup: Delete uploaded image if event creation failed
            if (uploadedNewImage && uploadedImageUrl) {
                try {
                    await deleteImage(uploadedImageUrl);
                    console.log('Cleaned up orphan image:', uploadedImageUrl);
                } catch (deleteErr) {
                    console.error('Failed to cleanup image:', deleteErr);
                }
            }
            setError(err.response?.data?.error || 'Error creating event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-ecoOrange to-ecoOrangeLight dark:from-ecoOrange dark:to-ecoOrangeLight px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaPlus className="text-lg" />
                    Add New Event
                </h2>
                <p className="text-orange-100 text-sm mt-0.5">Create a new community event</p>
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Organizer *</label>
                                <select name="organizer_id" value={formData.organizer_id} onChange={handleChange} required
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all">
                                    <option value="">Select Organizer</option>
                                    {organizers.map(o => <option key={o.organizer_id} value={o.organizer_id}>{o.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                placeholder="Enter event title"
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all" />
                        </div>

                        <ImageUpload
                            currentImage={formData.image}
                            onImageChange={(url) => setFormData({ ...formData, image: url })}
                            onFileChange={(file) => setImageFile(file)}
                            label="Event Image *"
                            type="events"
                        />
                    </div>

                    {/* Description Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Description
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3"
                                placeholder="Brief description of the event..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white resize-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
                            <textarea name="detailed_description" value={formData.detailed_description} onChange={handleChange} rows="4"
                                placeholder="Provide more details about the event..."
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white resize-none transition-all" />
                        </div>
                    </div>

                    {/* Schedule & Pricing Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📅 Schedule & Pricing
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    required
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be a future date (not today)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time *</label>
                                <input type="text" name="event_time" value={formData.event_time} onChange={handleChange} required placeholder="e.g. 08:00 AM"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Event location"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (Rs) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Spots *</label>
                                <input type="number" name="total_spots" value={formData.total_spots} onChange={handleChange} required min="1"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Additional Details Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ✨ Additional Details
                        </h3>

                        {/* Agenda */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Agenda</label>
                                <button type="button" onClick={addAgendaItem} className="flex items-center gap-1 px-3 py-1.5 bg-ecoOrange hover:bg-ecoOrangeLight text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                    <FaPlus className="text-xs" /> Add Item
                                </button>
                            </div>
                            {formData.agenda.map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                    <input type="text" placeholder="Time (e.g. 09:00 AM)" value={item.time} onChange={(e) => handleAgendaChange(i, 'time', e.target.value)}
                                        className="w-full sm:w-1/3 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    <input type="text" placeholder="Activity description" value={item.activity} onChange={(e) => handleAgendaChange(i, 'activity', e.target.value)}
                                        className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    {formData.agenda.length > 1 && (
                                        <button type="button" onClick={() => removeAgendaItem(i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Highlights */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Event Highlights</label>
                                <button type="button" onClick={() => addArrayItem('highlights')} className="flex items-center gap-1 px-3 py-1.5 bg-ecoOrange hover:bg-ecoOrangeLight text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                    <FaPlus className="text-xs" /> Add Highlight
                                </button>
                            </div>
                            {formData.highlights.map((h, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                    <input type="text" placeholder="Enter a highlight" value={h} onChange={(e) => handleArrayChange('highlights', i, e.target.value)}
                                        className="w-full flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    {formData.highlights.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('highlights', i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* What to Expect */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">What to Expect</label>
                                <button type="button" onClick={() => addArrayItem('what_to_expect')} className="flex items-center gap-1 px-3 py-1.5 bg-ecoOrange hover:bg-ecoOrangeLight text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                                    <FaPlus className="text-xs" /> Add Item
                                </button>
                            </div>
                            {formData.what_to_expect.map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-2 pb-4 sm:pb-0 border-b sm:border-0 border-gray-100 dark:border-gray-700 last:border-0">
                                    <input type="text" placeholder="What attendees can expect" value={item} onChange={(e) => handleArrayChange('what_to_expect', i, e.target.value)}
                                        className="w-full flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ecoOrange focus:border-ecoOrange dark:bg-gray-700 dark:text-white text-sm transition-all" />
                                    {formData.what_to_expect.length > 1 && (
                                        <button type="button" onClick={() => removeArrayItem('what_to_expect', i)} className="w-fit self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center">
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
                            className="flex-1 px-6 py-3 bg-ecoOrange hover:bg-ecoOrangeLight text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                            <FaSave /> {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEventForm;

