import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionBoxesAPI } from '../services/api';
import { FaTrash, FaPlus, FaTimes, FaEdit, FaSearch, FaEye, FaBox, FaChevronLeft, FaChevronRight, FaPlusCircle, FaMinusCircle, FaUpload, FaSave } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import ImageUpload from '../components/ImageUpload';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import axios from 'axios';

function ManageSubscriptionBoxes() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBox, setEditingBox] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, boxId: null, boxName: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Search, Filter, Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFrequency, setSelectedFrequency] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

    // Check for ?add=true parameter
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddForm(true);
            searchParams.delete('add');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchBoxes();
    }, []);

    const fetchBoxes = async () => {
        try {
            const response = await subscriptionBoxesAPI.getAll();
            setBoxes(response.data.boxes);
        } catch (err) {
            console.error('Error fetching boxes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtered and sorted boxes
    const filteredAndSortedBoxes = useMemo(() => {
        let filtered = boxes;

        if (searchTerm) {
            filtered = filtered.filter(box =>
                box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                box.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedFrequency !== 'all') {
            filtered = filtered.filter(box => box.frequency === selectedFrequency);
        }

        const sorted = [...filtered].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'price':
                    aValue = parseFloat(a.price);
                    bValue = parseFloat(b.price);
                    break;
                case 'date':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'name':
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [boxes, searchTerm, selectedFrequency, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedBoxes.length / itemsPerPage);
    const paginatedBoxes = filteredAndSortedBoxes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFrequency, sortBy, sortOrder]);

    const handleOpenAddForm = () => {
        setForm({
            name: '',
            description: '',
            price: '',
            frequency: 'weekly',
            image_url: '',
            is_active: true,
            items: [{ item_name: '', quantity: '', description: '' }]
        });
        setImageFile(null);
        setShowAddForm(true);
    };

    const handleOpenEditForm = (box) => {
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
        setEditingBox(box);
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
                imageUrl = await uploadImage(imageFile, 'subscription-boxes', editingBox ? form.image_url : null);
                uploadedNewImage = true;
                uploadedImageUrl = imageUrl;
            }

            const boxData = {
                ...form,
                price: parseFloat(form.price),
                image_url: imageUrl,
                items: validItems
            };

            if (editingBox) {
                await subscriptionBoxesAPI.update(editingBox.box_id, boxData);
                setNotification({ show: true, message: `Subscription box "${form.name}" updated successfully!`, type: 'success' });
            } else {
                await subscriptionBoxesAPI.create(boxData);
                setNotification({ show: true, message: `Subscription box "${form.name}" created successfully!`, type: 'success' });
            }
            setShowAddForm(false);
            setEditingBox(null);
            setImageFile(null);
            fetchBoxes();
        } catch (error) {
            console.error('Error saving subscription box:', error);
            // Cleanup: Delete uploaded image if box creation/update failed
            if (uploadedNewImage && uploadedImageUrl) {
                try {
                    await deleteImage(uploadedImageUrl);
                    console.log('Cleaned up orphan image:', uploadedImageUrl);
                } catch (deleteErr) {
                    console.error('Failed to cleanup image:', deleteErr);
                }
            }
            setNotification({ show: true, message: 'Error saving subscription box: ' + (error.response?.data?.message || error.message), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (boxId, boxName) => {
        try {
            await subscriptionBoxesAPI.delete(boxId);
            setDeleteConfirm({ isOpen: false, boxId: null, boxName: '' });
            fetchBoxes();
            setNotification({ show: true, message: `Subscription box "${boxName}" deleted successfully!`, type: 'success' });
        } catch (error) {
            setNotification({ show: true, message: 'Error deleting subscription box: ' + error.message, type: 'error' });
        }
    };

    const displayStart = filteredAndSortedBoxes.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const displayEnd = Math.min(currentPage * itemsPerPage, filteredAndSortedBoxes.length);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading subscription boxes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subscription Boxes</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage subscription box offerings</p>
                </div>
                <button
                    onClick={handleOpenAddForm}
                    className="flex items-center gap-2 px-6 py-3 bg-ecoGreen hover:bg-green-700 text-white rounded-lg transition font-bold shadow-lg"
                >
                    <FaPlus />
                    Add New Box
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Search Subscription Boxes
                </label>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-ecoGreen">{displayStart}</span> to <span className="font-bold text-ecoGreen">{displayEnd}</span> of <span className="font-bold">{filteredAndSortedBoxes.length}</span> boxes
                </p>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={selectedFrequency}
                        onChange={(e) => setSelectedFrequency(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
                    >
                        <option value="all">All Frequencies</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-ecoGreen focus:ring-2 focus:ring-ecoGreen/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                        <option value="date">Sort by Date</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-ecoGreen bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold transition"
                    >
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                    </button>
                </div>
            </div>

            {/* Table/Cards Display */}
            {filteredAndSortedBoxes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <FaBox className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No subscription boxes found matching your criteria</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Box</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Frequency</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Items</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedBoxes.map((box) => (
                                        <tr key={box.box_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {box.image_url ? (
                                                        <img
                                                            src={box.image_url}
                                                            alt={box.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                            <FaBox className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white">{box.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-xs">
                                                <p className="line-clamp-2 text-sm">{box.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm capitalize">
                                                    {box.frequency}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold">
                                                {box.items?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">
                                                Rs {box.price}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/subscription-boxes/${box.box_id}`)}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                        title="View details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditForm(box)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                        title="Edit box"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ isOpen: true, boxId: box.box_id, boxName: box.name })}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                        title="Delete box"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {paginatedBoxes.map((box) => (
                            <div key={box.box_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
                                {/* Card Header with Image and Title */}
                                <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                    {box.image_url ? (
                                        <img
                                            src={box.image_url}
                                            alt={box.name}
                                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <FaBox className="text-gray-400 text-2xl" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">
                                            {box.name}
                                        </h3>
                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase">
                                            {box.frequency}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body with Details */}
                                <div className="p-4 space-y-3">
                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 min-h-[40px]">
                                        {box.description}
                                    </p>

                                    {/* Items & Price */}
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Included Items</span>
                                        <span className="font-bold text-gray-800 dark:text-white">
                                            {box.items?.length || 0} items
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="font-bold text-ecoGreen text-lg">Rs {box.price}</span>
                                    </div>
                                </div>

                                {/* Card Footer with Actions */}
                                <div className="flex items-center justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => navigate(`/admin/subscription-boxes/${box.box_id}`)}
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                        title="View details"
                                    >
                                        <FaEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEditForm(box)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Edit box"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, boxId: box.box_id, boxName: box.name })}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete box"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-ecoGreen transition"
                            >
                                <FaChevronLeft />
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`px-4 py-2 rounded-lg font-bold transition ${currentPage === index + 1
                                        ? 'bg-ecoGreen text-white'
                                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-ecoGreen text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-ecoGreen transition"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {(showAddForm || editingBox) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Enhanced Gradient Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 px-6 py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FaBox className="text-lg" />
                                        {editingBox ? 'Edit Subscription Box' : 'Add New Subscription Box'}
                                    </h2>
                                    <p className="text-teal-100 text-sm mt-0.5">
                                        {editingBox ? 'Update subscription box details' : 'Create a new subscription box offering'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setShowAddForm(false); setEditingBox(null); }}
                                    className="text-white/80 hover:text-white transition"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                        📋 Basic Information
                                    </h3>

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
                                                placeholder="Enter subscription box name"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all"
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
                                                rows="3"
                                                required
                                                placeholder="Brief description of the subscription box..."
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white resize-none transition-all"
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
                                                    placeholder="0.00"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all"
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
                                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all"
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="bi-weekly">Bi-Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                id="is_active"
                                                checked={form.is_active}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                ✓ Active (visible to customers)
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Standardized Image Upload Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <ImageUpload
                                        label="Box Image"
                                        currentImage={form.image_url}
                                        onImageChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                                        onFileChange={(file) => setImageFile(file)}
                                        type="subscription-boxes"
                                    />
                                </div>

                                {/* Box Items Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                        📦 Box Items
                                    </h3>

                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Items included in this box *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addEmptyItem}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                                        >
                                            <FaPlusCircle className="text-xs" /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {form.items.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        name="item_name"
                                                        placeholder="Item name (e.g., Fresh Tomatoes)"
                                                        value={item.item_name}
                                                        onChange={(e) => handleItemChange(idx, e)}
                                                        className="w-full sm:flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm transition-all"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            name="quantity"
                                                            placeholder="Qty"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(idx, e)}
                                                            className="flex-1 sm:w-24 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="w-fit px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center justify-center"
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
                                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowAddForm(false); setEditingBox(null); }}
                                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all"
                                    >
                                        <FaSave /> {submitting ? 'Saving...' : editingBox ? 'Update Box' : 'Create Box'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, boxId: null, boxName: '' })}
                onConfirm={() => handleDelete(deleteConfirm.boxId, deleteConfirm.boxName)}
                title="Delete Subscription Box"
                message={`Are you sure you want to delete "${deleteConfirm.boxName}"? This action cannot be undone.`}
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

export default ManageSubscriptionBoxes;
