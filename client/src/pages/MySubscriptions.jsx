import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FaBox, FaCalendar, FaTimes, FaStar, FaPause, FaPlay, FaRedo, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';
import ConfirmDialog from '../components/ConfirmDialog';

function MySubscriptions() {
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [pausedSubscriptions, setPausedSubscriptions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'paused', or 'history'
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [subscriptionReviews, setSubscriptionReviews] = useState(new Map()); // Map: ID -> review object
    const { showNotification } = useNotification();

    // Confirmation dialog states
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);
    const [actionSubscriptionId, setActionSubscriptionId] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const [activeRes, historyRes] = await Promise.all([
                subscriptionsAPI.getMy(),
                subscriptionsAPI.getHistory()
            ]);
            const allMy = activeRes.data.subscriptions || [];
            setActiveSubscriptions(allMy.filter(s => s.status === 'active'));
            setPausedSubscriptions(allMy.filter(s => s.status === 'paused'));
            setHistory(historyRes.data.history);

            // Check which subscriptions have been reviewed and store their ratings
            const reviewsMap = new Map();
            for (const sub of allMy) {
                try {
                    const reviewRes = await subscriptionsAPI.getReview(sub.subscription_id);
                    if (reviewRes.data.review) {
                        reviewsMap.set(sub.subscription_id, reviewRes.data.review);
                    }
                } catch (error) {
                    // No review found
                }
            }
            setSubscriptionReviews(reviewsMap);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        try {
            await subscriptionsAPI.cancel(actionSubscriptionId);
            showNotification('Subscription cancelled successfully');
            setShowCancelConfirm(false);
            setActionSubscriptionId(null);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            showNotification('Failed to cancel subscription', 'error');
        }
    };

    const handlePauseSubscription = async () => {
        try {
            await subscriptionsAPI.pause(actionSubscriptionId);
            showNotification('Subscription paused successfully');
            setShowPauseConfirm(false);
            setActionSubscriptionId(null);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error pausing subscription:', error);
            showNotification('Failed to pause subscription', 'error');
        }
    };

    const handleResumeSubscription = async (subscriptionId) => {
        try {
            await subscriptionsAPI.resume(subscriptionId);
            showNotification('Subscription resumed successfully');
            fetchSubscriptions();
        } catch (error) {
            console.error('Error resuming subscription:', error);
            showNotification('Failed to resume subscription', 'error');
        }
    };

    const handleReactivateSubscription = async () => {
        try {
            await subscriptionsAPI.reactivate(actionSubscriptionId);
            showNotification('Subscription reactivated successfully!');
            setShowReactivateConfirm(false);
            setActionSubscriptionId(null);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            showNotification('Failed to reactivate subscription', 'error');
        }
    };

    const handleOpenReviewModal = (subscription) => {
        setSelectedSubscription(subscription);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            await subscriptionsAPI.addReview(selectedSubscription.subscription_id, reviewData);
            showNotification('Review submitted successfully!');
            setShowReviewModal(false);
            setSelectedSubscription(null);
            fetchSubscriptions(); // Refresh to update review status
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Failed to submit review. Please try again.', 'error');
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoGreen"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">
                        My <span className="text-ecoGreen">Subscriptions</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Manage recurring deliveries and history
                    </p>
                </div>

                <div className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none p-4 sm:p-5 mb-8 border border-ecoGreen/40 dark:border-ecoGreen/30 shadow-sm">
                    <div className="max-w-xs">
                        <label htmlFor="subscription-filter" className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2">
                            Filter by Category
                        </label>
                        <select
                            id="subscription-filter"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-none border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-900 text-gray-800 dark:text-white font-bold text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all cursor-pointer"
                        >
                            <option value="active">Active Subscriptions ({activeSubscriptions.length})</option>
                            <option value="paused">Paused Subscriptions ({pausedSubscriptions.length})</option>
                            <option value="history">Subscription History ({history.length})</option>
                        </select>
                    </div>
                </div>

                {/* Active Subscriptions Grid */}
                {activeTab === 'active' && (
                    <div className="grid grid-cols-1 gap-6">
                        {activeSubscriptions.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaBox className="text-3xl text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase">
                                    No Current Deliveries
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
                                    Join the movement! Subscribe to our organic boxes for fresh produce delivered to your doorstep.
                                </p>
                                <Link
                                    to="/subscription-boxes"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-ecoGreen to-green-600 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest hover:shadow-lg transition-all transform hover:scale-105 text-xs"
                                >
                                    Browse Collections
                                </Link>
                            </div>
                        ) : (
                            activeSubscriptions.map((sub) => (
                                <div key={sub.subscription_id} className="group bg-white dark:bg-gray-800 rounded-none shadow-sm hover:shadow-md border border-ecoGreen/10 dark:border-white/5 p-3 sm:p-4 transition-all duration-300">
                                    <div className="flex gap-4 sm:gap-6 items-start md:items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                                            <img
                                                src={sub.image_url || '/images/placeholder-box.jpg'}
                                                alt={sub.name}
                                                className="w-full h-full object-cover border border-black/5 dark:border-white/5"
                                                onError={(e) => e.target.src = '/images/placeholder-box.jpg'}
                                            />
                                            <div className="absolute -top-1 -left-1">
                                                <div className="w-2 h-2 bg-statusSuccess rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
                                            <div className="flex-1">
                                                <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white uppercase truncate mb-1">
                                                    {sub.name}
                                                </h3>
                                                <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>{sub.frequency}</span>
                                                    <span>•</span>
                                                    <span className="text-statusInfo flex items-center gap-1">
                                                        <FaCalendar className="text-[8px]" /> {new Date(sub.next_delivery_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 mt-1 md:mt-0 w-full md:w-auto">
                                                <p className="font-black text-ecoGreen text-sm sm:text-base whitespace-nowrap">
                                                    Rs.{sub.price.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-4 md:gap-5 md:border-l border-gray-100 dark:border-gray-700 md:pl-5">
                                                    {subscriptionReviews.has(sub.subscription_id) ? (
                                                        <div className="flex items-center" title={`Rated ${subscriptionReviews.get(sub.subscription_id).rating}/5`}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar
                                                                    key={i}
                                                                    className={`${i < subscriptionReviews.get(sub.subscription_id).rating ? 'text-ecoYellow' : 'text-gray-200 dark:text-gray-700'} text-xs`}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleOpenReviewModal(sub)} className="text-ecoYellow hover:scale-125 transition-transform" title="Rate Experience">
                                                            <FaStar className="text-xl" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => { setActionSubscriptionId(sub.subscription_id); setShowPauseConfirm(true); }} className="text-statusWarning hover:scale-125 transition-transform" title="Pause billing">
                                                        <FaPause className="text-lg" />
                                                    </button>
                                                    <button onClick={() => { setActionSubscriptionId(sub.subscription_id); setShowCancelConfirm(true); }} className="text-statusError hover:scale-125 transition-transform" title="Discontinue">
                                                        <FaTimes className="text-xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Paused Subscriptions */}
                {activeTab === 'paused' && (
                    <div className="grid grid-cols-1 gap-6">
                        {pausedSubscriptions.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaPause className="text-3xl text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase">
                                    No Paused Subscriptions
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                                    You don't have any paused subscriptions at the moment.
                                </p>
                            </div>
                        ) : (
                            pausedSubscriptions.map((sub) => (
                                <div key={sub.subscription_id} className="group bg-white dark:bg-gray-800 rounded-none shadow-sm hover:shadow-md border border-ecoGreen/10 dark:border-white/5 p-3 sm:p-4 transition-all duration-300">
                                    <div className="flex gap-4 sm:gap-6 items-start md:items-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                                            <img
                                                src={sub.image_url || '/images/placeholder-box.jpg'}
                                                alt={sub.name}
                                                className="w-full h-full object-cover border border-black/5 dark:border-white/5"
                                                onError={(e) => e.target.src = '/images/placeholder-box.jpg'}
                                            />
                                            <div className="absolute -top-1 -left-1">
                                                <div className="w-2 h-2 bg-statusWarning rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
                                            <div className="flex-1">
                                                <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white uppercase truncate mb-1">
                                                    {sub.name}
                                                </h3>
                                                <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>{sub.frequency}</span>
                                                    <span>•</span>
                                                    <span className="italic text-statusWarning">Paused</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 mt-1 md:mt-0 w-full md:w-auto">
                                                <p className="font-black text-ecoGreen text-sm sm:text-base whitespace-nowrap">
                                                    Rs.{sub.price.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-4 md:gap-5 md:border-l border-gray-100 dark:border-gray-700 md:pl-5">
                                                    <button onClick={() => handleResumeSubscription(sub.subscription_id)} className="text-ecoGreen hover:scale-125 transition-transform" title="Resume Billing">
                                                        <FaPlay className="text-lg" />
                                                    </button>
                                                    <button onClick={() => { setActionSubscriptionId(sub.subscription_id); setShowCancelConfirm(true); }} className="text-statusError hover:scale-125 transition-transform" title="Discontinue">
                                                        <FaTimes className="text-xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div >
                )}

                {/* History List */}
                {
                    activeTab === 'history' && (
                        <div className="space-y-6">
                            {history.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center text-gray-500 border border-gray-100 dark:border-gray-700">
                                    <FaHistory className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="font-bold uppercase tracking-widest text-[10px] italic">Chronicle is empty</p>
                                </div>
                            ) : (
                                history.map((sub) => (
                                    <div key={sub.subscription_id} className="group bg-white dark:bg-gray-800 rounded-none shadow-sm hover:shadow-md border border-black/5 dark:border-white/5 p-3 sm:p-4 transition-all duration-300">
                                        <div className="flex gap-4 sm:gap-6 items-start md:items-center">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0">
                                                <img
                                                    src={sub.image_url || '/images/placeholder-box.jpg'}
                                                    alt={sub.name}
                                                    className="w-full h-full object-cover border border-black/5 dark:border-white/5"
                                                    onError={(e) => e.target.src = '/images/placeholder-box.jpg'}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white uppercase truncate mb-1">
                                                        {sub.name}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                        {new Date(sub.start_date).toLocaleDateString()} — {sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString() : 'Present'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 mt-1 md:mt-0 w-full md:w-auto">
                                                    <p className="font-black text-ecoGreen text-sm sm:text-base whitespace-nowrap">
                                                        Rs.{sub.price.toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-4 md:gap-5 md:border-l border-gray-100 dark:border-gray-700 md:pl-5">
                                                        <div className="flex-col flex items-end">
                                                            {sub.review_id && (
                                                                <div className="flex items-center mb-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FaStar
                                                                            key={i}
                                                                            className={`${i < sub.rating ? 'text-ecoYellow' : 'text-gray-200 dark:text-gray-700'} text-[10px]`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <Link to={`/subscription-boxes/${sub.box_id}`} className="text-ecoGreen hover:scale-125 transition-transform" title="Reorder / Detail">
                                                                <FaStar className="text-xl" />
                                                            </Link>
                                                        </div>
                                                        {sub.status === 'cancelled' && (
                                                            <button onClick={() => { setActionSubscriptionId(sub.subscription_id); setShowReactivateConfirm(true); }} className="text-ecoGreen hover:scale-125 transition-transform" title="Reactivate">
                                                                <FaRedo className="text-lg" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )
                }
            </div >

            {/* Review Modal */}
            {
                showReviewModal && selectedSubscription && (
                    <ReviewModal
                        isOpen={showReviewModal}
                        productName={selectedSubscription.name}
                        onClose={() => setShowReviewModal(false)}
                        onSubmit={handleSubmitReview}
                    />
                )
            }

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={handleCancelSubscription}
                title="Cancel Subscription"
                message="Are you sure you want to cancel this subscription? You can reactivate it later from the History tab."
                confirmText="Yes, Cancel"
                confirmColor="red"
            />

            <ConfirmDialog
                isOpen={showPauseConfirm}
                onClose={() => setShowPauseConfirm(false)}
                onConfirm={handlePauseSubscription}
                title="Pause Subscription"
                message="Are you sure you want to pause this subscription? You can resume it anytime from the Paused tab."
                confirmText="Yes, Pause"
                confirmColor="orange"
            />

            <ConfirmDialog
                isOpen={showReactivateConfirm}
                onClose={() => setShowReactivateConfirm(false)}
                onConfirm={handleReactivateSubscription}
                title="Reactivate Subscription"
                message="Are you sure you want to reactivate this subscription? Your next delivery will be scheduled automatically."
                confirmText="Yes, Reactivate"
                confirmColor="green"
            />
        </div >
    );
}

export default MySubscriptions;
