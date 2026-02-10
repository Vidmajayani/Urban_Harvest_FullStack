import { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

function WorkshopsAdvancedFilter({
    categories,
    onApplyFilters,
    initialFilters = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: initialFilters.searchTerm || '',
        selectedCategories: initialFilters.selectedCategories || [],
        dateRange: initialFilters.dateRange || 'all',
        availabilityStatus: initialFilters.availabilityStatus || 'all',
        priceRange: initialFilters.priceRange || 'all',
        sortBy: initialFilters.sortBy || 'date',
        sortOrder: initialFilters.sortOrder || 'asc'
    });

    const handleCategoryToggle = (category) => {
        setFilters(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(category)
                ? prev.selectedCategories.filter(c => c !== category)
                : [...prev.selectedCategories, category]
        }));
    };

    const handleClearAll = () => {
        const clearedFilters = {
            searchTerm: '',
            selectedCategories: [],
            dateRange: 'all',
            availabilityStatus: 'all',
            priceRange: 'all',
            sortBy: 'date',
            sortOrder: 'asc'
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
    };

    const handleApply = () => {
        onApplyFilters(filters);
        setIsOpen(false);
    };

    const activeFiltersCount =
        filters.selectedCategories.length +
        (filters.dateRange !== 'all' ? 1 : 0) +
        (filters.availabilityStatus !== 'all' ? 1 : 0) +
        (filters.priceRange !== 'all' ? 1 : 0);

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-semibold shadow-lg"
            >
                <FaFilter />
                <span>Filter options</span>
                {activeFiltersCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white text-yellow-600 rounded-full text-xs font-bold">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-yellow-500">
                            <div className="flex items-center gap-3">
                                <FaFilter className="text-white text-xl" />
                                <h2 className="text-xl font-bold text-white">Filter Workshops</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-yellow-600 p-2 rounded-lg transition"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Categories */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => handleCategoryToggle(category)}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.selectedCategories.includes(category)
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { value: 'all', label: 'All Workshops' },
                                        { value: 'upcoming', label: 'Upcoming' },
                                        { value: 'past', label: 'Past' },
                                        { value: 'today', label: 'Today' },
                                        { value: 'this-week', label: 'This Week' },
                                        { value: 'this-month', label: 'This Month' }
                                    ].map(range => (
                                        <button
                                            key={range.value}
                                            onClick={() => setFilters({ ...filters, dateRange: range.value })}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.dateRange === range.value
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Availability Status
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { value: 'all', label: 'All Workshops' },
                                        { value: 'available', label: 'Available Spots' },
                                        { value: 'almost-full', label: 'Almost Full' },
                                        { value: 'fully-booked', label: 'Fully Booked' }
                                    ].map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => setFilters({ ...filters, availabilityStatus: status.value })}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.availabilityStatus === status.value
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Price Range
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { value: 'all', label: 'All Prices' },
                                        { value: 'free', label: 'Free' },
                                        { value: 'budget', label: 'Budget (<Rs 500)' },
                                        { value: 'mid-range', label: 'Mid-range (Rs 500-1000)' },
                                        { value: 'premium', label: 'Premium (>Rs 1000)' }
                                    ].map(range => (
                                        <button
                                            key={range.value}
                                            onClick={() => setFilters({ ...filters, priceRange: range.value })}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.priceRange === range.value
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Sort By
                                </label>
                                <select
                                    value={`${filters.sortBy}-${filters.sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setFilters({ ...filters, sortBy: field, sortOrder: order });
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                >
                                    <option value="date-asc">Date (Earliest First)</option>
                                    <option value="date-desc">Date (Latest First)</option>
                                    <option value="title-asc">Title (A-Z)</option>
                                    <option value="title-desc">Title (Z-A)</option>
                                    <option value="price-asc">Price (Low to High)</option>
                                    <option value="price-desc">Price (High to Low)</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <button
                                onClick={handleClearAll}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition shadow-lg"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default WorkshopsAdvancedFilter;
