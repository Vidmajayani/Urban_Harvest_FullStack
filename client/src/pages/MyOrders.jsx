import { useState, useEffect } from 'react';
import { ordersAPI, productReviewsAPI } from '../services/api';
import ReviewModal from '../components/ReviewModal';
import { FaStar, FaBox, FaCheckCircle, FaClock, FaTimes, FaShieldAlt, FaShoppingBag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

function MyOrders({ isWidget = false }) {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        ordersAPI.getMyOrders()
            .then(response => {
                setOrders(response.data.orders || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            });
    };

    const handleReviewClick = (product, orderId) => {
        setSelectedProduct({ ...product, order_id: orderId });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            await productReviewsAPI.create({
                product_id: selectedProduct.product_id,
                order_id: selectedProduct.order_id,
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            // Refresh orders to update has_reviewed flag
            await fetchOrders();

            setShowReviewModal(false);
            showNotification('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification(error.response?.data?.error || 'Failed to submit review', 'error');
            throw error;
        }
    };

    if (isAdmin()) {
        if (isWidget) return null;
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-statusInfo/30">
                    <div className="w-20 h-20 bg-statusInfo/10 dark:bg-statusInfo/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaShieldAlt className="text-4xl text-statusInfo" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Administrator Mode</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        You are currently logged in with administrative privileges. Customer account features like personal order history are not available for admin accounts.
                    </p>
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-statusInfo hover:bg-statusInfo/80 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
                    >
                        Go to Admin Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoGreen"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <FaBox className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Orders Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ecoGreen hover:bg-ecoDark text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
                >
                    <FaShoppingBag /> Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map(order => (
                <div key={order.order_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-ecoGreen to-ecoDark p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">Order #{order.order_id}</h3>
                                <p className="text-sm opacity-90">{new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Total Amount</p>
                                <p className="text-2xl font-bold">Rs {Number(order.total_amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items & Subscriptions */}
                    <div className="p-4 space-y-3">
                        {/* Regular Products */}
                        {order.items && order.items.map((item, index) => (
                            <div key={`prod-${index}`} className="flex flex-col sm:flex-row gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                {/* Product Image */}
                                <div className="w-full h-48 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                                    {item.product_image ? (
                                        <img
                                            src={getImageUrl(item.product_image)}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBox className="text-4xl sm:text-2xl text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details Wrapper */}
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{item.product_name}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <span>Qty: <strong className="text-gray-900 dark:text-white">{item.quantity}</strong> {item.unit}</span>
                                            <span>Price: <strong className="text-gray-900 dark:text-white">Rs {Number(item.unit_price || 0).toFixed(2)}</strong></span>
                                            <span>Subtotal: <strong className="text-ecoGreen">Rs {Number(item.subtotal || 0).toFixed(2)}</strong></span>
                                        </div>
                                    </div>

                                    {/* Review Button or Badge */}
                                    <div className="flex items-center flex-shrink-0 border-t sm:border-0 border-gray-200 dark:border-gray-600 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                                        {!Boolean(item.has_reviewed) ? (
                                            <button
                                                onClick={() => handleReviewClick(item, order.order_id)}
                                                className="w-full sm:w-auto px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-ecoGreen hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
                                            >
                                                <FaStar className="text-ecoYellow" />
                                                Review
                                            </button>
                                        ) : (
                                            <div className="w-full sm:w-auto px-6 py-2 bg-statusSuccess/10 text-statusSuccess rounded-lg flex items-center justify-center gap-2 text-sm font-semibold border border-statusSuccess/30">
                                                <FaCheckCircle className="text-statusSuccess" />
                                                Reviewed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Subscription Boxes */}
                        {order.subscriptions && order.subscriptions.map((sub, index) => (
                            <div key={`sub-${index}`} className="flex flex-col sm:flex-row gap-4 p-3 bg-ecoGreen/5 dark:bg-ecoGreen/10 rounded-xl border border-ecoGreen/20">
                                {/* Box Image */}
                                <div className="w-full h-48 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden border border-ecoGreen/30">
                                    {sub.box_image ? (
                                        <img
                                            src={getImageUrl(sub.box_image)}
                                            alt={sub.box_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBox className="text-4xl sm:text-2xl text-ecoGreen" />
                                        </div>
                                    )}
                                </div>

                                {/* Box Details Wrapper */}
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-full">{sub.box_name}</h4>
                                            <span className="flex-shrink-0 px-2 py-0.5 bg-ecoGreen text-white text-[10px] font-bold rounded uppercase tracking-wider">Subscription</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="whitespace-nowrap">Status: <strong className="text-ecoGreen capitalize">{sub.status}</strong></span>
                                            <span className="whitespace-nowrap">Price: <strong className="text-gray-900 dark:text-white">Rs {Number(sub.box_price || 0).toFixed(2)}</strong></span>
                                            <span className="whitespace-nowrap">Delivery: <strong className="text-gray-900 dark:text-white uppercase">{sub.frequency || 'Monthly'}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700 w-full sm:w-auto mt-auto sm:mt-0">
                                        <Link
                                            to="/my-subscriptions"
                                            className="w-full sm:w-auto px-6 py-2 bg-white dark:bg-gray-800 text-ecoGreen border border-ecoGreen rounded-lg hover:bg-ecoGreen hover:text-white transition text-xs font-bold text-center shadow-sm"
                                        >
                                            Manage
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!order.items || order.items.length === 0) && (!order.subscriptions || order.subscriptions.length === 0) && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No items in this order</p>
                        )}
                    </div>

                    {/* Order Footer */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-4">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Payment: <strong className="text-gray-900 dark:text-white capitalize">{order.payment_method}</strong>
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Items: <strong className="text-gray-900 dark:text-white">{order.items_count || 0}</strong>
                                </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                                Delivery: <strong className="text-gray-900 dark:text-white">{order.delivery_city || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Review Modal */}
            {showReviewModal && selectedProduct && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleReviewSubmit}
                    productName={selectedProduct.product_name}
                />
            )}
        </div>
    );
}

export default MyOrders;
