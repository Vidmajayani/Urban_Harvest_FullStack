import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function FavoriteButton({ itemType, itemId, className = '' }) {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        // Only check favorite status if user is logged in
        if (user && itemType && itemId) {
            checkFavoriteStatus();
        } else {
            // Reset state when user logs out
            setIsFavorited(false);
            setFavoriteId(null);
        }
    }, [user, itemType, itemId]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await favoritesAPI.checkStatus(itemType, itemId);
            setIsFavorited(response.data.isFavorited);
            setFavoriteId(response.data.favorite_id);
        } catch (error) {
            // Silently handle errors (e.g., network issues)
            setIsFavorited(false);
        }
    };

    const handleToggleFavorite = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            showNotification('Please login to save favorites', 'info');
            // Give user time to see toast before redirecting
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            if (isFavorited) {
                // Remove from favorites using type and id (more robust)
                await favoritesAPI.removeByItem(itemType, itemId);
                setIsFavorited(false);
                setFavoriteId(null);
                showNotification('Removed from favorites', 'info');
            } else {
                // Add to favorites
                const response = await favoritesAPI.add({
                    item_type: itemType,
                    item_id: itemId
                });
                setIsFavorited(true);
                setFavoriteId(response.data.favorite_id);
                showNotification('Added to favorites! ❤️', 'success');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showNotification('Failed to update favorites', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`group relative transition-all duration-200 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl hover:scale-110 ${className}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isFavorited ? (
                <FaHeart
                    className="text-red-500 text-2xl transition-transform group-hover:scale-110"
                />
            ) : (
                <FaRegHeart
                    className="text-gray-800 dark:text-gray-200 text-2xl transition-all group-hover:text-red-400 group-hover:scale-110"
                />
            )}

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </button>
    );
}

export default FavoriteButton;
