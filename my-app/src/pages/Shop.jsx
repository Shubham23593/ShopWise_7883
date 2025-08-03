import React, { useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";

const Shop = () => {
  const { products, searchTerm } = useSelector((state) => state.product);

  const categories = ["All", "Samsung", "Apple", "Xiaomi", "OnePlus", "Vivo", "Oppo"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 🔷 Combined filter: category + search term
  const filteredProducts = products?.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.brand === selectedCategory;

    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-12 px-4 md:px-16 lg:px-24">
      <h2 className="text-3xl font-bold mb-6 text-center hover:text-[#3B2F2F] transition-colors duration-200">
        Shop
      </h2>

      {/* Search Info */}
      {searchTerm && (
        <div className="text-center text-lg mb-4">
          Showing results for: <span className="font-semibold">"{searchTerm}"</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full border text-sm transition ${
              selectedCategory === category
                ? "bg-[#3B2F2F] text-white shadow"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products */}
      {filteredProducts?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 cursor-pointer">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-lg col-span-full">No products found.</p>
      )}
    </div>
  );
};

export default Shop;
