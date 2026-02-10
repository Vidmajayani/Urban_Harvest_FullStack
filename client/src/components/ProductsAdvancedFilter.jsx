import { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

function ProductsAdvancedFilter({
    categories,
    onApplyFilters,
    initialFilters = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: initialFilters.searchTerm || '',
        selectedCategories: initialFilters.selectedCategories || [],
        stockStatus: initialFilters.stockStatus || 'all', // all, in-stock, low-stock, out-of-stock
        sortBy: initialFilters.sortBy || 'name',
        sortOrder: initialFilters.sortOrder || 'asc'
    });

    const stockStatuses = [
        { value: 'all', label: 'All Items' },
        { value: 'in-stock', label: 'In Stock' },
        { value: 'low-stock', label: 'Low Stock' },
        { value: 'out-of-stock', label: 'Out of Stock' }
    ];

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
            stockStatus: 'all',
            sortBy: 'name',
            sortOrder: 'asc'
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters); // Apply immediately
    };

    const handleApply = () => {
        onApplyFilters(filters);
        setIsOpen(false);
    };

    const activeFiltersCount =
        filters.selectedCategories.length +
        (filters.stockStatus !== 'all' ? 1 : 0);

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold shadow-lg"
            >
                <FaFilter />
                <span>Filter options</span>
                {activeFiltersCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs font-bold">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-green-500">
                            <div className="flex items-center gap-3">
                                <FaFilter className="text-white text-xl" />
                                <h2 className="text-xl font-bold text-white">Filter Products</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-green-600 p-2 rounded-lg transition"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Categories */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => handleCategoryToggle(category)}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.selectedCategories.includes(category)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Stock Status
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {stockStatuses.map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => setFilters({ ...filters, stockStatus: status.value })}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${filters.stockStatus === status.value
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Sort By
                                </label>
                                <select
                                    value={`${filters.sortBy}-${filters.sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setFilters({ ...filters, sortBy: field, sortOrder: order });
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                >
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
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
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-lg"
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

export default ProductsAdvancedFilter;
