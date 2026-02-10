import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, subscriptionsAPI } from '../services/api';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk, FaCreditCard, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

function Checkout() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { cart, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: '',
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        delivery_zip: '',
        payment_method: 'card'
    });

    // Control success modal visibility
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    // Flag to prevent redirect when order is successful but cart is empty
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Redirect if not authenticated or cart is empty
    if (!isAuthenticated()) {
        navigate('/login', { state: { from: '/checkout' } });
        return null;
    }

    if (cart.length === 0 && !orderPlaced) {
        navigate('/cart');
        return null;
    }

    const subtotal = getCartTotal();
    const deliveryFee = 0; // Permanently free shipping for all orders
    const total = subtotal + deliveryFee;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Separate products and subscription boxes
            const productsInCart = cart.filter(item => item.type !== 'subscription_box');
            const subscriptionsInCart = cart.filter(item => item.type === 'subscription_box');

            // Handle unified checkout
            await ordersAPI.createBulkOrder({
                cart: productsInCart,
                subscriptions: subscriptionsInCart,
                deliveryInfo: formData
            });

            // Set flag to true BEFORE clearing cart to prevent redirect
            setOrderPlaced(true);

            // Clear cart logic wrapper - we clear it but stay on page
            clearCart();

            // Show success modal
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to process checkout. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-1 fold:px-2 sm:px-4 py-6 fold:py-8 mb-12">
            <OrderSuccessModal isOpen={showSuccessModal} />
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/cart')}
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-ecoGreen dark:hover:text-ecoLight mb-4 transition-colors group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Cart
                </button>
                <h1 className="text-2xl fold:text-3xl sm:text-4xl font-ecoHeading font-bold text-gray-800 dark:text-white">
                    Checkout
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <form onSubmit={handleSubmit} className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none shadow-sm p-4 fold:p-6 sm:p-8 border border-black dark:border-white transition-all">
                        <h2 className="text-lg fold:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <FaUser className="text-ecoGreen" /> Delivery Information
                        </h2>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-none mb-6">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-xs fold:text-sm sm:text-base">
                                    <FaUser className="inline mr-2 text-ecoGreen" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white rounded-none focus:outline-none bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white transition"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaEnvelope className="inline mr-2 text-ecoGreen" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ecoGreen dark:focus:border-ecoLight focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaPhone className="inline mr-2 text-ecoGreen" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ecoGreen dark:focus:border-ecoLight focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                                    placeholder="0771234567"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaMapMarkerAlt className="inline mr-2 text-ecoGreen" />
                                    Delivery Address *
                                </label>
                                <textarea
                                    name="delivery_address"
                                    value={formData.delivery_address}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white rounded-none focus:outline-none bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white transition resize-none"
                                    placeholder="123 Main Street, Apartment 4B"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaCity className="inline mr-2 text-ecoGreen" />
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="delivery_city"
                                    value={formData.delivery_city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ecoGreen dark:focus:border-ecoLight focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                                    placeholder="Colombo"
                                />
                            </div>

                            {/* State/Province */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaGlobe className="inline mr-2 text-ecoGreen" />
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    name="delivery_state"
                                    value={formData.delivery_state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ecoGreen dark:focus:border-ecoLight focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                                    placeholder="Western Province"
                                />
                            </div>

                            {/* Zip Code */}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaMailBulk className="inline mr-2 text-ecoGreen" />
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    name="delivery_zip"
                                    value={formData.delivery_zip}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ecoGreen dark:focus:border-ecoLight focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition"
                                    placeholder="10100"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                    <FaCreditCard className="inline mr-2 text-ecoGreen" />
                                    Payment Method *
                                </label>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white rounded-none focus:outline-none bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white transition"
                                >
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="cash">Cash on Delivery</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 bg-ecoGreen hover:bg-ecoDark text-white font-bold py-3 fold:py-4 rounded-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm fold:text-base sm:text-lg"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <FaCheckCircle className="flex-shrink-0" /> Place Order (Rs {total.toFixed(2)})
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none shadow-sm p-4 fold:p-5 sm:p-6 sticky top-24 border border-black dark:border-white">
                        <h2 className="text-base fold:text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <FaShoppingCart className="text-gray-900 dark:text-white" /> Summary
                        </h2>

                        {/* Cart Items */}
                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item) => {
                                const isSubscription = item.type === 'subscription_box';
                                const itemId = isSubscription ? item.box_id : item.product_id;

                                return (
                                    <div key={`${item.type || 'product'}-${itemId}`} className="flex gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-none border border-black/10 dark:border-white/10"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {item.name}
                                                </h4>
                                                {isSubscription && (
                                                    <span className="text-[10px] bg-ecoGreen/20 text-ecoGreen px-2 py-0.5 rounded-sm font-bold uppercase border border-ecoGreen/20">
                                                        {item.frequency}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                {isSubscription ? 'Subscription Box' : `Qty: ${item.quantity} × Rs ${item.price}`}
                                            </p>
                                            <p className="text-gray-900 dark:text-ecoLight font-bold text-sm">
                                                Rs {(item.price * item.quantity).toFixed(2)}
                                                {isSubscription && <span className="text-[10px] font-normal text-gray-400"> / delivery</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] fold:text-sm text-gray-700 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] fold:text-sm text-gray-700 dark:text-gray-400">
                                <span>Delivery</span>
                                <span className="font-semibold text-ecoGreen">FREE</span>
                            </div>
                            <div className="border-t border-black/10 dark:border-white/10 pt-4">
                                <div className="flex justify-between items-center text-sm fold:text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span className="text-base fold:text-xl font-black text-ecoGreen">Rs {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
