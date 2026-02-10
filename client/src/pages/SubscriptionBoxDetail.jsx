import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionBoxesAPI, reviewsAPI, subscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaStar, FaBox, FaCheck, FaShoppingCart, FaArrowLeft, FaLeaf, FaTruck, FaShieldAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import ReviewsSection from '../components/ReviewsSection';
import LoginPromptModal from '../components/LoginPromptModal';

function SubscriptionBoxDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user } = useAuth();
    const { addToCart, isInCart, getItemQuantity } = useCart();
    const [box, setBox] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showAddedNotification, setShowAddedNotification] = useState(false);
    const [userSubscription, setUserSubscription] = useState(null);

    useEffect(() => {
        fetchBoxDetails();
        fetchReviews();
        if (user) {
            checkUserSubscription();
        }
    }, [id, user]);

    const fetchBoxDetails = async () => {
        try {
            setLoading(true);
            const response = await subscriptionBoxesAPI.getOne(id);
            setBox(response.data.box);
        } catch (error) {
            console.error('Error fetching box details:', error);
            setError('Failed to load box details');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await reviewsAPI.getByBox(id);
            setReviews(response.data.reviews || []);
            setAverageRating(parseFloat(response.data.averageRating) || 0);
            setTotalReviews(response.data.totalReviews || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkUserSubscription = async () => {
        try {
            const response = await subscriptionsAPI.getMy();
            const subscription = response.data.subscriptions.find(
                sub => sub.box_id === parseInt(id) && sub.status === 'active'
            );
            setUserSubscription(subscription);
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated()) {
            setShowLoginModal(true);
            return;
        }

        addToCart(box, 1, 'subscription_box');

        setShowAddedNotification(true);
        setTimeout(() => setShowAddedNotification(false), 3000);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoGreen mx-auto mb-4"></div>
                <p className="text-xl text-gray-600 dark:text-gray-400">Loading subscription details...</p>
            </div>
        );
    }

    if (error || !box) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 px-4">
                <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Box not found</h1>
                <Link to="/subscription-boxes" className="text-ecoGreen hover:underline mt-4 inline-block">Back to Subscription Boxes</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-2 fold:px-3 sm:px-5 py-3 fold:py-4 sm:py-8 mb-8 fold:mb-12">
            {/* Back Button */}
            <Link to="/subscription-boxes" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-ecoGreen dark:hover:text-ecoLight mb-3 fold:mb-4 sm:mb-6 transition-colors group text-sm fold:text-base">
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform text-xs fold:text-sm" />
                Back to Subscription Boxes
            </Link>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl fold:rounded-2xl shadow-lg fold:shadow-2xl overflow-hidden mb-6 fold:mb-8 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Image */}
                    <div className="relative h-[250px] fold:h-[300px] sm:h-[400px] lg:h-full group">
                        {box.image_url ? (
                            <img
                                src={box.image_url}
                                alt={box.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <FaBox className="text-9xl text-gray-300 dark:text-gray-600" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <span className="bg-ecoGreen text-white px-3 fold:px-4 py-1 fold:py-1.5 rounded-full text-[10px] fold:text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                                {box.frequency.replace('-', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="p-4 fold:p-6 sm:p-10 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-2 fold:mb-3 sm:mb-4">
                            <span className="text-ecoGreen dark:text-ecoLight font-bold uppercase tracking-wider text-[10px] fold:text-xs sm:text-sm">
                                Premium Subscription
                            </span>
                            <div className="flex items-center gap-1 text-ecoYellow">
                                <FaStar className="text-[10px] fold:text-xs sm:text-sm" />
                                <span className="font-semibold text-sm">{box.rating ? Number(box.rating).toFixed(1) : '0.0'}</span>
                            </div>
                        </div>

                        <h1 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-2 fold:mb-3 sm:mb-4 leading-tight">
                            {box.name}
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px] fold:text-xs sm:text-sm md:text-base mb-4 fold:mb-6">
                            {box.description}
                        </p>

                        {/* Feature Tags */}
                        <div className="grid grid-cols-2 gap-2 mb-6 sm:mb-8">
                            {[
                                { icon: <FaLeaf />, text: "100% Organic", color: "text-ecoGreen" },
                                { icon: <FaTruck />, text: "Free Delivery", color: "text-ecoOrange" },
                                { icon: <FaShieldAlt />, text: "Cancel Anytime", color: "text-statusInfo" },
                                { icon: <FaCheck />, text: "Guaranteed Fresh", color: "text-ecoGreen" }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 fold:gap-2 text-[10px] fold:text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    <span className={`${feature.color} text-[10px] fold:text-xs`}>{feature.icon}</span>
                                    {feature.text}
                                </div>
                            ))}
                        </div>

                        {/* Price & Action */}
                        <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 fold:pt-6">
                            <div className="flex items-center justify-between mb-4 fold:mb-6">
                                <div>
                                    <p className="text-[10px] fold:text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Weekly Price</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl fold:text-2xl sm:text-4xl font-extrabold text-ecoGreen">
                                            Rs {box.price.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] fold:text-xs text-gray-500 dark:text-gray-400">/ delivery</span>
                                    </div>
                                </div>
                                {userSubscription && (
                                    <span className="bg-ecoGreen/10 text-ecoGreen px-2 fold:px-3 py-1 rounded-full text-[9px] fold:text-[10px] font-bold border border-ecoGreen/20">
                                        Subscribed
                                    </span>
                                )}
                            </div>

                            {!isAdmin() ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isInCart(box.box_id, 'subscription_box')}
                                    className={`w-full bg-ecoGreen text-white font-bold py-2.5 fold:py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs fold:text-sm sm:text-base ${isInCart(box.box_id, 'subscription_box') ? 'opacity-60 cursor-not-allowed' : 'hover:bg-ecoDark hover:shadow-xl transform hover:-translate-y-1'}`}
                                >
                                    <FaShoppingCart className="text-xs fold:text-sm" />
                                    {isInCart(box.box_id, 'subscription_box') ? 'Add to Cart' : 'Add to Cart'}
                                </button>
                            ) : (
                                <div className="bg-statusInfo/10 dark:bg-statusInfo/20 border-2 border-statusInfo/30 p-3 fold:p-4 rounded-xl text-center">
                                    <p className="text-statusInfo text-[11px] fold:text-xs sm:text-sm font-bold">
                                        🛠️ Admin Mode: Purchasing Disabled
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* What's Inside Section - More Professional */}
            {box.items && box.items.length > 0 && (
                <div className="bg-gradient-to-br from-ecoCream to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl fold:rounded-3xl p-6 fold:p-8 sm:p-12 shadow-sm border border-ecoGreen/10 mb-8 fold:mb-12">
                    <h2 className="text-lg fold:text-xl sm:text-3xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-6 fold:mb-8 flex items-center gap-2 fold:gap-3">
                        <FaInfoCircle className="text-ecoGreen text-base fold:text-lg sm:text-2xl" />
                        What's Inside Your Box
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 fold:gap-4 sm:gap-6">
                        {box.items.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-gray-700 p-3 fold:p-4 sm:p-6 rounded-xl shadow-sm border border-gray-50 dark:border-gray-600 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3 mb-2 fold:mb-3">
                                    <div className="w-8 h-8 fold:w-10 fold:h-10 rounded-full bg-ecoGreen/5 dark:bg-gray-600 flex items-center justify-center text-ecoGreen group-hover:bg-ecoGreen group-hover:text-white transition-colors duration-300">
                                        <FaBox size={14} className="fold:w-[16px] fold:h-[16px]" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-xs fold:text-sm sm:text-base">{item.item_name}</h3>
                                </div>
                                <div className="flex justify-between items-center text-[10px] fold:text-xs">
                                    <span className="text-ecoGreen font-bold bg-ecoGreen/10 px-2 py-0.5 rounded-full">{item.quantity}</span>
                                    <span className="text-gray-400 italic">Included</span>
                                </div>
                                {item.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-[10px] fold:text-xs mt-2 italic">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notification */}
            {showAddedNotification && (
                <div className="fixed top-24 right-4 bg-ecoGreen text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right z-50 transition-all border border-white/20">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <FaCheckCircle className="text-xl" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-none mb-1">Added to Cart!</p>
                        <p className="text-xs opacity-90 font-medium">
                            {getItemQuantity(box.box_id, 'subscription_box')}x {box.name}
                        </p>
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <ReviewsSection
                reviews={reviews}
                loading={reviewsLoading}
                averageRating={averageRating}
                totalReviews={totalReviews}
            />

            {/* Modals */}
            <LoginPromptModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={() => navigate('/login', { state: { from: `/subscription-boxes/${id}` } })}
                message="Please login to start your subscription"
            />
        </div>
    );
}

export default SubscriptionBoxDetail;
