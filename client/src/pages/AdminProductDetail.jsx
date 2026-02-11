import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { FaArrowLeft, FaEdit, FaTrash, FaDollarSign, FaBox, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import EditProductForm from '../components/EditProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import ProductSalesList from '../components/ProductSalesList';
import AdminReviewsList from '../components/AdminReviewsList';
import { getImageUrl } from '../utils/imageUtils';

function AdminProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [sales, setSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getOne(id);
            setProduct(response.data.product);

            // Fetch product sales
            try {
                const salesResponse = await productsAPI.getSales(id);
                setSales(salesResponse.data);
            } catch (err) {
                console.error('Error fetching sales:', err);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setNotification({
                show: true,
                message: 'Error loading product details',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await productsAPI.delete(id);
            setNotification({
                show: true,
                message: 'Product deleted successfully!',
                type: 'success'
            });
            setTimeout(() => navigate('/admin/products'), 1500);
        } catch (error) {
            setNotification({
                show: true,
                message: 'Error deleting product: ' + error.message,
                type: 'error'
            });
        }
    };

    const handleEditSuccess = (productName) => {
        setShowEditForm(false);
        fetchProduct(); // Refresh data
        setNotification({
            show: true,
            message: `Product "${productName}" updated successfully!`,
            type: 'success'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">Product not found</p>
                <button onClick={() => navigate('/admin/products')} className="mt-4 text-blue-500 hover:underline">
                    Back to Products
                </button>
            </div>
        );
    }

    const isOutOfStock = product.stock_quantity === 0;
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-up">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 px-0 py-2 sm:px-4 text-gray-700 dark:text-gray-300 hover:text-ecoGreen dark:hover:text-ecoGreen transition-all hover:-translate-x-1 font-semibold"
                >
                    <FaArrowLeft />
                    <span>Back to Products</span>
                </button>
                <div className="flex w-full sm:w-auto gap-3">
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-bold shadow-lg text-sm sm:text-base"
                    >
                        <FaEdit />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => setDeleteConfirm({ isOpen: true })}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-bold shadow-lg text-sm sm:text-base"
                    >
                        <FaTrash />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Hero Image Section - OPTIMIZED SIZE */}
                <div className="relative h-[250px] fold:h-[280px] sm:h-[350px] overflow-hidden rounded-xl">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className={`w-full h-full object-contain bg-gray-100 dark:bg-gray-800 ${isOutOfStock ? 'grayscale' : ''}`}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-ecoGreen/90 backdrop-blur-md rounded-full shadow-lg">
                            <span className="text-white font-bold text-xs sm:text-sm">{product.category_name}</span>
                        </div>
                    </div>

                    {/* Stock Status Badge */}
                    {isOutOfStock && (
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 sm:px-5 sm:py-2 bg-red-600/90 backdrop-blur-md rounded-full shadow-lg animate-pulse">
                            <span className="text-white font-bold text-[10px] sm:text-sm uppercase tracking-tighter sm:tracking-normal">OUT OF STOCK</span>
                        </div>
                    )}
                    {isLowStock && (
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 sm:px-5 sm:py-2 bg-yellow-500/90 backdrop-blur-md rounded-full shadow-lg">
                            <span className="text-white font-bold text-[10px] sm:text-sm uppercase tracking-tighter sm:tracking-normal">LOW STOCK</span>
                        </div>
                    )}

                    {/* Product Name Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-2xl">{product.name}</h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Price & Stock */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-ecoGreen to-green-600 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaDollarSign className="text-2xl" />
                                    <p className="text-sm font-semibold opacity-90">Price</p>
                                </div>
                                <p className="text-4xl font-black">Rs {product.price}</p>
                                <p className="text-sm opacity-80 mt-1">per {product.unit}</p>
                            </div>

                            {/* Stock Card */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOutOfStock ? 'bg-red-100 dark:bg-red-900/30' :
                                        isLowStock ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                            'bg-green-100 dark:bg-green-900/30'
                                        }`}>
                                        <FaBox className={`text-lg ${isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                            isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-green-600 dark:text-green-400'
                                            }`} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white">Stock Status</h3>
                                </div>
                                <p className={`text-lg font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' :
                                    isLowStock ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-green-600 dark:text-green-400'
                                    }`}>
                                    {isOutOfStock ? '⚠️ Out of Stock (0)' :
                                        isLowStock ? `⚠️ Low Stock (${product.stock_quantity})` :
                                            `✅ In Stock (${product.stock_quantity})`}
                                </p>
                            </div>

                            {/* Origin Card */}
                            {product.origin && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaMapMarkerAlt className="text-xl text-blue-600 dark:text-blue-400" />
                                        <h3 className="font-bold text-gray-800 dark:text-white">Origin</h3>
                                    </div>
                                    <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{product.origin}</p>
                                </div>
                            )}

                            {/* Rating Card */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xl">⭐</span>
                                    <h3 className="font-bold text-gray-800 dark:text-white">Rating</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {product.rating || 0}
                                    </p>
                                    <span className="text-yellow-500">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {product.reviews_count || 0} reviews
                                </p>
                            </div>

                            {/* Created Date Card */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xl">📅</span>
                                    <h3 className="font-bold text-gray-800 dark:text-white">Added On</h3>
                                </div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {product.created_at ? new Date(product.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Description & Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-ecoGreen rounded-full"></div>
                                    Description
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{product.description}</p>
                            </div>

                            {/* Product Details */}
                            {product.details && Object.keys(product.details).length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-600">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-ecoGreen rounded-full"></div>
                                        Product Details
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(product.details).map(([key, value]) => (
                                            <div key={key} className="flex flex-col fold:flex-row justify-between items-start fold:items-center p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 gap-2">
                                                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm sm:text-base">{key}</span>
                                                <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Section */}
            {sales && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Purchase History ({sales.sales.length} Orders)
                    </h2>
                    <ProductSalesList
                        sales={sales.sales}
                        totalSold={sales.total_sold}
                        totalRevenue={sales.total_revenue}
                        totalCustomers={sales.total_customers}
                    />
                </div>
            )}

            {/* Reviews Section */}
            {product.reviews && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Customer Reviews ({product.total_reviews}){product.average_rating > 0 && ` - Average: ${Number(product.average_rating).toFixed(1)}⭐`}
                    </h2>
                    <AdminReviewsList
                        reviews={product.reviews}
                        averageRating={product.average_rating}
                        totalReviews={product.total_reviews}
                    />
                </div>
            )}

            {/* Edit Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Product</h2>
                            <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <EditProductForm productId={product.product_id} onSuccess={handleEditSuccess} onCancel={() => setShowEditForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="red"
            />

            {/* Notification */}
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

export default AdminProductDetail;
