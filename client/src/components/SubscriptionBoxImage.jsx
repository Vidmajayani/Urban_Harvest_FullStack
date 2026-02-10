/**
 * Component that displays product images in a grid layout
 * Shows up to 6 products from a subscription box
 */
function SubscriptionBoxImage({ products, boxName, className }) {
    if (!products || products.length === 0) {
        return (
            <div className={`${className} flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800`}>
                <div className="text-center text-gray-400">
                    <p className="text-sm">No products</p>
                </div>
            </div>
        );
    }

    // Show up to 6 products
    const displayProducts = products.slice(0, 6);

    // Determine grid layout based on product count
    const gridCols = displayProducts.length <= 2 ? displayProducts.length :
        displayProducts.length <= 4 ? 2 : 3;

    return (
        <div className={`${className} bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800 p-4 border-2 border-ecoGreen rounded-lg`}>
            <div
                className="grid gap-2 h-full"
                style={{
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gridAutoRows: '1fr'
                }}
            >
                {displayProducts.map((product, index) => (
                    <div
                        key={product.product_id || index}
                        className="bg-white dark:bg-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                        <img
                            src={product.image || '/images/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/images/placeholder-product.jpg';
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubscriptionBoxImage;
