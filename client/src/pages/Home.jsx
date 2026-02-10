import SectionHeader from "../components/SectionHeader";
import { useAppContext } from "../context/AppContext";
import HeroSection from "../components/HeroSection";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import EventCard from "../components/EventCard";
import WorkshopCard from "../components/WorkshopCard";
import SubscriptionBoxCard from "../components/SubscriptionBoxCard";
import { FaSun, FaWind, FaThermometerHalf } from "react-icons/fa";
import TestimonialsSection from "../components/TestimonialsSection";
import HowItWorksSection from "../components/HowItWorksSection";

function Home() {
  const { weather, products, events, workshops, subscriptionBoxes, loadingData } = useAppContext();

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-ecoDark dark:text-gray-300 font-medium animate-pulse text-lg">Cultivating your experience...</p>
      </div>
    );
  }

  return (
    <div className="px-2 fold:px-3 sm:px-0 py-3 fold:py-4 sm:py-6 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection />

      {/* Weather Section - External API Integration */}
      <section className="section-padding">
        <div className="bg-gradient-to-r from-orange-200 to-amber-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl fold:rounded-3xl p-3 fold:p-4 sm:p-6 md:p-8 text-gray-800 dark:text-white shadow-lg fold:shadow-xl dark:shadow-2xl dark:shadow-gray-900/50 flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-orange-100/30 dark:border-gray-700">

          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 fold:w-48 fold:h-48 sm:w-64 sm:h-64 bg-white/20 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 fold:w-24 fold:h-24 sm:w-32 sm:h-32 bg-white/20 dark:bg-purple-500/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

          <div className="relative z-10 mb-4 fold:mb-6 md:mb-0">
            <h3 className="text-base fold:text-lg sm:text-xl md:text-2xl lg:text-3xl font-ecoHeading font-bold mb-1 fold:mb-2 flex items-center gap-1.5 fold:gap-2 sm:gap-3 text-gray-800 dark:text-white">
              <FaSun className="text-orange-600 dark:text-yellow-400 animate-pulse text-sm fold:text-base sm:text-lg md:text-xl lg:text-2xl" />
              Current Weather, Sri Lanka
            </h3>
            <p className="text-gray-700 dark:text-gray-400 text-xs fold:text-sm sm:text-base md:text-lg">Perfect conditions for your outdoor activities</p>
          </div>

          {weather ? (
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 fold:gap-4 sm:gap-6 md:gap-8 bg-white/40 dark:bg-gray-800/50 backdrop-blur-md p-3 fold:p-4 sm:p-5 md:p-6 rounded-xl fold:rounded-2xl border border-white/50 dark:border-gray-700">
              <div className="flex items-center gap-2 fold:gap-3 sm:gap-4">
                <div className="bg-white/50 dark:bg-blue-500/20 p-1.5 fold:p-2 sm:p-3 rounded-full">
                  <FaThermometerHalf className="text-xl fold:text-2xl sm:text-3xl text-orange-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] fold:text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">Temperature</p>
                  <p className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{weather.temperature}°C</p>
                </div>
              </div>

              <div className="hidden sm:block w-px bg-gray-300 dark:bg-gray-700"></div>

              <div className="flex items-center gap-2 fold:gap-3 sm:gap-4">
                <div className="bg-white/50 dark:bg-purple-500/20 p-1.5 fold:p-2 sm:p-3 rounded-full">
                  <FaWind className="text-xl fold:text-2xl sm:text-3xl text-amber-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] fold:text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">Wind Speed</p>
                  <p className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{weather.windspeed} <span className="text-xs fold:text-sm sm:text-base md:text-lg font-normal">km/h</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 fold:gap-3 text-gray-700 dark:text-gray-400">
              <div className="animate-spin h-4 w-4 fold:h-5 fold:w-5 border-2 border-gray-700 dark:border-gray-500 border-t-transparent rounded-full"></div>
              <p className="text-xs fold:text-sm sm:text-base">Loading weather information...</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Grid */}
      <div className="dark:bg-gray-900 pb-6 sm:pb-8 md:pb-12">
        <CategoryGrid />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Featured Products Section */}
      <section className="section-padding dark:bg-gray-900">
        <SectionHeader prefix="Featured" highlight="Products" color="green" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 fold:gap-6">
          {products.slice(0, 3).map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Upcoming Events Section */}
      <section className="section-padding dark:bg-gray-900">
        <SectionHeader prefix="Upcoming" highlight="Events" color="orange" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 fold:gap-6">
          {events.slice(0, 3).map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Featured Workshops Section */}
      <section className="section-padding mb-8 fold:mb-10 sm:mb-12 dark:bg-gray-900">
        <SectionHeader prefix="Featured" highlight="Workshops" color="yellow" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 fold:gap-6">
          {workshops.slice(0, 3).map((item) => (
            <WorkshopCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Subscription Boxes Section */}
      <section className="section-padding dark:bg-gray-900">
        <SectionHeader prefix="Popular" highlight="Subscription Boxes" color="purple" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 fold:gap-6">
          {subscriptionBoxes.slice(0, 3).map((item) => (
            <SubscriptionBoxCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Video Section - Local Video for PWA Support */}
      <section className="section-padding mb-8 fold:mb-10 sm:mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl fold:rounded-2xl sm:rounded-3xl shadow-lg fold:shadow-xl overflow-hidden border-2 fold:border-3 sm:border-4 border-white dark:border-gray-700">
          <div className="aspect-w-16 aspect-h-9 w-full h-[180px] fold:h-[220px] sm:h-[320px] md:h-[480px] lg:h-[600px]">
            <video
              className="w-full h-full object-cover"
              src="/videos/urban_farming_home.mp4"
              poster="/Images/video_poster_home.webp"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-3 fold:p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm fold:text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-1.5 sm:mb-2">See Our Vision in Action</h3>
            <p className="text-gray-600 dark:text-gray-400 text-[10px] fold:text-xs sm:text-sm md:text-base">Discover how urban farming is transforming cities around the world.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
