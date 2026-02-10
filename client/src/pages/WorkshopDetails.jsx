import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { workshopsAPI, workshopReviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BookingForm from "../components/BookingForm";
import LoginPromptModal from "../components/LoginPromptModal";
import ReviewsSection from "../components/ReviewsSection";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChalkboardTeacher, FaCheckCircle, FaArrowLeft, FaUserTie, FaInfoCircle, FaSignInAlt } from "react-icons/fa";

function WorkshopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const response = await workshopsAPI.getOne(id);
        setWorkshop(response.data.workshop);
      } catch (err) {
        console.error('Error fetching workshop:', err);
        setError('Failed to load workshop details');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (id) {
      workshopReviewsAPI.getReviews(id)
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoYellow mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading workshop details...</p>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Workshop not found</h1>
        <Link to="/workshops" className="text-ecoGreen hover:underline mt-4 inline-block">Back to Workshops</Link>
      </div>
    );
  }

  // Booking Card Component (reused in both layouts)
  const BookingCard = () => (
    <div className="bg-white dark:bg-gray-800 p-4 fold:p-5 sm:p-6 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-4 fold:mb-6">
        <p className="text-gray-500 dark:text-gray-400 text-[10px] fold:text-xs sm:text-sm uppercase tracking-wide font-bold mb-1">Price per person</p>
        <div className="text-2xl fold:text-3xl sm:text-4xl font-bold text-ecoGreen dark:text-ecoLight mb-2">
          {workshop.price > 0 ? `Rs ${workshop.price}` : 'Free'}
        </div>
        <div className="inline-block bg-statusError/10 dark:bg-statusError/20 text-statusError px-2 fold:px-3 py-0.5 fold:py-1 rounded-full text-[10px] fold:text-xs font-bold animate-pulse">
          Only {workshop.spots_left} spots left!
        </div>
      </div>

      {isAuthenticated() ? (
        isAdmin() ? (
          <div className="bg-statusInfo/10 dark:bg-statusInfo/20 border-2 border-statusInfo/30 p-4 rounded-xl">
            <p className="text-statusInfo text-sm font-bold text-center">
              🛠️ Administrator Mode: You cannot book workshops.
            </p>
          </div>
        ) : (
          <>
            <BookingForm
              title={workshop.title}
              type="Workshop"
              price={workshop.price > 0 ? `Rs ${workshop.price}` : 'Free'}
              workshopId={workshop.workshop_id}
            />

            <div className="mt-3 fold:mt-4 text-center">
              <p className="text-[10px] fold:text-xs text-gray-400 dark:text-gray-500">
                Secure payment • Instant confirmation
              </p>
            </div>
          </>
        )
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="w-full bg-ecoYellow hover:bg-ecoYellowLight text-white font-bold py-3 fold:py-4 px-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm fold:text-base"
        >
          <FaSignInAlt />
          Login to Book This Workshop
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8">
      {/* Back Button */}
      <Link to="/workshops" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-ecoYellow dark:hover:text-ecoYellowLight mb-3 fold:mb-4 sm:mb-6 transition-colors group text-sm fold:text-base">
        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform text-xs fold:text-sm" />
        Back to Workshops
      </Link>

      <div className={`grid grid-cols-1 ${isAuthenticated() ? 'lg:grid-cols-3' : ''} gap-4 fold:gap-6 lg:gap-12`}>
        {/* Main Content Column */}
        <div className={`${isAuthenticated() ? 'lg:col-span-2' : ''} space-y-4 fold:space-y-6 sm:space-y-8`}>

          {/* Hero Section */}
          <div className="relative h-[220px] fold:h-[280px] sm:h-[400px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg fold:shadow-xl sm:shadow-2xl group">
            <img
              src={workshop.image}
              alt={workshop.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 fold:p-4 sm:p-8">
              <div className="flex flex-wrap gap-1.5 fold:gap-2 mb-1.5 fold:mb-2 sm:mb-3">
                <span className="bg-ecoYellow text-white px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                  {workshop.category_name}
                </span>
                {workshop.level && (
                  <span className="bg-white/20 backdrop-blur-md text-white px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-white/30">
                    {workshop.level}
                  </span>
                )}
              </div>
              <h1 className="text-xl fold:text-2xl sm:text-4xl md:text-5xl font-ecoHeading font-bold text-white mb-1 fold:mb-2 sm:mb-4 leading-tight drop-shadow-md">
                {workshop.title}
              </h1>

              {/* Rating Display - Always show to indicate automatic updates */}
              <div className="flex items-center gap-2 mb-2 fold:mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-4 h-4 fold:w-5 fold:h-5 sm:w-6 sm:h-6 ${index < Math.round(workshop.average_rating || 0)
                        ? 'text-ecoYellow'
                        : 'text-white/30'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white text-sm fold:text-base sm:text-lg font-semibold">
                  {workshop.total_reviews > 0
                    ? `${workshop.average_rating.toFixed(1)} (${workshop.total_reviews} ${workshop.total_reviews === 1 ? 'review' : 'reviews'})`
                    : 'No reviews yet'
                  }
                </span>
              </div>

              <p className="text-gray-200 text-xs fold:text-sm sm:text-xl max-w-2xl line-clamp-2 sm:line-clamp-3">
                {workshop.description}
              </p>
            </div>
          </div>

          {/* Booking Card - Show below hero for non-logged-in users */}
          {!isAuthenticated() && (
            <div className="mb-4 fold:mb-6 sm:mb-10">
              <BookingCard />
            </div>
          )}

          {/* Info Cards (Date, Location, Duration) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fold:gap-4">
            {/* Date Card */}
            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 rounded-xl fold:rounded-2xl shadow-md border-l-4 border-ecoYellow flex flex-col items-start justify-center h-full hover:shadow-lg transition-shadow">
              <div className="bg-ecoYellow/10 dark:bg-ecoYellow/20 p-1.5 fold:p-2 rounded-lg mb-1.5 fold:mb-2">
                <FaCalendarAlt className="text-ecoYellow dark:text-ecoYellowLight text-base fold:text-lg sm:text-xl" />
              </div>
              <p className="text-[10px] fold:text-xs sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Date</p>
              <p className="font-bold text-gray-800 dark:text-white text-sm fold:text-base leading-tight">{workshop.workshop_date}</p>
              <p className="text-[10px] fold:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{workshop.workshop_time}</p>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 rounded-xl fold:rounded-2xl shadow-md border-l-4 border-ecoOrange flex flex-col items-start justify-center h-full hover:shadow-lg transition-shadow">
              <div className="bg-ecoOrange/10 dark:bg-ecoOrange/20 p-1.5 fold:p-2 rounded-lg mb-1.5 fold:mb-2">
                <FaMapMarkerAlt className="text-ecoOrange text-base fold:text-lg sm:text-xl" />
              </div>
              <p className="text-[10px] fold:text-xs sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Location</p>
              <p className="font-bold text-gray-800 dark:text-white text-sm fold:text-base leading-tight">{workshop.location}</p>
            </div>

            {/* Duration Card */}
            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 rounded-xl fold:rounded-2xl shadow-md border-l-4 border-ecoGreen flex flex-col items-start justify-center h-full hover:shadow-lg transition-shadow">
              <div className="bg-ecoGreen/10 dark:bg-ecoGreen/20 p-1.5 fold:p-2 rounded-lg mb-1.5 fold:mb-2">
                <FaClock className="text-ecoGreen text-base fold:text-lg sm:text-xl" />
              </div>
              <p className="text-[10px] fold:text-xs sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Duration</p>
              <p className="font-bold text-gray-800 dark:text-white text-sm fold:text-base leading-tight">{workshop.duration || 'TBD'}</p>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-2 fold:mb-3 sm:mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-ecoYellow text-sm fold:text-base sm:text-xl" />
              About This Workshop
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs fold:text-sm sm:text-base">
              {workshop.detailed_description || workshop.description}
            </p>
          </div>

          {/* Instructor Section */}
          {workshop.instructor_name && (
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-600">
              <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-3 fold:mb-4 sm:mb-6 flex items-center gap-2">
                <FaUserTie className="text-statusInfo text-sm fold:text-base sm:text-xl" />
                Meet Your Instructor
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 fold:gap-4 sm:gap-6">
                <div className="w-16 h-16 fold:w-20 fold:h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-600 shadow-md shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {workshop.instructor_image ? (
                    <img
                      src={workshop.instructor_image}
                      alt={workshop.instructor_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide image on error - fallback will show
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Fallback user icon - always rendered, shown/hidden via CSS */}
                  <svg className="w-12 h-12 text-gray-400 absolute" style={{ display: workshop.instructor_image ? 'none' : 'block' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-base fold:text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{workshop.instructor_name}</h3>
                  {workshop.instructor_role && (
                    <p className="text-ecoYellow dark:text-ecoYellowLight font-medium text-xs fold:text-sm sm:text-base mb-1 fold:mb-2">{workshop.instructor_role}</p>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 text-xs fold:text-sm italic">
                    "Passionate about sharing knowledge and empowering others to live sustainably."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {workshop.learning_outcomes && workshop.learning_outcomes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-3 fold:mb-4 sm:mb-6 flex items-center gap-2">
                <FaChalkboardTeacher className="text-ecoGreen text-sm fold:text-base sm:text-xl" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 gap-2 fold:gap-3 sm:gap-4">
                {workshop.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-2 fold:gap-3 p-2 fold:p-3 rounded-lg fold:rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <FaCheckCircle className="text-ecoGreen mt-0.5 fold:mt-1 shrink-0 text-xs fold:text-sm sm:text-base" />
                    <span className="text-gray-700 dark:text-gray-200 text-xs fold:text-sm sm:text-base">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements Section */}
          {workshop.requirements && workshop.requirements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-8 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-base fold:text-lg sm:text-2xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-3 fold:mb-4 sm:mb-6 flex items-center gap-2">
                <FaInfoCircle className="text-ecoOrange text-sm fold:text-base sm:text-xl" />
                Requirements
              </h2>
              <div className="grid grid-cols-1 gap-2 fold:gap-3 sm:gap-4">
                {workshop.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-2 fold:gap-3 p-2 fold:p-3 rounded-lg fold:rounded-xl bg-ecoOrange/10 dark:bg-ecoOrange/20">
                    <div className="w-1.5 h-1.5 fold:w-2 fold:h-2 rounded-full bg-ecoOrange mt-1.5 fold:mt-2 shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-200 text-xs fold:text-sm sm:text-base">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Booking Form (Only for logged-in users) */}
        {isAuthenticated() && (
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4 fold:space-y-6">
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
        onLogin={() => navigate('/login', { state: { from: `/workshops/${id}` } })}
        message="Please login to book this workshop"
      />
    </div>
  );
}

export default WorkshopDetails;
