import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { workshopsAPI } from '../services/api';
import { FaTrash, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaEdit, FaSearch, FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa';
import AddWorkshopForm from '../components/AddWorkshopForm';
import EditWorkshopForm from '../components/EditWorkshopForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import WorkshopsAdvancedFilter from '../components/WorkshopsAdvancedFilter';
import { getImageUrl } from '../utils/imageUtils';

function ManageWorkshops() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, workshopId: null, workshopTitle: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Search, Filter, Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dateRange, setDateRange] = useState('all');
    const [availabilityStatus, setAvailabilityStatus] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date, title, price
    const [sortOrder, setSortOrder] = useState('asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Check for ?add=true parameter and auto-open form
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddForm(true);
            // Remove the parameter from URL
            searchParams.delete('add');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const response = await workshopsAPI.getAll();
            setWorkshops(response.data.workshops);
        } catch (err) {
            console.error('Error fetching workshops:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(workshops.map(w => w.category_name))];
        return cats.sort();
    }, [workshops]);

    // Filtered and sorted workshops
    const filteredAndSortedWorkshops = useMemo(() => {
        let filtered = workshops;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(workshop =>
                workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workshop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workshop.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter (multi-select)
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(workshop => selectedCategories.includes(workshop.category_name));
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(workshop => {
                const workshopDate = new Date(workshop.workshop_date);

                switch (dateRange) {
                    case 'upcoming':
                        return workshopDate >= today;
                    case 'past':
                        return workshopDate < today;
                    case 'today':
                        return workshopDate.toDateString() === today.toDateString();
                    case 'this-week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(today.getDate() + 7);
                        return workshopDate >= today && workshopDate <= weekEnd;
                    case 'this-month':
                        return workshopDate.getMonth() === today.getMonth() &&
                            workshopDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }

        // Apply availability status filter
        if (availabilityStatus !== 'all') {
            filtered = filtered.filter(workshop => {
                const bookedPercentage = (workshop.spots_booked / workshop.max_participants) * 100;

                switch (availabilityStatus) {
                    case 'available':
                        return bookedPercentage < 80;
                    case 'almost-full':
                        return bookedPercentage >= 80 && bookedPercentage < 100;
                    case 'fully-booked':
                        return bookedPercentage >= 100;
                    default:
                        return true;
                }
            });
        }

        // Apply price range filter
        if (priceRange !== 'all') {
            filtered = filtered.filter(workshop => {
                const price = parseFloat(workshop.price);

                switch (priceRange) {
                    case 'free':
                        return price === 0;
                    case 'budget':
                        return price > 0 && price < 500;
                    case 'mid-range':
                        return price >= 500 && price <= 1000;
                    case 'premium':
                        return price > 1000;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'price':
                    comparison = parseFloat(a.price) - parseFloat(b.price);
                    break;
                case 'date':
                default:
                    comparison = new Date(a.workshop_date) - new Date(b.workshop_date);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });


        return sorted;
    }, [workshops, searchTerm, selectedCategories, dateRange, availabilityStatus, priceRange, sortBy, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedWorkshops.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedWorkshops = filteredAndSortedWorkshops.slice(startIndex, endIndex);

    // Calculate display range
    const displayStart = filteredAndSortedWorkshops.length === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, filteredAndSortedWorkshops.length);

    const handleDelete = async () => {
        try {
            await workshopsAPI.delete(deleteConfirm.workshopId);
            setWorkshops(workshops.filter(w => w.workshop_id !== deleteConfirm.workshopId));
            setDeleteConfirm({ isOpen: false, workshopId: null, workshopTitle: '' });
            setNotification({
                show: true,
                message: `Workshop "${deleteConfirm.workshopTitle}" deleted successfully!`,
                type: 'success'
            });
        } catch (err) {
            setNotification({
                show: true,
                message: 'Error deleting workshop: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleAddSuccess = (workshopTitle) => {
        setShowAddForm(false);
        fetchWorkshops();
        setNotification({
            show: true,
            message: `Workshop "${workshopTitle || 'New Workshop'}" created successfully!`,
            type: 'success'
        });
    };

    const handleEditSuccess = (workshopTitle) => {
        setEditingWorkshop(null);
        fetchWorkshops();
        setNotification({
            show: true,
            message: `Workshop "${workshopTitle || 'Workshop'}" updated successfully!`,
            type: 'success'
        });
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <FaSort className="opacity-30" />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading workshops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Manage Workshops</h1>
                    <p className="text-gray-600 dark:text-gray-400">View, add, edit, and delete workshops</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                    <FaPlus />
                    <span>Add New Workshop</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Search Workshops
                </label>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, location or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Filter Button and Results */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Results Count */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-yellow-500">{displayStart}</span> to <span className="font-bold text-yellow-500">{displayEnd}</span> of <span className="font-bold">{filteredAndSortedWorkshops.length}</span> workshops
                </p>

                <WorkshopsAdvancedFilter
                    categories={categories}
                    initialFilters={{
                        searchTerm,
                        selectedCategories,
                        dateRange,
                        availabilityStatus,
                        priceRange,
                        sortBy,
                        sortOrder
                    }}
                    onApplyFilters={(filters) => {
                        setSearchTerm(filters.searchTerm);
                        setSelectedCategories(filters.selectedCategories);
                        setDateRange(filters.dateRange);
                        setAvailabilityStatus(filters.availabilityStatus);
                        setPriceRange(filters.priceRange);
                        setSortBy(filters.sortBy);
                        setSortOrder(filters.sortOrder);
                        setCurrentPage(1); // Reset to first page when filters change
                    }}
                />
            </div>

            {/* Add Workshop Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Workshop</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AddWorkshopForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Workshop Modal */}
            {editingWorkshop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Workshop</h2>
                            <button onClick={() => setEditingWorkshop(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <EditWorkshopForm workshopId={editingWorkshop.workshop_id} onSuccess={handleEditSuccess} onCancel={() => setEditingWorkshop(null)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Workshops Display - Responsive */}
            {filteredAndSortedWorkshops.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No workshops found matching your criteria</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            onClick={() => toggleSort('title')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Workshop {getSortIcon('title')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                                        <th
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            onClick={() => toggleSort('date')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Date {getSortIcon('date')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                        <th
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            onClick={() => toggleSort('price')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Price {getSortIcon('price')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Spots Booked</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedWorkshops.map((workshop) => (
                                        <tr key={workshop.workshop_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={getImageUrl(workshop.image)} alt={workshop.title} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white">{workshop.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm">
                                                    {workshop.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-yellow-500" />
                                                    <span>{workshop.workshop_date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-blue-500" />
                                                    <span>{workshop.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                Rs {workshop.price}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold">{workshop.spots_booked || 0}</span> / {workshop.total_spots}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/workshops/${workshop.workshop_id}`)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                                        title="View details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingWorkshop(workshop)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                        title="Edit workshop"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ isOpen: true, workshopId: workshop.workshop_id, workshopTitle: workshop.title })}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                        title="Delete workshop"
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
                        {paginatedWorkshops.map((workshop) => (
                            <div
                                key={workshop.workshop_id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Card Header with Image and Title */}
                                <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                    <img
                                        src={getImageUrl(workshop.image)}
                                        alt={workshop.title}
                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">
                                            {workshop.title}
                                        </h3>
                                        <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs">
                                            {workshop.category_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body with Details */}
                                <div className="p-4 space-y-3">
                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaCalendarAlt className="text-yellow-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{workshop.workshop_date}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 truncate">{workshop.location}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="font-bold text-gray-800 dark:text-white">Rs {workshop.price}</span>
                                    </div>

                                    {/* Spots */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Spots Booked</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {workshop.spots_booked || 0} / {workshop.total_spots}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer with Actions */}
                                <div className="flex items-center justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => navigate(`/admin/workshops/${workshop.workshop_id}`)}
                                        className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                        title="View details"
                                    >
                                        <FaEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingWorkshop(workshop)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Edit workshop"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, workshopId: workshop.workshop_id, workshopTitle: workshop.title })}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete workshop"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination - Shared for both views */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center lg:justify-end gap-2 mt-6">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg transition ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    }`}
                            >
                                ‹
                            </button>

                            {/* Page Numbers */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 rounded-lg transition ${currentPage === pageNum
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg transition ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    }`}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Workshop"
                message={`Are you sure you want to delete "${deleteConfirm.workshopTitle}" ? This action cannot be undone.`}
                onConfirm={handleDelete}
                onClose={() => setDeleteConfirm({ isOpen: false, workshopId: null, workshopTitle: '' })}
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

export default ManageWorkshops;
