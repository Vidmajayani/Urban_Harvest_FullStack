import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { FaTrash, FaPlus, FaTimes, FaEdit, FaSearch, FaEye } from 'react-icons/fa';
import AddProductForm from '../components/AddProductForm';
import EditProductForm from '../components/EditProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import ProductsAdvancedFilter from '../components/ProductsAdvancedFilter';
import { getImageUrl } from '../utils/imageUtils';

function ManageProducts() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null, productName: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Search, Filter, Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [stockStatus, setStockStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // name, price
    const [sortOrder, setSortOrder] = useState('asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Check for ?add=true parameter and auto-open form
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddForm(true);
            // Remove the parameter from URL
            searchParams.delete('add');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data.products);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category_name))];
        return cats.sort();
    }, [products]);

    // Filtered and sorted products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter (multi-select)
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product => selectedCategories.includes(product.category_name));
        }

        // Apply stock status filter
        if (stockStatus !== 'all') {
            filtered = filtered.filter(product => {
                const isOutOfStock = product.stock_quantity === 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

                switch (stockStatus) {
                    case 'out-of-stock':
                        return isOutOfStock;
                    case 'low-stock':
                        return isLowStock;
                    case 'in-stock':
                        return !isOutOfStock && !isLowStock;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'price':
                    comparison = parseFloat(a.price) - parseFloat(b.price);
                    break;
                case 'name':
                default:
                    comparison = a.name.localeCompare(b.name);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [products, searchTerm, selectedCategories, stockStatus, sortBy, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

    // Calculate display range
    const displayStart = filteredAndSortedProducts.length === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, filteredAndSortedProducts.length);

    const handleDelete = async () => {
        try {
            await productsAPI.delete(deleteConfirm.productId);
            setProducts(products.filter(p => p.product_id !== deleteConfirm.productId));
            setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
            setNotification({
                show: true,
                message: `Product "${deleteConfirm.productName}" deleted successfully!`,
                type: 'success'
            });
        } catch (err) {
            setNotification({
                show: true,
                message: 'Error deleting product: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleAddSuccess = (productName) => {
        setShowAddForm(false);
        fetchProducts();
        setNotification({
            show: true,
            message: `Product "${productName || 'New Product'}" created successfully!`,
            type: 'success'
        });
    };

    const handleEditSuccess = (productName) => {
        setEditingProduct(null);
        fetchProducts();
        setNotification({
            show: true,
            message: `Product "${productName || 'Product'}" updated successfully!`,
            type: 'success'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Manage Products</h1>
                    <p className="text-gray-600 dark:text-gray-400">View, add, edit, and delete products</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                    <FaPlus />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Search Products
                </label>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Filter Button and Results */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Results Count */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-green-500">{displayStart}</span> to <span className="font-bold text-green-500">{displayEnd}</span> of <span className="font-bold">{filteredAndSortedProducts.length}</span> products
                </p>
                <ProductsAdvancedFilter
                    categories={categories}
                    initialFilters={{
                        searchTerm,
                        selectedCategories,
                        stockStatus,
                        sortBy,
                        sortOrder
                    }}
                    onApplyFilters={(filters) => {
                        setSearchTerm(filters.searchTerm);
                        setSelectedCategories(filters.selectedCategories);
                        setStockStatus(filters.stockStatus);
                        setSortBy(filters.sortBy);
                        setSortOrder(filters.sortOrder);
                        setCurrentPage(1); // Reset to first page when filters change
                    }}
                />
            </div>

            {/* Add Product Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Product</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AddProductForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <EditProductForm productId={editingProduct.product_id} onSuccess={handleEditSuccess} onCancel={() => setEditingProduct(null)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Products Display - Responsive */}
            {filteredAndSortedProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedProducts.map((product) => {
                                        const isOutOfStock = product.stock_quantity === 0;
                                        const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

                                        return (
                                            <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            className={`w-12 h-12 rounded-lg object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-white">{product.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                                                        {product.category_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-xs">
                                                    <p className="line-clamp-2 text-sm">{product.description}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {isOutOfStock && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">
                                                                OUT OF STOCK
                                                            </span>
                                                        )}
                                                        {isLowStock && (
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-bold">
                                                                LOW STOCK
                                                            </span>
                                                        )}
                                                        <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                                            isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                                                                'text-green-600 dark:text-green-400'
                                                            }`}>
                                                            {product.stock_quantity}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">
                                                    Rs {product.price}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/${product.product_id}`)}
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                            title="View details"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingProduct(product)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                            title="Edit product"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ isOpen: true, productId: product.product_id, productName: product.name })}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                            title="Delete product"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {paginatedProducts.map((product) => {
                            const isOutOfStock = product.stock_quantity === 0;
                            const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

                            return (
                                <div
                                    key={product.product_id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative ${isOutOfStock ? 'opacity-75 border-2 border-red-500' :
                                        isLowStock ? 'border-2 border-yellow-500' : ''
                                        }`}
                                >
                                    {/* Stock Status Badge */}
                                    {isOutOfStock && (
                                        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                            OUT OF STOCK
                                        </div>
                                    )}
                                    {isLowStock && (
                                        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                            LOW STOCK
                                        </div>
                                    )}

                                    {/* Card Header with Image and Title */}
                                    <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className={`w-20 h-20 rounded-lg object-cover flex-shrink-0 ${isOutOfStock ? 'grayscale' : ''}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">
                                                {product.name}
                                            </h3>
                                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                                                {product.category_name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Body with Details */}
                                    <div className="p-4 space-y-3">
                                        {/* Description */}
                                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                            {product.description}
                                        </p>

                                        {/* Stock Status */}
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Stock</span>
                                            <span className={`font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                                isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-green-600 dark:text-green-400'
                                                }`}>
                                                {isOutOfStock ? '⚠️ Out of Stock (0)' :
                                                    isLowStock ? `⚠️ Low Stock (${product.stock_quantity})` :
                                                        `✅ In Stock (${product.stock_quantity})`}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Price</span>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">Rs {product.price}</span>
                                        </div>
                                    </div>

                                    {/* Card Footer with Actions */}
                                    <div className="flex items-center justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/admin/products/${product.product_id}`)}
                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                            title="View details"
                                        >
                                            <FaEye size={18} />
                                        </button>
                                        <button
                                            onClick={() => setEditingProduct(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                            title="Edit product"
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm({ isOpen: true, productId: product.product_id, productName: product.name })}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Delete product"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination - Shared for both views */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center lg:justify-end gap-2 mt-6">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg transition ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                ‹
                            </button>

                            {/* Page Numbers */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 rounded-lg transition ${currentPage === pageNum
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg transition ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: '' })}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="red"
            />

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}
        </div>
    );
}

export default ManageProducts;
