import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { eventsAPI, eventReviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BookingForm from "../components/BookingForm";
import LoginPromptModal from "../components/LoginPromptModal";
import ReviewsSection from "../components/ReviewsSection";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaStar, FaCheckCircle, FaInfoCircle, FaArrowLeft, FaSignInAlt } from "react-icons/fa";

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await eventsAPI.getOne(id);
                setEvent(response.data.event);
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    // Fetch reviews
    useEffect(() => {
        if (id) {
            eventReviewsAPI.getReviews(id)
                .then((response) => {
                    setReviews(response.data.reviews);
                    setAverageRating(parseFloat(response.data.averageRating));
                    setTotalReviews(response.data.totalReviews);
                    setReviewsLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching reviews:", err);
                    setReviewsLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 px-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoOrange mx-auto mb-4"></div>
                <p className="text-xl text-gray-600 dark:text-gray-400">Loading event details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 px-4">
                <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Event not found</h1>
                <Link to="/events" className="text-ecoGreen hover:underline mt-4 inline-block">Back to Events</Link>
            </div>
        );
    }

    // Booking Card Component (reused in both layouts)
    const BookingCard = () => (
        <div className="bg-white dark:bg-gray-800 p-4 fold:p-5 sm:p-6 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs fold:text-sm sm:text-base md:text-xl font-bold mb-2 fold:mb-3 sm:mb-4 md:mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1.5 fold:pb-2 sm:pb-3 md:pb-4">Event Details</h3>

            <div className="space-y-3 fold:space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-1 fold:p-1.5 sm:p-2 rounded-lg text-ecoOrange">
                            <FaClock className="text-[10px] fold:text-xs sm:text-sm md:text-base" />
                        </div>
                        <span className="font-medium text-[10px] fold:text-xs sm:text-sm md:text-base">Time</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white text-[10px] fold:text-xs sm:text-sm md:text-base">{event.event_time}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
                        <div className="bg-green-50 dark:bg-green-900/30 p-1 fold:p-1.5 sm:p-2 rounded-lg text-ecoGreen">
                            <FaTicketAlt className="text-[10px] fold:text-xs sm:text-sm md:text-base" />
                        </div>
                        <span className="font-medium text-[10px] fold:text-xs sm:text-sm md:text-base">Price</span>
                    </div>
                    <span className="font-bold text-ecoGreen dark:text-ecoLight text-sm fold:text-base sm:text-lg md:text-xl">
                        {event.price > 0 ? `Rs ${event.price}` : 'Free'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 fold:p-1.5 sm:p-2 rounded-lg text-blue-500">
                            <FaCheckCircle className="text-[10px] fold:text-xs sm:text-sm md:text-base" />
                        </div>
                        <span className="font-medium text-[10px] fold:text-xs sm:text-sm md:text-base">Availability</span>
                    </div>
                    <span className="font-bold text-orange-600 dark:text-orange-400 text-[10px] fold:text-xs sm:text-sm md:text-base">{event.spots_left} Spots Left</span>
                </div>
            </div>

            <div className="mt-4 fold:mt-6 sm:mt-8">
                {isAuthenticated() ? (
                    isAdmin() ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                            <p className="text-blue-700 dark:text-blue-300 text-sm font-bold text-center">
                                🛠️ Administrator Mode: You cannot book events.
                            </p>
                        </div>
                    ) : (
                        <BookingForm
                            title={event.title}
                            type="Event"
                            price={event.price > 0 ? `Rs ${event.price}` : 'Free'}
                            eventId={event.event_id}
                        />
                    )
                ) : (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="w-full bg-ecoOrange hover:bg-orange-600 text-white font-bold py-3 fold:py-4 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm fold:text-base"
                    >
                        <FaSignInAlt />
                        Login to Book This Event
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8 dark:bg-gray-900">
            {/* Back Button */}
            <Link to="/events" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-ecoOrange dark:hover:text-ecoOrangeLight mb-3 fold:mb-4 sm:mb-6 transition-colors group text-sm fold:text-base">
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform text-xs fold:text-sm" />
                Back to Events
            </Link>

            {/* Hero Section */}
            <div className="relative h-[220px] fold:h-[280px] sm:h-[400px] md:h-[500px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg fold:shadow-xl sm:shadow-2xl mb-4 fold:mb-6 sm:mb-10 bg-gray-100 dark:bg-gray-800">
                <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                <div className="absolute bottom-0 left-0 p-3 fold:p-4 sm:p-10 w-full">
                    <div className="flex flex-wrap items-center gap-1.5 fold:gap-2 sm:gap-3 mb-1.5 fold:mb-2 sm:mb-4">
                        <span className="bg-ecoOrange text-white px-2 fold:px-2.5 sm:px-4 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-sm font-bold uppercase tracking-wide shadow-lg">
                            {event.category_name}
                        </span>
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-white border border-white/30">
                            <FaStar className="text-yellow-400 text-[9px] fold:text-[10px] sm:text-sm" />
                            <span className="font-bold text-[9px] fold:text-[10px] sm:text-sm">{event.rating} Rating</span>
                        </div>
                    </div>

                    <h1 className="text-xl fold:text-2xl sm:text-4xl md:text-5xl font-ecoHeading font-bold text-white mb-1 fold:mb-2 leading-tight drop-shadow-lg">
                        {event.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 fold:gap-3 sm:gap-8 text-white/90 text-xs fold:text-sm sm:text-lg font-medium">
                        <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                            <FaCalendarAlt className="text-ecoOrangeLight text-xs fold:text-sm" />
                            <span>{event.event_date}</span>
                        </div>
                        <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                            <FaMapMarkerAlt className="text-ecoOrangeLight text-xs fold:text-sm" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Card - Show below hero for non-logged-in users */}
            {!isAuthenticated() && (
                <div className="mb-4 fold:mb-6 sm:mb-10">
                    <BookingCard />
                </div>
            )}

            <div className={`grid grid-cols-1 ${isAuthenticated() ? 'lg:grid-cols-3' : ''} gap-4 fold:gap-6 sm:gap-10`}>

                {/* Left Column - Main Content */}
                <div className={`${isAuthenticated() ? 'lg:col-span-2' : ''} space-y-4 fold:space-y-6 sm:space-y-10`}>

                    {/* About Section */}
                    <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold mb-2 fold:mb-3 sm:mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <FaInfoCircle className="text-ecoOrange text-sm fold:text-base sm:text-xl" />
                            About This Event
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs fold:text-sm sm:text-lg">
                            {event.detailed_description || event.description}
                        </p>
                    </div>

                    {/* What to Expect Section */}
                    <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-750 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-orange-100 dark:border-gray-700">
                        <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold mb-3 fold:mb-4 sm:mb-6 text-gray-800 dark:text-white">What to Expect</h2>
                        <div className="grid grid-cols-1 gap-2 fold:gap-3 sm:gap-4">
                            {event.what_to_expect && event.what_to_expect.length > 0 ? (
                                event.what_to_expect.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2 fold:gap-3 bg-white dark:bg-gray-700/50 p-2 fold:p-3 sm:p-4 rounded-lg fold:rounded-xl border border-orange-100 dark:border-gray-600 hover:shadow-md transition-shadow">
                                        <FaCheckCircle className="text-ecoOrange text-sm fold:text-base sm:text-xl mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-700 dark:text-gray-200 font-medium text-xs fold:text-sm sm:text-base">{item}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic text-xs fold:text-sm">Details coming soon...</p>
                            )}
                        </div>
                    </div>

                    {/* Highlights Section */}
                    {event.highlights && event.highlights.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold mb-3 fold:mb-4 sm:mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaStar className="text-yellow-400 text-sm fold:text-base sm:text-xl" />
                                Event Highlights
                            </h2>
                            <div className="flex flex-wrap gap-2 fold:gap-3">
                                {event.highlights.map((highlight, index) => (
                                    <span key={index} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 fold:px-3 sm:px-4 py-1 fold:py-1.5 sm:py-2 rounded-full text-[10px] fold:text-xs sm:text-sm font-bold border border-yellow-200 dark:border-yellow-700">
                                        {highlight}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agenda Section */}
                    {event.agenda && event.agenda.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold mb-3 fold:mb-4 sm:mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                                <FaClock className="text-ecoGreen text-sm fold:text-base sm:text-xl" />
                                Agenda
                            </h2>
                            <div className="space-y-2 fold:space-y-3 sm:space-y-4 relative before:absolute before:inset-0 before:ml-3 fold:before:ml-4 sm:before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {event.agenda.map((item, index) => (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-6 h-6 fold:w-8 fold:h-8 sm:w-10 sm:h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-ecoGreen text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <FaCheckCircle className="w-2.5 h-2.5 fold:w-3 fold:h-3 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="w-[calc(100%-2rem)] fold:w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 dark:bg-gray-700/50 p-2 fold:p-2.5 sm:p-4 rounded-lg fold:rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                            <div className="flex flex-col fold:flex-row fold:items-center fold:justify-between gap-0.5 fold:gap-2">
                                                <div className="font-bold text-gray-900 dark:text-white text-[10px] fold:text-xs sm:text-base leading-tight">{item.activity}</div>
                                                <time className="font-medium text-ecoOrange text-[9px] fold:text-xs sm:text-sm whitespace-nowrap">{item.time}</time>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Organizer Section */}
                    {event.organizer_name && (
                        <div className="bg-gradient-to-r from-ecoGreen/10 to-transparent p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl border border-ecoGreen/20 flex items-center gap-3 fold:gap-4 sm:gap-6">
                            {event.organizer_image && (
                                <div className="w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                                    <img src={event.organizer_image} alt={event.organizer_name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] fold:text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-0.5 fold:mb-1">Hosted by</p>
                                <h3 className="text-sm fold:text-base sm:text-xl font-bold text-gray-900 dark:text-white">{event.organizer_name}</h3>
                                {event.organizer_role && (
                                    <p className="text-ecoGreen font-medium text-xs fold:text-sm">{event.organizer_role}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar (Only for logged-in users) */}
                {isAuthenticated() && (
                    <div className="space-y-4 fold:space-y-6 sm:space-y-8">
                        <div className="lg:sticky lg:top-24">
                            <BookingCard />
                        </div>
                    </div>
                )}

            </div>

            {/* Reviews Section */}
            <ReviewsSection
                reviews={reviews}
                loading={reviewsLoading}
                averageRating={averageRating}
                totalReviews={totalReviews}
            />

            {/* Login Prompt Modal */}
            <LoginPromptModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={() => navigate('/login', { state: { from: `/events/${id}` } })}
                message="Please login to book this event"
            />
        </div>
    );
}

export default EventDetails;
