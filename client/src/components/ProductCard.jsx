import { Link } from "react-router-dom";
import { FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../context/AuthContext";

function ProductCard({ item }) {
  const { isAdmin } = useAuth();
  const isOutOfStock = item.stock_quantity === 0;
  const isLowStock = item.stock_quantity > 0 && item.stock_quantity < 10;

  return (
    <div className={`bg-gradient-to-br from-white to-ecoBeige dark:from-gray-800 dark:to-gray-700 p-4 fold:p-5 sm:p-6 rounded-2xl fold:rounded-3xl shadow-lg card-hover border border-gray-900 dark:border-gray-100 relative ${isOutOfStock ? 'opacity-75' : ''}`}>

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          OUT OF STOCK
        </div>
      )}

      {/* Low Stock Badge */}
      {isLowStock && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Only {item.stock_quantity} left!
        </div>
      )}

      {/* Product Image with overlay */}
      <div className={`relative overflow-hidden rounded-xl fold:rounded-2xl mb-3 fold:mb-4 group ${isOutOfStock ? 'grayscale' : ''}`}>
        {/* Favorite Button */}
        <div className="absolute top-2 left-2 z-10">
          <FavoriteButton itemType="product" itemId={item.product_id} />
        </div>

        <img
          src={item.image}
          alt={item.name}
          className="w-full h-36 fold:h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-ecoGreen/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white font-bold flex items-center gap-2"></span>
        </div>
      </div>

      {/* Product Name */}
      <h3 className="text-base fold:text-lg sm:text-xl font-ecoHeading mb-2 text-ecoDark dark:text-white line-clamp-2">{item.name}</h3>

      {/* Price and Rating */}
      <div className="flex items-center justify-between mb-3 fold:mb-4">
        <p className="font-ecoFont text-lg fold:text-xl sm:text-2xl font-bold text-ecoGreen dark:text-ecoLight">Rs {item.price}</p>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs fold:text-sm">★</span>
          <span className="font-bold text-gray-700 dark:text-gray-200 text-xs fold:text-sm">{item.rating}</span>
          <span className="text-[10px] fold:text-xs text-gray-500 dark:text-gray-400">({item.reviews})</span>
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-3 fold:mb-4">
        <span className="text-[10px] fold:text-xs bg-ecoLight/30 dark:bg-ecoGreen/20 px-2 fold:px-3 py-0.5 fold:py-1 rounded-full text-ecoDark dark:text-ecoLight font-semibold uppercase tracking-wide">
          {item.category_name}
        </span>
      </div>

      {/* Stock Status */}
      <div className="mb-3">
        {isOutOfStock ? (
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">Currently Unavailable</p>
        ) : item.stock_quantity < 20 ? (
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm">{item.stock_quantity} in stock</p>
        ) : (
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm">In Stock</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* View Details Button */}
        <Link
          to={`/products/${item.product_id}`}
          className={`block w-full font-bold py-2 fold:py-2.5 sm:py-3 px-3 fold:px-4 rounded-lg fold:rounded-xl transition duration-300 text-center shadow-md flex items-center justify-center gap-1.5 fold:gap-2 group text-xs fold:text-sm sm:text-base ${isOutOfStock
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-ecoGreen dark:bg-ecoGreen hover:bg-ecoDark dark:hover:bg-ecoDark text-white hover:shadow-lg'
            }`}
        >
          View Details
          <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-xs fold:text-sm" />
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;