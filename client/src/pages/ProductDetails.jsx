import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { productsAPI, productReviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaHeart, FaShare, FaCheck, FaStar, FaMinus, FaPlus, FaGlobe, FaLeaf, FaTools, FaRuler, FaInfoCircle, FaRecycle, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import ReviewsSection from "../components/ReviewsSection";
import LoginPromptModal from "../components/LoginPromptModal";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(0);
  const { addToCart, isInCart } = useCart();



  // Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getOne(id);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (id) {
      productReviewsAPI.getReviews(id)
        .then((response) => {
          setReviews(response.data.reviews);
          setAverageRating(parseFloat(response.data.averageRating));
          setTotalReviews(response.data.totalReviews);
          setReviewsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching reviews:", err);
          setReviewsLoading(false);
        });
    }
  }, [id]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Store quantity in state for notification
    setAddedQuantity(quantity);

    // Add to cart
    addToCart(product, quantity);

    // Reset quantity first
    setQuantity(1);

    // Then show success notification with the correct quantity
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/products/${id}` } });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Product not found</h1>
        <Link to="/products" className="text-ecoGreen hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 fold:px-3 sm:px-5 py-3 fold:py-4 sm:py-8 mb-8 fold:mb-12">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-ecoGreen dark:hover:text-ecoLight mb-3 fold:mb-4 sm:mb-6 transition-colors group text-sm fold:text-base">
        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform text-xs fold:text-sm" />
        Back to Products
      </Link>

      {/* Card container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl fold:rounded-2xl shadow-lg fold:shadow-2xl p-4 fold:p-6 sm:p-10 mb-6 fold:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fold:gap-8 lg:gap-12">
          {/* Left – Image */}
          <div className="h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[250px] fold:h-[300px] sm:h-[350px] md:h-[450px] lg:h-[550px] object-cover rounded-xl fold:rounded-2xl shadow-md"
            />
          </div>

          {/* Right – Details */}
          <div className="flex flex-col justify-center">
            {/* Category & Rating */}
            <div className="flex justify-between items-center mb-2 fold:mb-3 sm:mb-4">
              <span className="text-ecoGreen dark:text-ecoLight font-bold uppercase tracking-wider text-[10px] fold:text-xs sm:text-sm">
                {product.category_name}
              </span>
              <div className="flex items-center gap-1 text-ecoYellow">
                <FaStar className="text-ecoYellow text-[10px] fold:text-xs sm:text-sm" />
                <span className="font-semibold text-ecoYellow text-[10px] fold:text-xs sm:text-sm">{product.rating}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-lg fold:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-2 fold:mb-3 sm:mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px] fold:text-xs sm:text-sm md:text-base mb-3 fold:mb-4 sm:mb-6">
              {product.description}
            </p>

            {/* Price & Stock */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-600 py-2.5 fold:py-3 sm:py-4 md:py-5 mb-4 fold:mb-6 sm:mb-8">
              <div>
                <span className="text-lg fold:text-xl sm:text-2xl font-extrabold text-ecoGreen dark:text-ecoLight">
                  Rs {product.price}
                </span>
                {product.unit && (
                  <span className="text-[10px] fold:text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 fold:ml-2">/ {product.unit}</span>
                )}
              </div>
              <span className="bg-statusSuccess/10 text-statusSuccess px-2 fold:px-2.5 sm:px-4 py-0.5 fold:py-1 sm:py-1.5 rounded-full font-medium text-[9px] fold:text-[10px] sm:text-sm">
                In Stock
              </span>
            </div>

            {/* Action Buttons - Hidden for Admins */}
            {!isAdmin() ? (
              <>
                {/* Quantity Selector */}
                <div className="flex items-center mb-4 fold:mb-6 sm:mb-8">
                  <span className="text-gray-500 dark:text-gray-400 font-medium mr-3 fold:mr-4 sm:mr-6 text-xs fold:text-sm sm:text-base md:text-lg">Quantity</span>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full p-1 fold:p-1.5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <button
                      onClick={decrementQuantity}
                      className="w-7 h-7 fold:w-8 fold:h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 hover:text-ecoGreen hover:bg-green-50 dark:hover:bg-gray-500 rounded-full transition-all duration-200 shadow-sm border border-gray-100 dark:border-gray-500"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus size={7} className="fold:w-[8px] fold:h-[8px] sm:w-[10px] sm:h-[10px]" />
                    </button>
                    <span className="w-8 fold:w-10 sm:w-14 text-center font-bold text-sm fold:text-base sm:text-lg md:text-xl text-gray-800 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="w-7 h-7 fold:w-8 fold:h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-ecoGreen text-white hover:bg-ecoDark rounded-full transition-all duration-200 shadow-md transform hover:scale-105"
                      aria-label="Increase quantity"
                    >
                      <FaPlus size={7} className="fold:w-[8px] fold:h-[8px] sm:w-[10px] sm:h-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-ecoGreen hover:bg-ecoDark text-white font-semibold py-2 fold:py-2.5 sm:py-3 md:py-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-md mb-3 fold:mb-4 flex items-center justify-center gap-1.5 fold:gap-2 text-xs fold:text-sm sm:text-base hover:scale-[1.02]"
                >
                  <FaShoppingCart className="text-xs fold:text-sm" />
                  {isInCart(product.product_id) ? 'Add More to Cart' : 'Add to Cart'}
                </button>

                {/* View Cart Button */}
                {isInCart(product.product_id) && (
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-ecoOrange hover:bg-ecoOrangeLight text-white font-semibold py-2 fold:py-2.5 sm:py-3 md:py-4 rounded-lg fold:rounded-xl transition-all duration-300 shadow-md mb-3 fold:mb-4 flex items-center justify-center gap-1.5 fold:gap-2 text-xs fold:text-sm sm:text-base"
                  >
                    🛒 View Cart & Checkout
                  </button>
                )}
              </>
            ) : (
              <div className="bg-statusInfo/10 dark:bg-statusInfo/20 border-2 border-statusInfo/30 p-4 rounded-xl mb-6">
                <p className="text-statusInfo text-sm font-bold text-center">
                  🛠️ Administrator Mode: You cannot place orders.
                </p>
              </div>
            )}

            {/* Secondary Icon Buttons */}
            <div className="flex justify-center space-x-2.5 fold:space-x-3 sm:space-x-4 mb-3 fold:mb-4 sm:mb-6">
              <button className="w-9 h-9 fold:w-10 fold:h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-ecoGreen rounded-full text-ecoGreen hover:bg-ecoGreen hover:text-white transition-colors">
                <FaHeart size={14} className="fold:w-4 fold:h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-9 h-9 fold:w-10 fold:h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-ecoGreen rounded-full text-ecoGreen hover:bg-ecoGreen hover:text-white transition-colors">
                <FaShare size={14} className="fold:w-4 fold:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-1.5 fold:gap-2 sm:gap-3 text-[10px] fold:text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-2.5 fold:pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                <FaCheck className="text-ecoGreen text-[10px] fold:text-xs sm:text-sm flex-shrink-0" /> 100% Organic
              </div>
              <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                <FaCheck className="text-ecoGreen text-[10px] fold:text-xs sm:text-sm flex-shrink-0" /> Sustainable
              </div>
              <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                <FaCheck className="text-ecoGreen text-[10px] fold:text-xs sm:text-sm flex-shrink-0" /> Local Source
              </div>
              <div className="flex items-center gap-1 fold:gap-1.5 sm:gap-2">
                <FaCheck className="text-ecoGreen text-[10px] fold:text-xs sm:text-sm flex-shrink-0" /> Carbon Neutral
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info Section - Product Specifications */}
      {product.details && Object.keys(product.details).length > 0 && (
        <div className="bg-gradient-to-br from-ecoCream to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl fold:rounded-3xl p-6 fold:p-8 sm:p-12 shadow-inner border border-ecoGreen/10 dark:border-gray-600">
          <h2 className="text-xl fold:text-2xl sm:text-3xl font-ecoHeading font-bold text-ecoDark dark:text-white mb-6 fold:mb-8 flex items-center gap-2 fold:gap-3">
            <FaInfoCircle className="text-ecoGreen text-base fold:text-lg sm:text-xl" />
            Product Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fold:gap-6">
            {Object.entries(product.details).map(([key, value]) => {
              // Icon mapping based on key
              let Icon = FaInfoCircle;
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes("origin")) Icon = FaGlobe;
              if (lowerKey.includes("ingredients") || lowerKey.includes("material")) Icon = FaLeaf;
              if (lowerKey.includes("dimension") || lowerKey.includes("contents")) Icon = FaRuler;
              if (lowerKey.includes("care") || lowerKey.includes("guide")) Icon = FaTools;
              if (lowerKey.includes("sustainability")) Icon = FaRecycle;

              return (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-700 p-4 fold:p-5 sm:p-6 rounded-xl fold:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-ecoGreen/5 dark:border-gray-600 group hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 fold:gap-3 mb-2 fold:mb-3">
                    <div className="w-8 h-8 fold:w-10 fold:h-10 rounded-full bg-ecoGreen/5 dark:bg-gray-600 flex items-center justify-center text-ecoGreen group-hover:bg-ecoGreen group-hover:text-white transition-colors duration-300">
                      <Icon size={14} className="fold:w-[18px] fold:h-[18px]" />
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-300 font-bold uppercase text-[10px] fold:text-xs tracking-widest">
                      {key.replace(/_/g, " ")}
                    </h3>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-xs fold:text-sm leading-relaxed pl-2 border-l-2 border-ecoGreen/20 group-hover:border-ecoGreen transition-colors duration-300">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showAddedNotification && (
        <div className="fixed top-24 right-4 bg-ecoGreen text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right z-50">
          <FaCheckCircle className="text-2xl" />
          <div>
            <p className="font-bold">Added to Cart!</p>
            <p className="text-sm opacity-90">{addedQuantity}x {product.name}</p>
          </div>
        </div>
      )}


      {/* Reviews Section */}
      <ReviewsSection
        reviews={reviews}
        loading={reviewsLoading}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginRedirect}
        message="Please login to purchase products"
      />
    </div>
  );
}

export default ProductDetails;
