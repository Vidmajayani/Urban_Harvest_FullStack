import { useState, useEffect } from "react";
import { eventsAPI } from "../services/api";
import EventCard from "../components/EventCard";
import FilterBar from "../components/FilterBar";
import { FaCalendarAlt } from "react-icons/fa";

function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventCategory, setEventCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getAll();
        const eventsData = response.data.events;

        // Transform data to match EventCard expected format
        const transformedEvents = eventsData.map(event => ({
          ...event,
          // Format date and time from event_date (2023-11-15T08:00:00)
          date: new Date(event.event_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          time: new Date(event.event_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          // Use location field directly
          location: event.location,
          // Use title field
          title: event.title,
          // Use category_name as category
          category: event.category_name,
          // Format price (if 0, show "Free", else show "Rs " + price)
          price: event.price === 0 ? 'Free' : `Rs ${event.price}`,
          // Use rating (default to 4.5 if not set)
          rating: event.rating || 4.5,
          // Use spots_left directly from database
          spots_left: event.spots_left || event.available_spots || 0
        }));

        setEvents(transformedEvents);
        setFilteredEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events by category
  useEffect(() => {
    if (eventCategory === "All") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category_name === eventCategory));
    }
  }, [eventCategory, events]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8 dark:bg-gray-900">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative h-[220px] fold:h-[260px] sm:h-[320px] md:h-[420px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg fold:shadow-xl sm:shadow-2xl mb-4 fold:mb-6 sm:mb-12 group">
        <img
          src="/Images/event_community.png"
          alt="Community Events"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center p-3 fold:p-4 sm:p-12 bg-black/40">
          <div className="max-w-2xl text-white drop-shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 fold:gap-3 mb-2 fold:mb-3 sm:mb-4">
              <span className="bg-ecoOrange/90 px-2 fold:px-3 sm:px-4 py-0.5 fold:py-1 rounded-full text-[10px] fold:text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm">Join the Movement</span>
            </div>
            <h1 className="text-xl fold:text-2xl sm:text-4xl md:text-6xl font-ecoHeading font-bold mb-2 fold:mb-4 sm:mb-6 leading-tight text-white">
              Connect, Learn, <br />
              & Grow Together
            </h1>
            <p className="text-xs fold:text-sm sm:text-xl md:text-2xl text-white/90 font-light leading-relaxed">
              Participate in local events that make a real difference in our community
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile Optimized (md: breakpoint to avoid text wrapping) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 fold:gap-4 sm:gap-6 mb-4 fold:mb-6 sm:mb-12">
        {/* Stat Card 1 - Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-ecoOrange/10 dark:bg-ecoOrange/20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-orange-50 dark:bg-orange-900/30 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-ecoOrange dark:text-ecoOrangeLight group-hover:scale-110 transition-transform duration-300">
            <FaCalendarAlt className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">{filteredEvents.length}+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Upcoming Events</p>
          </div>
        </div>

        {/* Stat Card 2 - Community Members */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-500/10 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-green-50 dark:bg-green-900/30 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-green-500 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
            <FaCalendarAlt className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">500+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Active Members</p>
          </div>
        </div>

        {/* Stat Card 3 - Impact Created */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-yellow-100 dark:bg-yellow-500/10 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300">
            <FaCalendarAlt className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">High</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Community Impact</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 fold:mb-6 sm:mb-10">
        <FilterBar
          categories={["All", "Community", "Education", "Volunteering"]}
          activeCategory={eventCategory}
          onCategoryChange={setEventCategory}
          themeColor="ecoOrange"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fold:gap-6 sm:gap-8 mb-8 fold:mb-12">
          {filteredEvents.map((item) => (
            <EventCard key={item.event_id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 fold:py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl fold:rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-4xl fold:text-5xl sm:text-6xl mb-3 fold:mb-4">🎉</div>
          <h3 className="text-base fold:text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 px-4">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm fold:text-base px-4">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}

export default Events;
