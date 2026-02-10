import { useState, useEffect } from 'react';
import { subscriptionBoxesAPI } from '../services/api';
import { FaBox, FaStar, FaLeaf, FaTruck } from 'react-icons/fa';
import SubscriptionBoxCard from '../components/SubscriptionBoxCard';
import FilterBar from '../components/FilterBar';

function SubscriptionBoxes() {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, weekly, biweekly, monthly

    useEffect(() => {
        fetchBoxes();
    }, []);

    const fetchBoxes = async () => {
        try {
            const response = await subscriptionBoxesAPI.getAll();
            setBoxes(response.data.boxes || []);
        } catch (error) {
            console.error('Error fetching subscription boxes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBoxes = filter === 'all'
        ? boxes
        : boxes.filter(box => box.frequency === filter);

    if (loading) {
        return (
            <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-ecoDark dark:text-gray-300 font-medium animate-pulse text-lg">Preparing your boxes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section - Professional & Organized */}
            <div className="relative h-[200px] fold:h-[240px] sm:h-[320px] md:h-[400px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg fold:shadow-xl sm:shadow-2xl mb-4 fold:mb-6 sm:mb-12 group bg-ecoPurple/10">
                <img
                    src="/Images/sub-hero.png"
                    alt="Garden Fresh Subscription"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 flex items-center justify-center p-3 fold:px-4 sm:p-12 bg-black/40">
                    <div className="max-w-2xl text-white drop-shadow-lg text-center">
                        <div className="flex items-center justify-center gap-2 fold:gap-3 mb-2 fold:mb-3 sm:mb-4">
                            <span className="bg-ecoGreen px-2 fold:px-3 sm:px-4 py-0.5 fold:py-1 rounded-full text-[10px] fold:text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm">Flexible Plans</span>
                        </div>
                        <h1 className="text-xl fold:text-3xl sm:text-4xl md:text-6xl font-ecoHeading font-bold mb-2 fold:mb-4 sm:mb-6 leading-tight text-white px-2">
                            Freshness <br />
                            <span className="text-ecoLight">Tailored to You</span>
                        </h1>
                        <p className="text-[10px] fold:text-sm sm:text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-sm fold:max-w-md mx-auto">
                            Organic produce from our community garden to your kitchen table
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section - Matching Products/Events */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 fold:gap-4 sm:gap-6 mb-4 fold:mb-6 sm:mb-10">
                <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-4 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="bg-ecoPurple/10 dark:bg-ecoPurple/20 p-2 fold:p-3 rounded-lg fold:rounded-xl text-ecoPurple group-hover:scale-110 transition-transform">
                        <FaBox className="text-base fold:text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg fold:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-0">{boxes.length}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-xs">Active Box Plans</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-4 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="bg-ecoGreen/10 dark:bg-ecoGreen/20 p-2 fold:p-3 rounded-lg fold:rounded-xl text-ecoGreen group-hover:scale-110 transition-transform">
                        <FaLeaf className="text-base fold:text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg fold:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-0">100%</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-xs">Organic & Local</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-4 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="bg-ecoOrange/10 dark:bg-ecoOrange/20 p-2 fold:p-3 rounded-lg fold:rounded-xl text-ecoOrange group-hover:scale-110 transition-transform">
                        <FaTruck className="text-base fold:text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg fold:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-0">Free</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-xs">Eco-Friendly Shipping</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar - Standardized like Workshops */}
            <div className="mb-4 fold:mb-6 sm:mb-10">
                <FilterBar
                    categories={["All", "Weekly", "Bi-weekly", "Monthly"]}
                    activeCategory={filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    onCategoryChange={(cat) => setFilter(cat === 'All' ? 'all' : cat.toLowerCase())}
                    themeColor="ecoPurple"
                />
            </div>

            {/* Boxes Grid - 2 columns for 730px (sm breakpoint) */}
            {filteredBoxes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 fold:gap-6 sm:gap-8 mb-8 fold:mb-12">
                    {filteredBoxes.map((box) => (
                        <SubscriptionBoxCard key={box.box_id} item={box} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 fold:py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl fold:rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-4xl fold:text-5xl sm:text-6xl mb-3 fold:mb-4">📦</div>
                    <h3 className="text-base fold:text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 px-4">No boxes found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm fold:text-base px-4">Try adjusting your filters to find the perfect plan.</p>
                </div>
            )}
        </div>
    );
}

export default SubscriptionBoxes;
