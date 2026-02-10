import { Link } from "react-router-dom";
import { FaStar, FaBox, FaArrowRight } from "react-icons/fa";
import FavoriteButton from "./FavoriteButton";

function SubscriptionBoxCard({ item }) {
    // Get frequency badge color (solid backgrounds for visibility)
    const getFrequencyBadgeColor = (frequency) => {
        switch (frequency?.toLowerCase()) {
            case 'weekly':
                return 'bg-ecoGreen text-white';
            case 'bi-weekly':
                return 'bg-statusInfo text-white';
            case 'monthly':
                return 'bg-ecoPurple text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                {/* Favorite Button */}
                <div className="absolute top-3 left-3 z-10">
                    <FavoriteButton itemType="subscription_box" itemId={item.box_id} />
                </div>

                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FaBox className="text-6xl text-gray-400" />
                    </div>
                )}

                {/* Frequency Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-md ${getFrequencyBadgeColor(item.frequency)}`}>
                        {item.frequency ? item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1).replace('-', ' ') : 'Monthly'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 fold:p-5">
                <h3 className="text-lg fold:text-xl font-bold text-gray-900 dark:text-white mb-1 fold:mb-2 group-hover:text-ecoGreen transition-colors line-clamp-1">
                    {item.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-xs fold:text-sm mb-3 fold:mb-4 line-clamp-2">
                    {item.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 fold:gap-2 mb-3 fold:mb-4">
                    <div className="flex items-center">
                        <FaStar className="text-ecoYellow text-xs fold:text-sm" />
                        <span className="ml-1 text-xs fold:text-sm font-semibold text-gray-900 dark:text-white">
                            {item.rating ? Number(item.rating).toFixed(1) : '0.0'}
                        </span>
                    </div>
                </div>

                {/* Items Count */}
                <div className="flex items-center gap-1.5 fold:gap-2 mb-3 fold:mb-4 text-xs fold:text-sm text-gray-600 dark:text-gray-400">
                    <FaBox className="text-ecoGreen text-xs fold:text-sm" />
                    <span>{item.items?.length || 0} items included</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 fold:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline flex-wrap">
                            <span className="text-lg fold:text-2xl font-bold text-ecoGreen truncate">
                                Rs. {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                            </span>
                            <span className="text-[10px] fold:text-sm text-gray-500 dark:text-gray-400 ml-1">
                                /{item.frequency === 'bi-weekly' ? '2w' : item.frequency === 'weekly' ? 'wk' : 'mo'}
                            </span>
                        </div>
                    </div>
                    <Link
                        to={`/subscription-boxes/${item.box_id}`}
                        className="flex-shrink-0 p-1.5 fold:p-2 rounded-full bg-ecoGreen text-white hover:bg-ecoDark transition-colors"
                    >
                        <FaArrowRight className="text-xs sm:text-sm" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SubscriptionBoxCard;
