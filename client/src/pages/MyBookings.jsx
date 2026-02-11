import { useState, useEffect } from 'react';
import { bookingsAPI, eventReviewsAPI, workshopReviewsAPI } from '../services/api';
import ReviewModal from '../components/ReviewModal';
import { FaStar, FaCalendar, FaCheckCircle, FaClock, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

function MyBookings({ isWidget = false, filterType = null }) {
    const { isAdmin } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        bookingsAPI.getMyBookings()
            .then(response => {
                console.log('📋 Bookings fetched:', response.data.bookings);
                console.log('🔍 has_reviewed flags:', response.data.bookings.map(b => ({ id: b.booking_id, has_reviewed: b.has_reviewed })));
                let fetchedBookings = response.data.bookings || [];
                if (filterType) {
                    fetchedBookings = fetchedBookings.filter(booking => booking.booking_type === filterType);
                }
                setBookings(fetchedBookings);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
                setLoading(false);
            });
    };

    const handleReviewClick = (booking) => {
        setSelectedBooking(booking);
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            const isEvent = selectedBooking.booking_type === 'event';
            const reviewAPI = isEvent ? eventReviewsAPI : workshopReviewsAPI;

            const reviewPayload = {
                [isEvent ? 'event_id' : 'workshop_id']: isEvent ? selectedBooking.event_id : selectedBooking.workshop_id,
                booking_id: selectedBooking.booking_id,
                rating: reviewData.rating,
                comment: reviewData.comment
            };

            console.log('🔍 Review submission debug:');
            console.log('  - Booking type:', selectedBooking.booking_type);
            console.log('  - Selected booking:', selectedBooking);
            console.log('  - Review payload:', reviewPayload);

            await reviewAPI.create(reviewPayload);

            // Refresh bookings to update has_reviewed flag
            await fetchBookings();

            setShowReviewModal(false);
            showNotification('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            console.error('Error response:', error.response?.data);
            showNotification(error.response?.data?.error || 'Failed to submit review', 'error');
            throw error;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'attended':
                return <FaCheckCircle className="text-statusSuccess" />;
            case 'confirmed':
                return <FaClock className="text-statusInfo" />;
            case 'cancelled':
                return <FaTimes className="text-statusError" />;
            default:
                return <FaCalendar className="text-gray-500" />;
        }
    };

    if (isAdmin()) {
        if (isWidget) return null; // Don't show admin warning in widget mode (parent handles it)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-statusInfo/30">
                    <div className="w-20 h-20 bg-statusInfo/10 dark:bg-statusInfo/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaShieldAlt className="text-4xl text-statusInfo" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Administrator Mode</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        You are currently logged in with administrative privileges. Personal booking management is reserved for customer accounts.
                    </p>
                    <Link
                        to="/admin"
                        className="inline-flex items-center justify-center px-6 py-3 bg-ecoGreen text-white rounded-xl hover:bg-ecoDark transition-all duration-300 font-bold shadow-lg hover:shadow-green-200 dark:hover:shadow-none"
                    >
                        Go to Admin Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`${isWidget ? 'py-12' : 'min-h-screen'} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecoGreen mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    const BookingList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
                <div key={booking.booking_id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {/* Display event or workshop image */}
                        {(booking.event_image || booking.workshop_image) ? (
                            <img
                                src={getImageUrl(booking.event_image || booking.workshop_image)}
                                alt={booking.event_title || booking.workshop_title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    // Hide image on error - fallback will show
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : null}

                        {/* Fallback icon - always rendered, shown/hidden via CSS */}
                        <div className={`absolute inset-0 flex items-center justify-center ${booking.booking_type === 'event' ? 'bg-ecoOrange/10 dark:bg-ecoOrange/20' : 'bg-ecoPurple/10 dark:bg-ecoPurple/20'} pointer-events-none`} style={{ display: (booking.event_image || booking.workshop_image) ? 'none' : 'flex' }}>
                            {booking.booking_type === 'event' ? (
                                <FaCalendar className="text-5xl text-ecoOrange" />
                            ) : (
                                <FaClock className="text-5xl text-ecoPurple" />
                            )}
                        </div>

                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm capitalize">
                            {booking.booking_type}
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-ecoGreen transition-colors">
                                {booking.event_title || booking.workshop_title || `${booking.booking_type} Booking`}
                            </h3>

                            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                {/* Time & Location */}
                                {(booking.event_time || booking.workshop_time) && (
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="font-medium">Time</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{booking.event_time || booking.workshop_time}</span>
                                    </div>
                                )}
                                {(booking.event_location || booking.workshop_location) && (
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="font-medium">Location</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-right">{booking.event_location || booking.workshop_location}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <span className="font-medium">Tickets</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{booking.quantity}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <span className="font-medium">Date</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{new Date(booking.booking_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <span className="font-medium">Total Paid</span>
                                    <span className="font-bold text-ecoGreen dark:text-ecoLight">
                                        {booking.total_amount > 0 ? `Rs ${Number(booking.total_amount || 0).toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>
                                {booking.payment_method && booking.total_amount > 0 && (
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        <span className="font-medium">Payment</span>
                                        <span className="font-bold text-gray-900 dark:text-white capitalize">{booking.payment_method}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Only show review button if NOT already reviewed */}
                        {!Boolean(booking.has_reviewed) && (
                            <button
                                onClick={() => handleReviewClick(booking)}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-ecoGreen hover:text-white dark:hover:bg-ecoGreen dark:hover:text-white transition-all duration-300 font-semibold group-hover:shadow-md"
                            >
                                <FaStar className="text-ecoYellow" />
                                <span>Rate & Review</span>
                            </button>
                        )}

                        {/* Show "Already Reviewed" badge if reviewed */}
                        {Boolean(booking.has_reviewed) && (
                            <div className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-statusSuccess/10 dark:bg-statusSuccess/20 text-statusSuccess rounded-xl border border-statusSuccess/30">
                                <FaStar className="text-statusSuccess" />
                                <span className="font-semibold">Already Reviewed</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    if (isWidget) {
        return (
            <div className="py-4">
                {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                        <FaCalendar className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No {filterType || ''} bookings found</p>
                        <Link to={filterType === 'workshop' ? "/workshops" : "/events"} className="text-ecoGreen hover:underline mt-2 inline-block">Book a {filterType || 'Event'}</Link>
                    </div>
                ) : <BookingList />}

                {showReviewModal && selectedBooking && (
                    <ReviewModal
                        isOpen={showReviewModal}
                        productName={selectedBooking.event_title || selectedBooking.workshop_title || `${selectedBooking.booking_type}`}
                        onClose={() => setShowReviewModal(false)}
                        onSubmit={handleReviewSubmit}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                        <FaCalendar className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No bookings yet</p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">Book an event or workshop to see it here!</p>
                    </div>
                ) : <BookingList />}

                {showReviewModal && selectedBooking && (
                    <ReviewModal
                        isOpen={showReviewModal}
                        productName={selectedBooking.event_title || selectedBooking.workshop_title || `${selectedBooking.booking_type}`}
                        onClose={() => setShowReviewModal(false)}
                        onSubmit={handleReviewSubmit}
                    />
                )}
            </div>
        </div>
    );
}

export default MyBookings;
