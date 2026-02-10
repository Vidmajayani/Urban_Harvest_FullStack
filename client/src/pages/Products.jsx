import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";
import { FaBox, FaLeaf } from "react-icons/fa";

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productCategory, setProductCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (productCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category_name === productCategory));
    }
  }, [productCategory, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ecoGreen mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl text-statusError mb-4">✕</div>
        <p className="text-xl text-statusError">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 fold:px-3 sm:px-6 lg:px-8 py-3 fold:py-4 sm:py-8 dark:bg-gray-900">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative h-[220px] fold:h-[260px] sm:h-[320px] md:h-[420px] rounded-xl fold:rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg fold:shadow-xl sm:shadow-2xl mb-4 fold:mb-6 sm:mb-12 group">
        <img
          src="/Images/product_garden.png"
          alt="Sustainable Lifestyle"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center p-3 fold:px-4 sm:p-12 bg-black/20">
          <div className="max-w-2xl text-white drop-shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 fold:gap-3 mb-2 fold:mb-3 sm:mb-4">
              <span className="bg-ecoGreen/90 px-2 fold:px-3 sm:px-4 py-0.5 fold:py-1 rounded-full text-[10px] fold:text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm">Premium Selection</span>
            </div>
            <h1 className="text-xl fold:text-2xl sm:text-4xl md:text-6xl font-ecoHeading font-bold mb-2 fold:mb-4 sm:mb-6 leading-tight text-white">
              Fresh from the <br />
              Urban Harvest
            </h1>
            <p className="text-xs fold:text-sm sm:text-xl md:text-2xl text-white/90 font-light leading-relaxed">
              Discover our curated selection of organic, locally-sourced products
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 fold:gap-4 sm:gap-6 mb-4 fold:mb-6 sm:mb-12">
        {/* Stat Card 1 - Premium Products */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-ecoGreen/10 dark:bg-ecoGreen/20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-ecoGreen/10 dark:bg-ecoGreen/20 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-ecoGreen dark:text-ecoLight group-hover:scale-110 transition-transform duration-300">
            <FaBox className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">{products.length}+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Premium Products</p>
          </div>
        </div>

        {/* Stat Card 2 - Organic Certified */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-ecoOrange/10 dark:bg-ecoOrange/20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-ecoOrange/5 dark:bg-ecoOrange/10 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-ecoOrange dark:text-ecoOrangeLight group-hover:scale-110 transition-transform duration-300">
            <FaLeaf className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">100%</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Organic Certified</p>
          </div>
        </div>

        {/* Stat Card 3 - Carbon Footprint */}
        <div className="bg-white dark:bg-gray-800 p-3 fold:p-4 sm:p-6 rounded-lg fold:rounded-xl sm:rounded-2xl shadow-md fold:shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 fold:gap-3 sm:gap-4 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 fold:w-16 fold:h-16 sm:w-20 sm:h-20 bg-ecoYellow/10 dark:bg-ecoYellow/20 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"></div>
          <div className="bg-ecoYellow/5 dark:bg-ecoYellow/10 p-2 fold:p-2.5 sm:p-3 rounded-lg fold:rounded-xl text-ecoYellow dark:text-ecoYellowLight group-hover:scale-110 transition-transform duration-300">
            <FaLeaf className="text-base fold:text-lg sm:text-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg fold:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-0">Zero</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-[9px] fold:text-[10px] sm:text-xs">Carbon Footprint</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 fold:mb-6 sm:mb-10">
        <FilterBar
          categories={["All", "Food", "Lifestyle", "Garden Supplies"]}
          activeCategory={productCategory}
          onCategoryChange={setProductCategory}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fold:gap-6 sm:gap-8 mb-8 fold:mb-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.product_id} item={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 fold:py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl fold:rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-4xl fold:text-5xl sm:text-6xl mb-3 fold:mb-4">📦</div>
          <h3 className="text-base fold:text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 px-4">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm fold:text-base px-4">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}

export default Products;
