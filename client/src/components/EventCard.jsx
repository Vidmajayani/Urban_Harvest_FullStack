import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../context/AuthContext";

import { getImageUrl } from "../utils/imageUtils";

function EventCard({ item }) {
  const { isAdmin } = useAuth();
  // Database uses 'spots_left', fallback to 'available_spots' for compatibility
  const spotsLeft = item.spots_left !== undefined ? item.spots_left : (item.available_spots || 0);
  const isFullyBooked = spotsLeft === 0;
  const isAlmostFull = !isFullyBooked && spotsLeft < 10;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl fold:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-900 dark:border-gray-100 flex flex-col h-full group overflow-hidden relative ${isFullyBooked ? 'opacity-75' : ''}`}>

      {/* Fully Booked Badge */}
      {isFullyBooked && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          FULLY BOOKED
        </div>
      )}

      {/* Almost Full Badge */}
      {isAlmostFull && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Only {spotsLeft} spots!
        </div>
      )}

      {/* Event Image with overlay */}
      <div className={`relative h-36 fold:h-40 sm:h-48 overflow-hidden ${isFullyBooked ? 'grayscale' : ''}`}>
        {/* Favorite Button */}
        <div className="absolute top-2 left-2 z-20">
          <FavoriteButton itemType="event" itemId={item.event_id} />
        </div>

        <img
          src={getImageUrl(item.image)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Category Badge */}
        <span className="absolute top-2 fold:top-3 sm:top-4 right-2 fold:right-3 sm:right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-ecoOrange dark:text-ecoOrangeLight px-2 fold:px-2.5 sm:px-3 py-0.5 fold:py-1 rounded-full text-[9px] fold:text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-sm">
          {item.category}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-3 fold:p-4 sm:p-5 flex flex-col flex-grow">
        {/* Rating & Price Row */}
        <div className="flex justify-between items-start mb-2 fold:mb-3">
          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 fold:px-2 py-0.5 fold:py-1 rounded-lg">
            <span className="text-yellow-500 text-[10px] fold:text-xs">★</span>
            <span className="font-bold text-gray-700 dark:text-gray-200 text-[10px] fold:text-xs">{item.rating}</span>
          </div>
          <span className="font-bold text-ecoGreen dark:text-ecoLight text-sm fold:text-base sm:text-lg">{item.price}</span>
        </div>

        {/* Event Title */}
        <h3 className="text-sm fold:text-base sm:text-xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-2 fold:mb-3 line-clamp-2 group-hover:text-ecoOrange dark:group-hover:text-ecoOrangeLight transition-colors">
          {item.title}
        </h3>

        {/* Event Metadata */}
        <div className="space-y-1.5 fold:space-y-2 mb-4 fold:mb-6 flex-grow">
          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-1 fold:p-1.5 rounded-lg text-ecoOrange dark:text-ecoOrangeLight min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaCalendarAlt className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className="text-[10px] fold:text-xs sm:text-sm font-medium truncate">{item.date} • {item.time}</span>
          </div>

          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-1 fold:p-1.5 rounded-lg text-ecoOrange dark:text-ecoOrangeLight min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaMapMarkerAlt className="text-[10px] fold:text-xs sm:text-sm" />
            </div>
            <span className="text-[10px] fold:text-xs sm:text-sm font-medium truncate">{item.location}</span>
          </div>

          <div className="flex items-center gap-2 fold:gap-3 text-gray-600 dark:text-gray-300">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-1 fold:p-1.5 rounded-lg text-ecoOrange dark:text-ecoOrangeLight min-w-[24px] fold:min-w-[28px] text-center flex-shrink-0">
              <FaTicketAlt className="text-[10px] fold:text-xs sm:text-sm" />
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
          to={`/events/${item.event_id}`}
          className={`flex items-center justify-center gap-1.5 fold:gap-2 w-full font-bold py-2 fold:py-2.5 sm:py-3 px-3 fold:px-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-md text-[11px] fold:text-sm sm:text-base ${isFullyBooked
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-ecoOrange dark:bg-ecoOrange hover:bg-ecoOrangeDark dark:hover:bg-ecoOrangeDark text-white hover:shadow-lg group-hover:shadow-orange-200 dark:group-hover:shadow-none'
            }`}
        >
          <FaTicketAlt className="text-xs fold:text-sm" />
          <span>{isFullyBooked || isAdmin() ? 'View Details' : 'Book Event'}</span>
          <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 ml-0.5 fold:ml-1 text-xs fold:text-sm" />
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
