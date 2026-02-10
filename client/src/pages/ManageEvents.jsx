import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { FaTrash, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaEdit, FaSearch, FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa';
import AddEventForm from '../components/AddEventForm';
import EditEventForm from '../components/EditEventForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import EventsAdvancedFilter from '../components/EventsAdvancedFilter';

function ManageEvents() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, eventId: null, eventTitle: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Search, Filter, Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dateRange, setDateRange] = useState('all');
    const [availabilityStatus, setAvailabilityStatus] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date, title, price
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

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
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await eventsAPI.getAll();
            setEvents(response.data.events);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(events.map(e => e.category_name))];
        return cats.sort();
    }, [events]);

    // Filtered and sorted events
    const filteredAndSortedEvents = useMemo(() => {
        let filtered = events;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter (multi-select)
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(event => selectedCategories.includes(event.category_name));
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(event => {
                const eventDate = new Date(event.event_date);

                switch (dateRange) {
                    case 'upcoming':
                        return eventDate >= today;
                    case 'past':
                        return eventDate < today;
                    case 'today':
                        return eventDate.toDateString() === today.toDateString();
                    case 'this-week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(today.getDate() + 7);
                        return eventDate >= today && eventDate <= weekEnd;
                    case 'this-month':
                        return eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }

        // Apply availability status filter
        if (availabilityStatus !== 'all') {
            filtered = filtered.filter(event => {
                const bookedPercentage = (event.spots_booked / event.max_participants) * 100;

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
            filtered = filtered.filter(event => {
                const price = parseFloat(event.price);

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
                    comparison = new Date(a.event_date) - new Date(b.event_date);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });


        return sorted;
    }, [events, searchTerm, selectedCategories, dateRange, availabilityStatus, priceRange, sortBy, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEvents = filteredAndSortedEvents.slice(startIndex, endIndex);

    // Calculate display range
    const displayStart = filteredAndSortedEvents.length === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, filteredAndSortedEvents.length);


    const handleDelete = async () => {
        try {
            await eventsAPI.delete(deleteConfirm.eventId);
            setEvents(events.filter(e => e.event_id !== deleteConfirm.eventId));
            setDeleteConfirm({ isOpen: false, eventId: null, eventTitle: '' });
            setNotification({
                show: true,
                message: `Event "${deleteConfirm.eventTitle}" deleted successfully!`,
                type: 'success'
            });
        } catch (err) {
            setNotification({
                show: true,
                message: 'Error deleting event: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleAddSuccess = (eventTitle) => {
        setShowAddForm(false);
        fetchEvents();
        setNotification({
            show: true,
            message: `Event "${eventTitle || 'New Event'}" created successfully!`,
            type: 'success'
        });
    };

    const handleEditSuccess = (eventTitle) => {
        setEditingEvent(null);
        fetchEvents();
        setNotification({
            show: true,
            message: `Event "${eventTitle || 'Event'}" updated successfully!`,
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
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Manage Events</h1>
                    <p className="text-gray-600 dark:text-gray-400">View, add, edit, and delete events</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                    <FaPlus />
                    <span>Add New Event</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Search Events
                </label>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, location or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Filter Button and Results */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Results Count */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-orange-500">{displayStart}</span> to <span className="font-bold text-orange-500">{displayEnd}</span> of <span className="font-bold">{filteredAndSortedEvents.length}</span> events
                </p>

                <EventsAdvancedFilter
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

            {/* Add Event Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Event</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AddEventForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {editingEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Event</h2>
                            <button onClick={() => setEditingEvent(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <EditEventForm eventId={editingEvent.event_id} onSuccess={handleEditSuccess} onCancel={() => setEditingEvent(null)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Events Display - Responsive */}
            {filteredAndSortedEvents.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No events found matching your criteria</p>
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
                                                Event {getSortIcon('title')}
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
                                    {paginatedEvents.map((event) => (
                                        <tr key={event.event_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={event.image} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white">{event.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-sm">
                                                    {event.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-orange-500" />
                                                    <span>{event.event_date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-blue-500" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                Rs {event.price}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold">{event.spots_booked || 0}</span> / {event.total_spots}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/events/${event.event_id}`)}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                        title="View details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingEvent(event)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                        title="Edit event"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ isOpen: true, eventId: event.event_id, eventTitle: event.title })}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                        title="Delete event"
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
                        {paginatedEvents.map((event) => (
                            <div
                                key={event.event_id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Card Header with Image and Title */}
                                <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">
                                            {event.title}
                                        </h3>
                                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs">
                                            {event.category_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body with Details */}
                                <div className="p-4 space-y-3">
                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaCalendarAlt className="text-orange-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{event.event_date}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 truncate">{event.location}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="font-bold text-gray-800 dark:text-white">Rs {event.price}</span>
                                    </div>

                                    {/* Spots */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Spots Booked</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {event.spots_booked || 0} / {event.total_spots}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer with Actions */}
                                <div className="flex items-center justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => navigate(`/admin/events/${event.event_id}`)}
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                        title="View details"
                                    >
                                        <FaEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingEvent(event)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Edit event"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, eventId: event.event_id, eventTitle: event.title })}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete event"
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
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
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
                                            ? 'bg-orange-500 text-white'
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
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
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
                title="Delete Event"
                message={`Are you sure you want to delete "${deleteConfirm.eventTitle}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onClose={() => setDeleteConfirm({ isOpen: false, eventId: null, eventTitle: '' })}
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

export default ManageEvents;
