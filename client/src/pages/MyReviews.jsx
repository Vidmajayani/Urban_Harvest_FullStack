import { useState, useEffect } from 'react';
import { productReviewsAPI } from '../services/api';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';

function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        console.log('productReviewsAPI:', productReviewsAPI);
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await productReviewsAPI.fetchProductReviews();
            setReviews(response.data.reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showNotification('Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await productReviewsAPI.delete(deleteId);
            showNotification('Review deleted successfully');
            setReviews(reviews.filter(r => r.review_id !== deleteId));
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting review:', error);
            showNotification('Failed to delete review', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ecoGreen"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
                <p className="font-bold uppercase tracking-widest text-xs text-gray-400">No reviews yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.review_id} className="group bg-white dark:bg-gray-800 rounded-none shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-4 transition-all duration-300">
                    <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 relative flex-shrink-0">
                            <img
                                src={review.image_url || '/images/placeholder-product.jpg'}
                                alt={review.product_name}
                                className="w-full h-full object-cover border border-black/5 dark:border-white/5"
                                onError={(e) => e.target.src = '/images/placeholder-product.jpg'}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase truncate pr-4">
                                    {review.product_name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setDeleteId(review.review_id);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="text-gray-400 hover:text-statusError transition-colors p-1"
                                        title="Delete Review"
                                    >
                                        <FaTrash className="text-lg" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={`${i < review.rating ? 'text-ecoYellow' : 'text-gray-200 dark:text-gray-700'} text-sm`}
                                    />
                                ))}
                                <span className="text-xs text-gray-400 font-medium ml-2">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2">
                                "{review.comment}"
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
            />
        </div>
    );
}

export default MyReviews;
