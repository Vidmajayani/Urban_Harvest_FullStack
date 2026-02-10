import { FaStar, FaRegCommentDots } from 'react-icons/fa';

function ReviewsSection({ reviews, loading, averageRating, totalReviews }) {
    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
                <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
                {totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={`text-lg ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                            {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                    <FaRegCommentDots className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.review_id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm ring-2 ring-ecoGreen/10">
                                        {review.profile_image ? (
                                            <img
                                                src={review.profile_image}
                                                alt={review.user_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-ecoGreen/10 flex items-center justify-center">
                                                <span className="text-ecoGreen font-bold text-lg">
                                                    {review.user_name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {review.user_name}
                                            </p>
                                            {(review.verified_purchase || review.verified_attendance) && (
                                                <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                    <span className="text-green-500">✓</span> Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg italic">
                                    "{review.comment}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewsSection;
