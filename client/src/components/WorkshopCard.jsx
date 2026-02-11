import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaChalkboardTeacher, FaArrowRight, FaClock, FaExclamationTriangle, FaUsers } from "react-icons/fa";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../context/AuthContext";

import { getImageUrl } from "../utils/imageUtils";

function WorkshopCard({ item }) {
  const { isAdmin } = useAuth();
  // Database uses 'spots_left', fallback to 'available_spots' for compatibility
  const spotsLeft = item.spots_left !== undefined ? item.spots_left : (item.available_spots || 0);
  const isFullyBooked = spotsLeft === 0;
  const isAlmostFull = !isFullyBooked && spotsLeft < 10;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl fold:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-900 dark:border-gray-100 flex flex-col h-full group overflow-hidden relative ${isFullyBooked ? 'opacity-75' : ''}`}>

      {/* Fully Booked Badge */}
      {isFullyBooked && (
        <div className="absolute top-12 left-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          FULLY BOOKED
        </div>
      )}

      {/* Almost Full Badge */}
      {isAlmostFull && (
        <div className="absolute top-12 left-2 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Only {spotsLeft} spots!
        </div>
      )}

      {/* Image Section */}
      <div className={`relative h-36 fold:h-40 sm:h-48 overflow-hidden ${isFullyBooked ? 'grayscale' : ''}`}>
        {/* Favorite Button */}
        <div className="absolute top-2 left-2 z-20">
          <FavoriteButton itemType="workshop" itemId={item.workshop_id} />
        </div>

        <img
          src={getImageUrl(item.image)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>

        {/* Category Badge */}
        <span className="absolute top-2 fold:top-3 sm:top-4 right-2 fold:right-3 sm:right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-ecoYellow dark:text-ecoYellowLight px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-sm">
          {item.category}
        </span>

        {/* Level Badge */}
        <span className="absolute top-2 fold:top-3 sm:top-4 left-2 fold:left-3 sm:left-4 bg-black/50 backdrop-blur-md text-white px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-[8px] fold:text-[9px] sm:text-[10px] font-bold uppercase tracking-wide border border-white/20">
          {item.level}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-3 fold:p-4 sm:p-6 flex flex-col flex-grow">
        {/* Instructor & Price */}
        <div className="flex justify-between items-center mb-2 fold:mb-3">
          <div className="flex items-center gap-1.5 fold:gap-2 min-w-0 flex-1 mr-2">
            <div className="w-5 h-5 fold:w-6 fold:h-6 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
              {item.instructor_image ? (
                <img
                  src={getImageUrl(item.instructor_image)}
                  alt={item.instructor}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error - fallback will show
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}

              {/* Fallback user icon - always rendered, shown/hidden via CSS */}
              <svg className="w-3 h-3 text-gray-400 absolute" style={{ display: item.instructor_image ? 'none' : 'block' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[10px] fold:text-xs sm:text-xs text-gray-600 dark:text-gray-300 font-medium truncate">{item.instructor}</span>
          </div>
          <span className="font-bold text-ecoGreen dark:text-ecoLight text-sm fold:text-base sm:text-lg flex-shrink-0">{item.price}</span>
        </div>

        {/* Rating Display - Always show to indicate automatic updates */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-3 h-3 fold:w-3.5 fold:h-3.5 ${index < Math.round(item.average_rating || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
                  }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] fold:text-xs text-gray-600 dark:text-gray-400 font-medium">
            {item.total_reviews > 0
              ? `${item.average_rating.toFixed(1)} (${item.total_reviews})`
              : 'No reviews yet'
            }
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm fold:text-base sm:text-xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-2 fold:mb-3 line-clamp-2 group-hover:text-ecoYellow dark:group-hover:text-ecoYellow transition-colors">
          {item.title}
        </h3>

        {/* Metadata */}
        <div className="space-y-1.5 fold:space-y-2 mb-4 fold:mb-6 flex-grow">
          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-1 fold:p-1.5 rounded-lg text-ecoYellow dark:text-ecoYellow min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaCalendarAlt className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className="text-[10px] fold:text-xs sm:text-sm font-medium truncate">{item.date}</span>
          </div>

          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-1 fold:p-1.5 rounded-lg text-ecoYellow dark:text-ecoYellow min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaClock className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className="text-[10px] fold:text-xs sm:text-sm font-medium truncate">{item.duration}</span>
          </div>

          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-1 fold:p-1.5 rounded-lg text-ecoYellow dark:text-ecoYellow min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaMapMarkerAlt className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className="text-[10px] fold:text-xs sm:text-sm font-medium truncate">{item.location}</span>
          </div>

          {/* Spots Availability */}
          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-1 fold:p-1.5 rounded-lg text-ecoYellow dark:text-ecoYellow min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaUsers className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className={`text-[10px] fold:text-xs sm:text-sm font-medium ${isFullyBooked ? 'text-red-600 dark:text-red-400 font-bold' :
              isAlmostFull ? 'text-yellow-600 dark:text-yellow-400 font-bold' :
                'text-green-600 dark:text-green-400'
              }`}>
              {isFullyBooked ? 'No spots available' : `${spotsLeft} spots left`}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/workshops/${item.workshop_id}`}
          className={`flex items-center justify-center gap-1.5 fold:gap-2 w-full font-bold py-2 fold:py-2.5 sm:py-3 px-3 fold:px-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-md text-[11px] fold:text-sm sm:text-base group ${isFullyBooked
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-gradient-to-r from-ecoYellow to-ecoYellowLight text-white hover:shadow-lg hover:shadow-yellow-200'
            }`}
        >
          <FaChalkboardTeacher className="text-xs fold:text-sm" />
          <span>{isFullyBooked || isAdmin() ? 'View Details' : 'Join Workshop'}</span>
          <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 ml-0.5 fold:ml-1 text-xs fold:text-sm" />
        </Link>
      </div>
    </div>
  );
}

export default WorkshopCard;
