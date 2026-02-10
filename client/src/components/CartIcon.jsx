import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

function CartIcon() {
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    return (
        <button
            onClick={() => navigate('/cart')}
            className="relative p-2 text-white hover:text-ecoYellowDark dark:hover:text-ecoLight transition-colors"
            aria-label="Shopping Cart"
        >
            <FaShoppingCart className="text-2xl" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ecoOrange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                </span>
            )}
        </button>
    );
}

export default CartIcon;
