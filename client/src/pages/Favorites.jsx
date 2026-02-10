import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../services/api';
import { FaHeart, FaShoppingCart, FaCalendar, FaCalendarAlt, FaBox, FaTrash, FaArrowRight } from 'react-icons/fa';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useCart } from '../context/CartContext';

function Favorites() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState({
        products: [],
        events: [],
        workshops: [],
        subscription_boxes: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSingleDeleteModal, setShowSingleDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await favoritesAPI.getAll();
            setFavorites(response.data.grouped);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (favoriteId) => {
        setItemToDelete(favoriteId);
        setShowSingleDeleteModal(true);
    };

    const confirmRemoveSingle = async () => {
        if (!itemToDelete) return;

        try {
            await favoritesAPI.remove(itemToDelete);
            fetchFavorites();
            if (window.showToast) {
                window.showToast('Removed from favorites', 'success');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            if (window.showToast) {
                window.showToast('Failed to remove from favorites', 'error');
            }
        } finally {
            setItemToDelete(null);
            setShowSingleDeleteModal(false); // Close the modal after action
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all visible items based on active tab
            const allIds = [];
            if (activeTab === 'all') {
                allIds.push(...favorites.products.map(f => f.favorite_id));
                allIds.push(...favorites.events.map(f => f.favorite_id));
                allIds.push(...favorites.workshops.map(f => f.favorite_id));
                allIds.push(...favorites.subscription_boxes.map(f => f.favorite_id));
            } else {
                allIds.push(...favorites[activeTab].map(f => f.favorite_id));
            }
            setSelectedItems(allIds);
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (favoriteId) => {
        setSelectedItems(prev =>
            prev.includes(favoriteId)
                ? prev.filter(id => id !== favoriteId)
                : [...prev, favoriteId]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;
        setShowDeleteModal(true);
    };

    const confirmDeleteSelected = async () => {
        try {
            await Promise.all(selectedItems.map(id => favoritesAPI.remove(id)));
            setSelectedItems([]);
            fetchFavorites();
            if (window.showToast) {
                window.showToast(`Removed ${selectedItems.length} item(s) from favorites`, 'success');
            }
        } catch (error) {
            console.error('Error deleting selected favorites:', error);
            if (window.showToast) {
                window.showToast('Failed to delete some items', 'error');
            }
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart({
            product_id: product.item_id,
            name: product.item_name,
            price: product.item_price,
            image: product.item_image,
            quantity: 1
        });
        if (window.showToast) {
            window.showToast('Added to cart!', 'success');
        }
    };

    const totalFavorites =
        favorites.products.length +
        favorites.events.length +
        favorites.workshops.length +
        favorites.subscription_boxes.length;

    const tabs = [
        { id: 'all', label: 'All', count: totalFavorites },
        { id: 'products', label: 'Products', count: favorites.products.length },
        { id: 'events', label: 'Events', count: favorites.events.length },
        { id: 'workshops', label: 'Workshops', count: favorites.workshops.length },
        { id: 'subscription_boxes', label: 'Subscription Boxes', count: favorites.subscription_boxes.length }
    ];

    const renderFavoriteCard = (item, type) => (
        <div key={item.favorite_id} className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none shadow-sm hover:shadow-md transition-all border border-black dark:border-white p-3 fold:p-4 overflow-hidden group">
            {/* Main Card Container - Row on Desktop, Column on Mobile */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

                {/* Header Section: Checkbox + [Image & Info Stack] */}
                <div className="flex gap-3 sm:gap-5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.favorite_id)}
                            onChange={() => handleSelectItem(item.favorite_id)}
                            className="w-4 h-4 fold:w-5 fold:h-5 rounded-md cursor-pointer accent-ecoGreen"
                        />
                    </div>

                    {/* Image & Info Wrapper - ROW on Desktop, COL on Mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 flex-1 min-w-0 sm:items-center text-center sm:text-left">
                        {/* Image */}
                        <div className="flex-shrink-0 flex justify-center">
                            {item.item_image ? (
                                <img
                                    src={item.item_image}
                                    alt={item.item_name}
                                    className="w-16 h-16 fold:w-20 fold:h-20 sm:w-24 sm:h-24 object-cover rounded-none border border-black/10 dark:border-white/10 shadow-sm"
                                />
                            ) : (
                                <div className="w-16 h-16 fold:w-20 fold:h-20 sm:w-24 sm:h-24 bg-gray-50 dark:bg-gray-700/50 rounded-none flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-600">
                                    <FaBox className="text-xl sm:text-3xl text-gray-200" />
                                </div>
                            )}
                        </div>

                        {/* Content Info - Stacks below image on mobile */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                            <h3 className="font-bold text-sm fold:text-base sm:text-lg text-gray-800 dark:text-white leading-tight mb-1 group-hover:text-ecoGreen transition-colors line-clamp-2">
                                {item.item_name}
                            </h3>

                            {/* Type Badge */}
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5">
                                <span className="text-[8px] fold:text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                                    {type === 'products' && <><FaShoppingCart className="text-[8px]" /> Product</>}
                                    {type === 'events' && <><FaCalendarAlt className="text-[8px]" /> Event</>}
                                    {type === 'workshops' && <><FaCalendarAlt className="text-[8px]" /> Workshop</>}
                                    {type === 'subscription_boxes' && <><FaBox className="text-[8px]" /> Box</>}
                                </span>
                            </div>

                            {/* Price & Availability Section */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="text-base fold:text-lg sm:text-xl font-bold text-ecoGreen dark:text-ecoLight">
                                    Rs {item.item_price ? item.item_price.toLocaleString() : '0'}
                                </span>
                                {item.availability !== null && (
                                    <span className={`text-[8px] fold:text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-widest ${item.availability > 0
                                        ? 'bg-ecoGreen/5 text-ecoGreen'
                                        : 'bg-statusError/5 text-statusError'
                                        }`}>
                                        {item.availability > 0 ? `${item.availability} left` : 'Sold out'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Row - Mobile stack, Desktop sidebar */}
                <div className="flex flex-col gap-2 sm:min-w-[140px] sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-5">
                    <div className="flex gap-2">
                        {type === 'products' && (
                            <button
                                onClick={() => handleAddToCart(item)}
                                className="flex-1 px-3 py-2 bg-ecoGreen hover:bg-ecoDark text-white rounded-none font-bold text-[10px] fold:text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:bg-gray-300 active:scale-95 border border-black/10 dark:border-white/10"
                                disabled={item.availability === 0}
                            >
                                <FaShoppingCart className="text-[10px]" />
                                <span className="whitespace-nowrap">Add to Cart</span>
                            </button>
                        )}
                        {(type === 'events' || type === 'workshops') && (
                            <button
                                onClick={() => navigate(`/${type}/${item.item_id}`)}
                                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-none font-bold text-[10px] fold:text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:bg-gray-300 active:scale-95 border border-black/10 dark:border-white/10"
                                disabled={item.availability === 0}
                            >
                                <FaCalendarAlt className="text-[10px]" />
                                <span className="whitespace-nowrap">Book Now</span>
                            </button>
                        )}
                        {type === 'subscription_boxes' && (
                            <button
                                onClick={() => navigate(`/subscription-boxes/${item.item_id}`)}
                                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-none font-bold text-[10px] fold:text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 border border-black/10 dark:border-white/10"
                            >
                                <FaBox className="text-[10px]" />
                                <span className="whitespace-nowrap">Subscribe</span>
                            </button>
                        )}

                        <button
                            onClick={() => handleRemove(item.favorite_id)}
                            className="p-2 bg-red-50 hover:bg-statusError hover:text-white dark:bg-red-900/10 dark:hover:bg-statusError text-statusError rounded-none border border-red-200 dark:border-red-800 transition-all shadow-sm flex items-center justify-center w-9 h-9"
                            title="Remove from favorites"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const path = type === 'subscription_boxes' ? `/subscription-boxes/${item.item_id}` : `/${type}/${item.item_id}`;
                            navigate(path);
                        }}
                        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-none font-bold text-[10px] fold:text-xs transition-all flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 shadow-sm active:scale-95"
                    >
                        Details
                        <FaArrowRight className="text-[10px]" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSection = (items, type, title) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    {type === 'products' && <FaShoppingCart className="text-ecoGreen" />}
                    {type === 'events' && <FaCalendarAlt className="text-blue-500" />}
                    {type === 'workshops' && <FaCalendarAlt className="text-purple-500" />}
                    {type === 'subscription_boxes' && <FaBox className="text-teal-500" />}
                    {title} ({items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => renderFavoriteCard(item, type))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            {/* Confirm Delete Modal - Multiple Items */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteSelected}
                title="Delete Favorites"
                message={`Are you sure you want to remove ${selectedItems.length} item(s) from favorites? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Confirm Delete Modal - Single Item */}
            <DeleteConfirmModal
                isOpen={showSingleDeleteModal}
                onClose={() => {
                    setShowSingleDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmRemoveSingle}
                title="Remove from Favorites"
                message="Are you sure you want to remove this item from your favorites?"
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
            <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6">
                {/* Header */}
                <div className="mb-6 fold:mb-8 text-center sm:text-left">
                    <h1 className="text-2xl fold:text-3xl sm:text-4xl font-ecoHeading font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center sm:justify-start gap-2 fold:gap-3">
                        <FaHeart className="text-red-500 text-xl fold:text-2xl sm:text-3xl" />
                        My Favorites
                    </h1>
                    <p className="text-gray-900 dark:text-white text-xs fold:text-sm sm:text-base font-medium">
                        {totalFavorites} {totalFavorites === 1 ? 'item' : 'items'} saved in your collection
                    </p>
                </div>

                {/* Filter and Actions Card */}
                <div className="bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none p-4 fold:p-5 mb-8 border border-ecoGreen/40 dark:border-ecoGreen/30 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 fold:gap-6 justify-between">
                        <div className="flex-1 w-full">
                            <label htmlFor="category-filter" className="block text-[10px] fold:text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2">
                                Filter by Category
                            </label>
                            <select
                                id="category-filter"
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="w-full md:w-64 px-4 py-2.5 fold:py-3 rounded-none border border-black/20 dark:border-white/20 bg-white/50 dark:bg-gray-900 text-gray-800 dark:text-white font-bold text-sm fold:text-base focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all cursor-pointer"
                            >
                                {tabs.map(tab => (
                                    <option key={tab.id} value={tab.id}>
                                        {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {totalFavorites > 0 && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                <label className="flex items-center justify-center gap-2 cursor-pointer bg-white/50 dark:bg-gray-700/50 px-4 py-3 rounded-none border border-black/10 dark:border-white/10 hover:bg-white/80 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length > 0 && selectedItems.length === (activeTab === 'all' ? totalFavorites : favorites[activeTab].length)}
                                        onChange={handleSelectAll}
                                        className="w-5 h-5 rounded cursor-pointer accent-ecoGreen"
                                    />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">Select All</span>
                                </label>

                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={selectedItems.length === 0}
                                    className="px-5 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-none font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 border border-black/10 dark:border-white/10"
                                >
                                    <FaTrash className="text-xs" />
                                    <span>Delete Selected {selectedItems.length > 0 && `(${selectedItems.length})`}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {totalFavorites === 0 ? (
                    <div className="text-center py-20">
                        <FaHeart className="text-8xl text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            No favorites yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
                            Start exploring and save items you love!
                        </p>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'all' && (
                            <div className="space-y-3">
                                {favorites.products.map(item => renderFavoriteCard(item, 'products'))}
                                {favorites.events.map(item => renderFavoriteCard(item, 'events'))}
                                {favorites.workshops.map(item => renderFavoriteCard(item, 'workshops'))}
                                {favorites.subscription_boxes.map(item => renderFavoriteCard(item, 'subscription_boxes'))}
                            </div>
                        )}
                        {activeTab === 'products' && (
                            <div className="space-y-3">
                                {favorites.products.map(item => renderFavoriteCard(item, 'products'))}
                            </div>
                        )}
                        {activeTab === 'events' && (
                            <div className="space-y-3">
                                {favorites.events.map(item => renderFavoriteCard(item, 'events'))}
                            </div>
                        )}
                        {activeTab === 'workshops' && (
                            <div className="space-y-3">
                                {favorites.workshops.map(item => renderFavoriteCard(item, 'workshops'))}
                            </div>
                        )}
                        {activeTab === 'subscription_boxes' && (
                            <div className="space-y-3">
                                {favorites.subscription_boxes.map(item => renderFavoriteCard(item, 'subscription_boxes'))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Favorites;
