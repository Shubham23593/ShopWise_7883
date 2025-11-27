import { FaStar, FaShoppingCart } from 'react-icons/fa';

function ProductList({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div 
          key={product._id} 
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 overflow-hidden hover:scale-105 duration-300"
        >
          {/* Image Container */}
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200?text=Phone';
                }}
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{product.discount}%
            </div>
          )}

          {/* Content */}
          <h3 className="font-bold text-lg mb-1 truncate text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2 font-semibold">{product.brand}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <FaStar className="text-yellow-500" />
            <span className="text-sm text-gray-700">{product.rating}/5</span>
            <span className="text-xs text-gray-500">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-indigo-600">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm line-through text-gray-500">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p className="text-sm mb-4 font-semibold">
            {product.inStock ? (
              <span className="text-green-600">✅ In Stock ({product.stock})</span>
            ) : (
              <span className="text-red-600">❌ Out of Stock</span>
            )}
          </p>

          {/* Add to Cart Button */}
          <button 
            disabled={!product.inStock}
            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              product.inStock
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <FaShoppingCart /> {product.inStock ? 'Add to Cart' : 'Not Available'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;