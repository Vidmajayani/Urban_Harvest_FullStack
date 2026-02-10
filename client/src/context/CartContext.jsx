import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartRemovedItems, setCartRemovedItems] = useState(false);

    // Load cart from localStorage on mount and validate
    useEffect(() => {
        const savedCart = localStorage.getItem('urbanHarvestCart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);

                // Validate items with the server
                if (parsedCart.length > 0) {
                    validateCartItems(parsedCart);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                localStorage.removeItem('urbanHarvestCart');
            }
        }
    }, []);

    const validateCartItems = async (itemsToValidate) => {
        try {
            const response = await fetch(`${API_URL}/api/cart/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ items: itemsToValidate })
            });

            if (response.ok) {
                const data = await response.json();

                // Filter out invalid items and update others
                const validatedCart = data.items
                    .filter(item => item.isValid)
                    .map(item => {
                        const { isValid, ...cleanItem } = item;
                        return cleanItem;
                    });

                if (data.removedCount > 0) {
                    console.log(`Removed ${data.removedCount} unavailable items from cart`);
                    setCart(validatedCart);
                    setCartRemovedItems(true);
                    // Also store in sessionStorage as a fallback/persistent flag
                    sessionStorage.setItem('cartItemsRemoved', 'true');
                } else {
                    // Even if none removed, names/prices might have changed
                    setCart(validatedCart);
                }
            }
        } catch (error) {
            console.error('Failed to validate cart items:', error);
        }
    };

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('urbanHarvestCart', JSON.stringify(cart));
    }, [cart]);

    // Add item to cart
    const addToCart = (item, quantity = 1, type = 'product') => {
        setCart(prevCart => {
            const isSubscription = type === 'subscription_box';
            const itemIdField = isSubscription ? 'box_id' : 'product_id';
            const itemId = item[itemIdField];

            // Check if item already exists in cart
            const existingItemIndex = prevCart.findIndex(
                i => i.type === type && i[itemIdField] === itemId
            );

            if (existingItemIndex > -1) {
                // Update quantity
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            } else {
                // Add new item
                const newItem = {
                    type: type,
                    [itemIdField]: itemId,
                    name: item.name,
                    price: item.price,
                    image: isSubscription ? item.image_url : item.image,
                    quantity: quantity
                };

                if (!isSubscription) {
                    newItem.unit = item.unit;
                    newItem.stock_quantity = item.stock_quantity;
                } else {
                    newItem.frequency = item.frequency;
                }

                return [...prevCart, newItem];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (itemId, type = 'product') => {
        const itemIdField = type === 'subscription_box' ? 'box_id' : 'product_id';
        setCart(prevCart => prevCart.filter(item =>
            !(item.type === type && item[itemIdField] === itemId)
        ));
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity, type = 'product') => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, type);
            return;
        }

        const itemIdField = type === 'subscription_box' ? 'box_id' : 'product_id';

        setCart(prevCart => {
            return prevCart.map(item =>
                item.type === type && item[itemIdField] === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    };

    // Clear entire cart
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('urbanHarvestCart');
    };

    // Get cart total
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    };

    // Get cart item count
    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Check if item is in cart
    const isInCart = (itemId, type = 'product') => {
        const itemIdField = type === 'subscription_box' ? 'box_id' : 'product_id';
        return cart.some(item => item.type === type && item[itemIdField] === itemId);
    };

    // Get item quantity in cart
    const getItemQuantity = (itemId, type = 'product') => {
        const itemIdField = type === 'subscription_box' ? 'box_id' : 'product_id';
        const item = cart.find(item => item.type === type && item[itemIdField] === itemId);
        return item ? item.quantity : 0;
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
        getItemQuantity,
        cartRemovedItems,
        setCartRemovedItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
