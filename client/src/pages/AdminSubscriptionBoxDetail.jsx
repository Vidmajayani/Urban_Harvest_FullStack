import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscriptionBoxesAPI } from '../services/api';
import { FaArrowLeft, FaEdit, FaTrash, FaDollarSign, FaBox, FaTimes, FaCalendarAlt, FaStar, FaPlusCircle, FaMinusCircle, FaUpload, FaUsers } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import AdminReviewsList from '../components/AdminReviewsList';
import ImageUpload from '../components/ImageUpload';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import axios from 'axios';

function AdminSubscriptionBoxDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [box, setBox] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Form states
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        frequency: 'weekly',
        image_url: '',
        is_active: true,
        items: [{ item_name: '', quantity: '', description: '' }]
    });

    useEffect(() => {
        fetchBoxDetails();
    }, [id]);

    const fetchBoxDetails = async () => {
        try {
            setLoading(true);
            const response = await subscriptionBoxesAPI.getOne(id);
            setBox(response.data.box);
        } catch (error) {
            console.error('Error fetching box details:', error);
            setNotification({
                show: true,
                message: 'Error loading subscription box details',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditForm = () => {
        setForm({
            name: box.name,
            description: box.description,
            price: box.price,
            frequency: box.frequency,
            image_url: box.image_url || '',
            is_active: box.is_active === 1 || box.is_active === true,
            items: box.items && box.items.length > 0
                ? box.items.map(item => ({
                    item_name: item.item_name,
                    quantity: item.quantity,
                    description: item.description || ''
                }))
                : [{ item_name: '', quantity: '', description: '' }]
        });
        setImageFile(null);
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [name]: value };
        setForm(prev => ({ ...prev, items: newItems }));
    };

    const addEmptyItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { item_name: '', quantity: '', description: '' }]
        }));
    };

    const removeItem = (index) => {
        if (form.items.length === 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, items: newItems }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.description || !form.price || !form.frequency) {
            setNotification({ show: true, message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        const validItems = form.items.filter(item => item.item_name.trim() !== '');
        if (validItems.length === 0) {
            setNotification({ show: true, message: 'At least one item with a name is required', type: 'error' });
            return;
        }

        setSubmitting(true);
        let uploadedNewImage = false;
        let uploadedImageUrl = null;

        try {
            // Upload image first if file selected
            let imageUrl = form.image_url;
            if (imageFile) {
                // Pass current image_url as oldImage to trigger deletion on server if updating
                imageUrl = await uploadImage(imageFile, 'subscription-boxes', box.image_url);
                uploadedNewImage = true;
                uploadedImageUrl = imageUrl;
            }

            const boxData = {
                ...form,
                price: parseFloat(form.price),
                image_url: imageUrl,
                items: validItems
            };

            await subscriptionBoxesAPI.update(id, boxData);
            setNotification({ show: true, message: `Subscription box "${form.name}" updated successfully!`, type: 'success' });
            setShowEditModal(false);
            setImageFile(null);
            fetchBoxDetails(); // Refresh data
        } catch (error) {
            console.error('Error saving subscription box:', error);
            // Cleanup: Delete uploaded image if box update failed
            if (uploadedNewImage && uploadedImageUrl) {
                try {
                    await deleteImage(uploadedImageUrl);
                    console.log('Cleaned up orphan image:', uploadedImageUrl);
                } catch (deleteErr) {
                    console.error('Failed to cleanup image:', deleteErr);
                }
            }
            setNotification({ show: true, message: 'Error updating subscription box: ' + error.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await subscriptionBoxesAPI.delete(id);
            setNotification({
                show: true,
                message: 'Subscription box deleted successfully!',
                type: 'success'
            });
            setTimeout(() => navigate('/admin/subscription-boxes'), 1500);
        } catch (error) {
            setNotification({
                show: true,
                message: 'Error deleting subscription box: ' + error.message,
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading subscription box details...</p>
                </div>
            </div>
        );
    }

    if (!box) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">Subscription box not found</p>
                <button onClick={() => navigate('/admin/subscription-boxes')} className="mt-4 text-blue-500 hover:underline">
                    Back to Subscription Boxes
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-up">
                <button
                    onClick={() => navigate('/admin/subscription-boxes')}
                    className="flex items-center gap-2 px-0 py-2 sm:px-4 text-gray-700 dark:text-gray-300 hover:text-ecoGreen dark:hover:text-ecoGreen transition-all hover:-translate-x-1 font-semibold"
                >
                    <FaArrowLeft />
                    <span>Back to Subscription Boxes</span>
                </button>
                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        onClick={handleOpenEditForm}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-bold shadow-lg text-sm sm:text-base"
                    >
                        <FaEdit />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => setDeleteConfirm({ isOpen: true })}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-bold shadow-lg text-sm sm:text-base"
                    >
                        <FaTrash />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Box Details Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Hero Image Section */}
                <div className="relative h-[250px] fold:h-[280px] sm:h-[350px] overflow-hidden rounded-xl">
                    {box.image_url ? (
                        <img
                            src={box.image_url}
                            alt={box.name}
                            className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <FaBox className="text-8xl text-gray-400 dark:text-gray-600" />
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Frequency Badge */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-ecoGreen/90 backdrop-blur-md rounded-full shadow-lg">
                            <span className="text-white font-bold text-xs sm:text-sm capitalize">{box.frequency}</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <div className={`px-3 py-1.5 sm:px-5 sm:py-2 ${box.is_active ? 'bg-green-500/90' : 'bg-red-500/90'} backdrop-blur-md rounded-full shadow-lg`}>
                            <span className="text-white font-bold text-xs sm:text-sm">{box.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </div>
                    </div>

                    {/* Box Name Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-2xl">{box.name}</h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 space-y-6">
                    {/* Summary Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                        {/* Price Card */}
                        <div className="bg-gradient-to-br from-ecoGreen to-green-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <FaDollarSign className="text-xl opacity-90" />
                                <p className="text-sm font-semibold opacity-90">Price</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black italic">Rs {box.price}</p>
                                <p className="text-xs opacity-80 mt-1 capitalize font-bold">per {box.frequency}</p>
                            </div>
                        </div>

                        {/* Items Count Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700 flex flex-col justify-between transition-all hover:border-blue-400">
                            <div className="flex items-center gap-3 mb-2">
                                <FaBox className="text-xl text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-800 dark:text-white">Box Items</h3>
                            </div>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {box.items?.length || 0} Items
                            </p>
                        </div>

                        {/* Rating Card */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-700 flex flex-col justify-between transition-all hover:border-yellow-400">
                            <div className="flex items-center gap-3 mb-2">
                                <FaStar className="text-xl text-yellow-600 dark:text-yellow-400" />
                                <h3 className="font-bold text-gray-800 dark:text-white">Rating</h3>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                                        {box.rating || 0}
                                    </p>
                                    <span className="text-yellow-500">{'★'.repeat(Math.round(box.rating || 0))}{'☆'.repeat(5 - Math.round(box.rating || 0))}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Based on {box.reviews_count || 0} reviews
                                </p>
                            </div>
                        </div>

                        {/* Created Date Card */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 flex flex-col justify-between transition-all hover:border-gray-400">
                            <div className="flex items-center gap-3 mb-2">
                                <FaCalendarAlt className="text-xl text-gray-600 dark:text-gray-400" />
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Created On</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {box.created_at ? new Date(box.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Description Section */}
                        <div className="lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-full">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-ecoGreen rounded-full"></div>
                                    Description
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                    {box.description}
                                </p>
                            </div>
                        </div>

                        {/* Box Contents Section */}
                        <div className="lg:col-span-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                            {box.items && box.items.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-full">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-ecoGreen rounded-full"></div>
                                        Box Contents
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {box.items.map((item, index) => (
                                            <div key={index} className="flex flex-col fold:flex-row justify-between items-start fold:items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all gap-3 group">
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm sm:text-base group-hover:text-ecoGreen transition-colors">{item.item_name}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="px-4 py-2 bg-ecoGreen/5 dark:bg-ecoGreen/10 text-ecoGreen dark:text-ecoLight rounded-lg text-xs font-black ring-1 ring-ecoGreen/20">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscribers Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <FaUsers className="text-blue-600 dark:text-blue-400" />
                    </div>
                    Active Subscribers ({box.subscribers?.length || 0})
                </h2>
                {box.subscribers && box.subscribers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {box.subscribers.map((subscriber, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm ring-2 ring-blue-500/10">
                                        {subscriber.profile_image ? (
                                            <img
                                                src={subscriber.profile_image}
                                                alt={subscriber.user_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                                {subscriber.user_name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 dark:text-white">{subscriber.user_name || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{subscriber.user_email}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    <p>📅 Subscribed: {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : 'N/A'}</p>
                                    <p className="mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${subscriber.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                            {subscriber.status || 'Active'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <FaUsers className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No subscribers yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Subscribers will appear here once users subscribe to this box</p>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Customer Reviews ({box.total_reviews || 0}){box.average_rating > 0 && ` - Average: ${box.average_rating}⭐`}
                </h2>
                {box.reviews && box.reviews.length > 0 ? (
                    <AdminReviewsList
                        reviews={box.reviews}
                        averageRating={box.average_rating}
                        totalReviews={box.total_reviews || box.reviews.length}
                    />
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <FaStar className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Customer reviews will appear here once subscribers leave feedback</p>
                    </div>
                )}
            </div>


            {/* Edit Modal - SAME AS ManageSubscriptionBoxes */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Subscription Box</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Box Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            required
                                            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Price (Rs) *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={form.price}
                                                onChange={handleInputChange}
                                                required
                                                step="0.01"
                                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Frequency *
                                            </label>
                                            <select
                                                name="frequency"
                                                value={form.frequency}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            >
                                                <option value="weekly">Weekly</option>
                                                <option value="bi-weekly">Bi-Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            id="is_active"
                                            checked={form.is_active}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-ecoGreen rounded focus:ring-ecoGreen"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Active (visible to customers)
                                        </label>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                        <ImageUpload
                                            label="Box Image"
                                            currentImage={form.image_url}
                                            onImageChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                                            onFileChange={(file) => setImageFile(file)}
                                            type="subscription-boxes"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Box Items *
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addEmptyItem}
                                                className="text-ecoGreen hover:text-green-700 font-bold text-sm flex items-center gap-1"
                                            >
                                                <FaPlusCircle /> Add Item
                                            </button>
                                        </div>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {form.items.map((item, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            name="item_name"
                                                            placeholder="Item name"
                                                            value={item.item_name}
                                                            onChange={(e) => handleItemChange(idx, e)}
                                                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                name="quantity"
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(idx, e)}
                                                                className="flex-1 sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(idx)}
                                                                className="w-fit px-3 text-red-500 hover:text-red-700 flex items-center justify-center p-2"
                                                            >
                                                                <FaMinusCircle />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="description"
                                                        placeholder="Description (optional)"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(idx, e)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-ecoGreen hover:bg-green-700 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Saving...' : 'Update Box'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Subscription Box"
                message={`Are you sure you want to delete "${box.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="red"
            />

            {/* Notification */}
            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}
        </div>
    );
}

export default AdminSubscriptionBoxDetail;
