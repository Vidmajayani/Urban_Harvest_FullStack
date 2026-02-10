import { FaStar, FaUser, FaCalendar, FaCheckCircle } from 'react-icons/fa';

function AdminReviewsList({ reviews, averageRating, totalReviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <FaStar className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
            </div>
        );
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={`${index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
            />
        ));
    };

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">Average Rating</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">{averageRating}</span>
                            <div className="flex gap-1">
                                {renderStars(Math.round(parseFloat(averageRating)))}
                            </div>
                        </div>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">Total Reviews</p>
                        <p className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">{totalReviews}</p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {reviews.map((review, index) => (
                    <div
                        key={review.review_id || index}
                        className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                    >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm ring-2 ring-blue-500/20">
                                    {review.profile_image ? (
                                        <img
                                            src={review.profile_image}
                                            alt={review.user_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <FaUser className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{review.user_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <FaCalendar className="text-xs" />
                                        <span>
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        {review.verified_purchase === 1 && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                                <FaCheckCircle className="text-xs" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {renderStars(review.rating)}
                            </div>
                        </div>

                        {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-11">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminReviewsList;
