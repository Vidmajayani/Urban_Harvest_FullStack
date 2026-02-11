import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workshopsAPI } from '../services/api';
import { FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaDollarSign, FaUsers, FaTimes } from 'react-icons/fa';
import EditWorkshopForm from '../components/EditWorkshopForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import BookingsList from '../components/BookingsList';
import AdminReviewsList from '../components/AdminReviewsList';
import { getImageUrl } from '../utils/imageUtils';

function AdminWorkshopDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workshop, setWorkshop] = useState(null);
    const [bookings, setBookings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchWorkshop();
    }, [id]);

    const fetchWorkshop = async () => {
        try {
            setLoading(true);
            const response = await workshopsAPI.getOne(id);
            setWorkshop(response.data.workshop);

            // Fetch bookings
            try {
                const bookingsResponse = await workshopsAPI.getBookings(id);
                setBookings(bookingsResponse.data);
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        } catch (error) {
            console.error('Error fetching workshop:', error);
            setNotification({
                show: true,
                message: 'Error loading workshop details',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await workshopsAPI.delete(id);
            setNotification({
                show: true,
                message: 'Workshop deleted successfully!',
                type: 'success'
            });
            setTimeout(() => navigate('/admin/workshops'), 1500);
        } catch (error) {
            setNotification({
                show: true,
                message: 'Error deleting workshop: ' + error.message,
                type: 'error'
            });
        }
    };

    const handleEditSuccess = (workshopTitle) => {
        setShowEditForm(false);
        fetchWorkshop(); // Refresh data
        setNotification({
            show: true,
            message: `Workshop "${workshopTitle}" updated successfully!`,
            type: 'success'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading workshop details...</p>
                </div>
            </div>
        );
    }

    if (!workshop) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">Workshop not found</p>
                <button onClick={() => navigate('/admin/workshops')} className="mt-4 text-blue-500 hover:underline">
                    Back to Workshops
                </button>
            </div>
        );
    }

    const spotsLeft = workshop.spots_left || workshop.available_spots || 0;
    const isFullyBooked = spotsLeft === 0;
    const isAlmostFull = !isFullyBooked && spotsLeft < 10;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-up">
                <button
                    onClick={() => navigate('/admin/workshops')}
                    className="flex items-center gap-2 px-0 py-2 sm:px-4 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all hover:-translate-x-1 font-semibold"
                >
                    <FaArrowLeft />
                    <span>Back to Workshops</span>
                </button>
                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        onClick={() => setShowEditForm(true)}
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

            {/* Workshop Details Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Hero Image Section - OPTIMIZED SIZE */}
                <div className="relative h-[250px] fold:h-[280px] sm:h-[350px] overflow-hidden rounded-xl">
                    <img
                        src={getImageUrl(workshop.image)}
                        alt={workshop.title}
                        className={`w-full h-full object-contain bg-gray-100 dark:bg-gray-800 ${isFullyBooked ? 'grayscale' : ''}`}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-500/90 backdrop-blur-md rounded-full shadow-lg">
                            <span className="text-white font-bold text-xs sm:text-sm">{workshop.category_name}</span>
                        </div>
                    </div>

                    {/* Skill Level Badge */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-white/20">
                            <span className="text-white font-bold text-xs sm:text-sm uppercase">{workshop.skill_level || workshop.level}</span>
                        </div>
                    </div>

                    {/* Fully Booked Badge */}
                    {isFullyBooked && (
                        <div className="absolute bottom-20 right-4 sm:right-6 px-3 py-1.5 sm:px-5 sm:py-2 bg-red-600/90 backdrop-blur-md rounded-full shadow-lg animate-pulse">
                            <span className="text-white font-bold text-xs sm:text-sm">FULLY BOOKED</span>
                        </div>
                    )}

                    {/* Workshop Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-2xl">{workshop.title}</h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8">
                    {/* Key Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Date Card */}
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FaCalendarAlt className="text-2xl" />
                                <p className="text-sm font-semibold opacity-90">Date</p>
                            </div>
                            <p className="font-bold text-lg">{workshop.workshop_date}</p>
                            <p className="text-sm opacity-90">{workshop.workshop_time}</p>
                        </div>

                        {/* Duration Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                                <FaClock className="text-2xl text-blue-600 dark:text-blue-400" />
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</p>
                            </div>
                            <p className="font-bold text-blue-700 dark:text-blue-300">{workshop.duration} hours</p>
                        </div>

                        {/* Price Card */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border-2 border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-2 mb-2">
                                <FaDollarSign className="text-2xl text-green-600 dark:text-green-400" />
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price</p>
                            </div>
                            <p className="font-bold text-green-700 dark:text-green-300">
                                {workshop.price === 0 ? 'Free' : `Rs ${workshop.price}`}
                            </p>
                        </div>

                        {/* Availability Card */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2">
                                <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Availability</p>
                            </div>
                            <p className={`font-bold ${isFullyBooked ? 'text-red-600 dark:text-red-400' :
                                isAlmostFull ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-green-600 dark:text-green-400'
                                }`}>
                                {isFullyBooked ? 'No spots available' : `${spotsLeft} spots left`}
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-600 mb-6">
                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-2xl text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                                <p className="font-bold text-gray-800 dark:text-white">{workshop.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-600 mb-6">
                        <div className="flex items-center gap-3">
                            <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                                <p className="font-bold text-gray-800 dark:text-white">
                                    {spotsLeft} of {workshop.total_spots || 0} spots available
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Created Date Card */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">📅</span>
                            <h3 className="font-bold text-gray-800 dark:text-white">Created On</h3>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {workshop.created_at ? new Date(workshop.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}
                        </p>
                    </div>

                    {/* Description Section */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                            Workshop Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{workshop.description}</p>
                    </div>

                    {/* Detailed Description Section */}
                    {workshop.detailed_description && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                Detailed Description
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">{workshop.detailed_description}</p>
                        </div>
                    )}

                    {/* Instructor */}
                    {workshop.instructor_name && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl p-4 sm:p-6 border-2 border-yellow-200 dark:border-yellow-700 mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                Instructor
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                {workshop.instructor_image ? (
                                    <img src={workshop.instructor_image} alt={workshop.instructor_name} className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-md" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center shadow-md">
                                        <FaUser className="text-3xl text-yellow-600 dark:text-yellow-300" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-lg">{workshop.instructor_name}</p>
                                    {workshop.instructor_bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workshop.instructor_bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Outcomes */}
                    {workshop.learning_outcomes && workshop.learning_outcomes.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                What You'll Learn
                            </h3>
                            <ul className="space-y-3">
                                {workshop.learning_outcomes.map((outcome, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                                        <span className="text-green-500 mt-1 text-lg">✓</span>
                                        <span className="text-gray-700 dark:text-gray-200">{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Requirements */}
                    {workshop.requirements && workshop.requirements.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                                Requirements
                            </h3>
                            <ul className="space-y-3">
                                {workshop.requirements.map((requirement, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                                        <span className="text-blue-500 mt-1 text-lg">→</span>
                                        <span className="text-gray-700 dark:text-gray-200">{requirement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookings Section */}
            {bookings && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Bookings ({bookings.total_bookings}) - Total Attendees: {bookings.total_attendees}
                    </h2>
                    <BookingsList
                        bookings={bookings.bookings}
                        totalBookings={bookings.total_bookings}
                        totalAttendees={bookings.total_attendees}
                        type="workshop"
                    />
                </div>
            )}

            {/* Reviews Section */}
            {workshop.reviews && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Reviews ({workshop.total_reviews || 0}){workshop.average_rating > 0 && ` - Average: ${Number(workshop.average_rating).toFixed(1)}⭐`}
                    </h2>
                    <AdminReviewsList
                        reviews={workshop.reviews}
                        averageRating={workshop.average_rating}
                        totalReviews={workshop.total_reviews}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Workshop</h2>
                            <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <EditWorkshopForm workshopId={workshop.workshop_id} onSuccess={handleEditSuccess} onCancel={() => setShowEditForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Workshop"
                message={`Are you sure you want to delete "${workshop.title}"? This action cannot be undone.`}
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

export default AdminWorkshopDetail;
