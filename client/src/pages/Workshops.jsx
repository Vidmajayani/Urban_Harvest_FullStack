import { useState, useEffect } from "react";
import { workshopsAPI } from "../services/api";
import WorkshopCard from "../components/WorkshopCard";
import FilterBar from "../components/FilterBar";
import { FaChalkboardTeacher, FaTools, FaLeaf } from "react-icons/fa";

function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [workshopCategory, setWorkshopCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workshops from API
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const response = await workshopsAPI.getAll();
        const workshopsData = response.data.workshops;

        // Transform data to match WorkshopCard expected format
        const transformedWorkshops = workshopsData.map(workshop => ({
          ...workshop,
          // Format date from workshop_date
          date: new Date(workshop.workshop_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          // Format duration (e.g., "3 hours")
          duration: `${workshop.duration} hours`,
          // Use location field
          location: workshop.location,
          // Use title field
          title: workshop.title,
          // Use category_name as category
          category: workshop.category_name,
          // Format price
          price: workshop.price === 0 ? 'Free' : `Rs ${workshop.price}`,
          // Use instructor data
          instructor: workshop.instructor_name,
          instructor_image: workshop.instructor_image,
          // Use skill_level
          level: workshop.skill_level || 'BEGINNER'
        }));

        setWorkshops(transformedWorkshops);
        setFilteredWorkshops(transformedWorkshops);
      } catch (err) {
        console.error('Error fetching workshops:', err);
        setError('Failed to load workshops');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Filter workshops by category
  useEffect(() => {
    if (workshopCategory === "All") {
      setFilteredWorkshops(workshops);
    } else {
      setFilteredWorkshops(workshops.filter(workshop => workshop.category === workshopCategory));
    }
  }, [workshopCategory, workshops]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading workshops...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-xl text-statusError">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8">

      {/* Hero Section */}
      <div className="relative h-[220px] fold:h-[260px] sm:h-[320px] md:h-[420px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden mb-4 fold:mb-6 sm:mb-12 shadow-lg fold:shadow-xl sm:shadow-2xl group">
        <img
          src="/Images/workshop_hero.png"
          alt="Workshops"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-3 fold:px-4 sm:px-8 md:px-16 max-w-3xl">
          <span className="text-ecoYellow font-bold tracking-wider uppercase text-[10px] fold:text-xs sm:text-sm mb-1 animate-fade-in">
            Learn & Create
          </span>
          <h1 className="text-xl fold:text-2xl sm:text-4xl md:text-6xl font-ecoHeading font-bold text-white mb-1 fold:mb-2 sm:mb-4 leading-tight drop-shadow-lg animate-slide-up">
            Hands-on <span className="text-transparent bg-clip-text bg-gradient-to-r from-ecoYellow to-orange-400">Workshops</span>
          </h1>
          <p className="text-gray-200 text-xs fold:text-sm sm:text-lg md:text-xl font-medium max-w-xl animate-slide-up delay-100">
            Master sustainable skills from expert instructors in gardening, DIY, and eco-living.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fold:gap-4 sm:gap-6 mb-4 fold:mb-6 sm:mb-12">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-2 fold:p-3 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-white/50 dark:border-gray-700 flex flex-col items-center text-center transform hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-ecoYellow/10 dark:bg-ecoYellow/20 p-1 fold:p-1.5 sm:p-3 rounded-full mb-1 fold:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <FaChalkboardTeacher className="text-ecoYellow text-sm fold:text-base sm:text-2xl" />
          </div>
          <h3 className="text-base fold:text-lg sm:text-3xl font-bold text-gray-800 dark:text-white mb-0.5">15+</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs fold:text-sm sm:text-base font-medium">Expert Instructors</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-2 fold:p-3 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-white/50 dark:border-gray-700 flex flex-col items-center text-center transform hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-ecoGreen/10 dark:bg-ecoGreen/20 p-1 fold:p-1.5 sm:p-3 rounded-full mb-1 fold:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <FaLeaf className="text-ecoGreen text-sm fold:text-base sm:text-2xl" />
          </div>
          <h3 className="text-base fold:text-lg sm:text-3xl font-bold text-gray-800 dark:text-white mb-0.5">100%</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs fold:text-sm sm:text-base font-medium">Eco-Friendly</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-2 fold:p-3 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-white/50 dark:border-gray-700 flex flex-col items-center text-center transform hover:-translate-y-1 transition-all duration-300 group">
          <div className="bg-statusInfo/10 dark:bg-statusInfo/20 p-1 fold:p-1.5 sm:p-3 rounded-full mb-1 fold:mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <FaTools className="text-statusInfo text-sm fold:text-base sm:text-2xl" />
          </div>
          <h3 className="text-base fold:text-lg sm:text-3xl font-bold text-gray-800 dark:text-white mb-0.5">50+</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs fold:text-sm sm:text-base font-medium">Skills to Learn</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 fold:mb-6 sm:mb-10">
        <FilterBar
          categories={["All", "Gardening", "DIY", "Sustainability"]}
          activeCategory={workshopCategory}
          onCategoryChange={setWorkshopCategory}
          themeColor="ecoYellow"
        />
      </div>

      {/* Workshops Grid */}
      {filteredWorkshops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 fold:gap-4 sm:gap-8">
          {filteredWorkshops.map((item) => (
            <WorkshopCard key={item.workshop_id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 fold:py-12 sm:py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl fold:rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-3xl fold:text-4xl sm:text-6xl mb-2 fold:mb-4">🛠️</div>
          <h3 className="text-base fold:text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 fold:mb-2 px-4">No workshops found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs fold:text-sm sm:text-base px-4">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}

export default Workshops;