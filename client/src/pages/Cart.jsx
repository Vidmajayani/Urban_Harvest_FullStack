import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    FaShoppingCart, FaTrash, FaMinus, FaPlus,
    FaArrowLeft, FaArrowRight, FaCheckCircle,
    FaShieldAlt, FaTruck, FaLeaf, FaTimes, FaQuestionCircle,
    FaCertificate
} from 'react-icons/fa';

function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, getCartCount, cartRemovedItems, setCartRemovedItems } = useCart();
    const [itemsRemovedNotify, setItemsRemovedNotify] = useState(false);

    // Check for removed items notification
    React.useEffect(() => {
        if (cartRemovedItems || sessionStorage.getItem('cartItemsRemoved') === 'true') {
            setItemsRemovedNotify(true);
            setCartRemovedItems(false);
            sessionStorage.removeItem('cartItemsRemoved');
        }
    }, [cartRemovedItems]);

    // Custom Modal States
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Redirect if not authenticated
    if (!isAuthenticated()) {
        navigate('/login', { state: { from: '/cart' } });
        return null;
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-none shadow-xl p-8 fold:p-12 border border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 bg-ecoGreen/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                        <FaShoppingCart className="text-5xl text-ecoGreen" />
                    </div>
                    <h2 className="text-2xl fold:text-3xl font-bold text-gray-800 dark:text-white mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto text-sm fold:text-base">
                        Looks like you haven't added any products yet. Browse our fresh harvest and start shopping!
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-ecoGreen hover:bg-ecoDark text-white font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-md hover:shadow-xl active:scale-95"
                    >
                        Explore Products <FaArrowRight className="text-sm" />
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const deliveryFee = 0; // Shipping is now free for all orders
    const total = subtotal + deliveryFee;

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 fold:py-6 sm:py-8 mb-12">
            {itemsRemovedNotify && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl text-amber-700 dark:text-amber-400 flex items-start gap-3 animate-fade-in-up">
                    <FaQuestionCircle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Some items were removed</p>
                        <p className="text-sm">One or more items previously in your cart are no longer available and have been removed.</p>
                    </div>
                    <button onClick={() => setItemsRemovedNotify(false)} className="ml-auto text-amber-500 hover:text-amber-700 transition-colors">
                        <FaTimes />
                    </button>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
                {/* Cart Items List */}
                <div className="flex-grow">
                    {/* Header: Title & Counter Container - Stacked for Mobile */}
                    <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl fold:text-3xl font-bold text-gray-800 dark:text-white">
                                Shopping Cart
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-xs fold:text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-sm border border-gray-100 dark:border-gray-700">
                                    {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setClearConfirmOpen(true)}
                            className="w-fit text-[10px] fold:text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-widest transition-opacity hover:opacity-80 flex items-center gap-1.5 py-1"
                        >
                            <FaTrash /> Clear Cart
                        </button>
                    </div>

                    <div className="space-y-6">
                        {cart.map((item) => {
                            const isSubscription = item.type === 'subscription_box';
                            const itemId = isSubscription ? item.box_id : item.product_id;

                            return (
                                <div
                                    key={`${item.type || 'product'}-${itemId}`}
                                    className="relative group bg-ecoGreen/[0.08] dark:bg-gray-800/40 rounded-none p-3 fold:p-4 flex flex-col sm:flex-row gap-4 fold:gap-6 border border-black dark:border-white hover:border-ecoGreen transition-all shadow-sm"
                                >
                                    {/* Action Button: Remove */}
                                    <button
                                        onClick={() => {
                                            setItemToRemove({ id: itemId, name: item.name, type: item.type || 'product' });
                                            setRemoveConfirmOpen(true);
                                        }}
                                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 dark:text-red-500/50 dark:hover:text-red-400 transition-colors z-10"
                                        title="Remove item"
                                    >
                                        <FaTimes className="text-base fold:text-lg" />
                                    </button>

                                    {/* Image Container */}
                                    <div className="flex-shrink-0 w-full sm:w-28 fold:w-32 h-32 sm:h-32 rounded-none overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="mb-2">
                                            <h3 className="text-sm fold:text-base font-bold text-gray-800 dark:text-white leading-snug">
                                                {item.name}
                                            </h3>
                                            {isSubscription && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-ecoGreen bg-ecoGreen/10 px-2 py-0.5 rounded">Subscription Box</span>
                                                    <span className="text-gray-400">Every {item.frequency}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            {/* Pricing */}
                                            <div className="space-y-0.5">
                                                <p className="text-ecoGreen dark:text-ecoLight font-bold text-lg fold:text-xl">
                                                    Rs {item.price.toLocaleString()}
                                                    {item.unit && !isSubscription && <span className="text-xs font-normal text-gray-900 dark:text-gray-300"> / {item.unit}</span>}
                                                </p>
                                                {!isSubscription && item.quantity > 1 && (
                                                    <p className="text-[10px] text-gray-900 dark:text-gray-300">
                                                        Total: Rs {(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity Manager - Hidden for subscriptions */}
                                            {!isSubscription && (
                                                <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-sm p-1 border border-gray-100 dark:border-gray-700">
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity - 1, item.type || 'product')}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-sm transition-colors text-gray-400 dark:text-gray-500 disabled:opacity-30"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <FaMinus className="text-[10px]" />
                                                    </button>
                                                    <span className="w-10 text-center font-bold text-gray-800 dark:text-white text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity + 1, item.type || 'product')}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-sm transition-colors text-gray-400 dark:text-gray-500 disabled:opacity-30"
                                                        disabled={item.quantity >= (item.stock_quantity || 100)}
                                                    >
                                                        <FaPlus className="text-[10px]" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-ecoGreen hover:text-ecoDark font-bold text-sm mt-8 transition-colors group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Add more items to your cart
                    </Link>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:w-[380px]">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-ecoGreen/[0.08] dark:bg-gray-800 rounded-none shadow-xl shadow-gray-200/50 dark:shadow-none p-6 fold:p-8 border border-black dark:border-white text-gray-800 dark:text-white">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-center border-b border-gray-50 dark:border-gray-700 pb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm fold:text-base text-gray-800 dark:text-white">
                                    <span>Item total</span>
                                    <span className="font-bold">Rs {subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-sm fold:text-base text-gray-800 dark:text-white">
                                    <span>Shipping</span>
                                    <span className="font-bold text-ecoGreen">FREE</span>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base fold:text-lg font-bold text-gray-900 dark:text-white">Order Total</span>
                                        <div className="text-right">
                                            <span className="text-lg fold:text-xl font-black text-ecoGreen">
                                                Rs {total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-ecoGreen hover:bg-ecoDark text-white font-bold py-4 rounded-sm transition-all duration-300 shadow-lg shadow-ecoGreen/20 active:scale-95 flex items-center justify-center gap-3 text-base fold:text-lg mb-4"
                            >
                                Checkout <FaArrowRight className="text-sm" />
                            </button>
                        </div>

                        {/* Trust Badges - Tailored for UrbanHarvest */}
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-none border border-gray-100 dark:border-gray-700 p-2 divide-y divide-gray-100 dark:divide-gray-700">
                            {[
                                { icon: <FaLeaf />, label: "Farm-to-Table Fresh", color: "text-blue-500" },
                                { icon: <FaCertificate />, label: "Flexible Subscription", color: "text-ecoGreen" },
                                { icon: <FaShieldAlt />, label: "Chemical-Free Certified", color: "text-ecoPurple" }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center justify-between p-3 fold:p-4 group cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors first:rounded-t-sm last:rounded-b-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`${badge.color} bg-white dark:bg-gray-700 p-2 rounded-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                            {badge.icon}
                                        </div>
                                        <span className="text-xs fold:text-sm font-bold text-gray-700 dark:text-gray-300">{badge.label}</span>
                                    </div>
                                    <FaPlus className="text-[10px] text-gray-300 group-hover:rotate-90 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modals */}
            <ConfirmDialog
                isOpen={clearConfirmOpen}
                onClose={() => setClearConfirmOpen(false)}
                onConfirm={() => {
                    clearCart();
                    setClearConfirmOpen(false);
                }}
                title="Clear Cart"
                message="Are you sure you want to remove all items from your cart? This action cannot be undone."
                confirmText="Clear Everything"
                confirmColor="red"
            />

            <ConfirmDialog
                isOpen={removeConfirmOpen}
                onClose={() => {
                    setRemoveConfirmOpen(false);
                    setItemToRemove(null);
                }}
                onConfirm={() => {
                    if (itemToRemove) {
                        removeFromCart(itemToRemove.id, itemToRemove.type);
                    }
                    setRemoveConfirmOpen(false);
                    setItemToRemove(null);
                }}
                title="Remove Item"
                message={`Are you sure you want to remove "${itemToRemove?.name}" from your cart?`}
                confirmText="Remove"
                confirmColor="red"
            />
        </div>
    );
}

export default Cart;
