import React, { useEffect } from "react";
import { Categories, mockData } from "../assets/mockData";
import HeroVideo from "../assets/Videos/kv_animated_PC.webm";
import InfoSection from "../components/InfoSection";
import CategorySection from "../components/CategorySection";
import { setProducts } from "../redux/productSlice";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ initialize navigate here
  const { products, searchTerm } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(setProducts(mockData));
  }, [dispatch]);

  const handleClick = () => {
    navigate("/shop"); // ✅ use route path, not file path
  };

  // Filter products if search term
  const searchResults = searchTerm
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="bg-white mt-2 px-4 md:px-16 lg:px-24 py-4">
      {/* Search Results */}
      {searchTerm && (
        <div className="container mx-auto py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Search Results for "{searchTerm}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 cursor-pointer">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-lg">No products found.</p>
          )}
        </div>
      )}

      <div className="container mx-auto py-4 flex flex-col md:flex-row space-x-2">
        {/* Categories */}
        <div className="w-full md:w-3/12 h-auto">
          <div className="bg-[#3B2F2F] text-white text-xs font-bold px-2 py-2.5">
            SHOP BY CATEGORIES
          </div>
          <ul className="space-y-4 bg-gray-100 p-3 border-0">
            {Categories.map((category, index) => (
              <li
                key={index}
                className="flex items-center text-sm font-medium"
              >
                <div className="w-2 h-2 border border-[#3B2F2F] rounded-full mr-2"></div>
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero Section */}
        <div className="w-full md:w-9/12 mt-8 md:mt-0 h-96 relative">
          <video
            src={HeroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-16 left-8 text-white max-w-sm">
            <p className="mb-4 text-lg">Shop. Save. Smile.</p>
            <h2 className="text-2xl mt-2.5 font-bold">Welcome to ShopWise</h2>
            <p className="mt-1 text-sm">Trusted by thousands.</p>
            <button
              onClick={handleClick}
              className="bg-[#3B2F2F] px-4 py-1.5 text-white mt-4 hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 rounded-lg"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoSection />

      {/* Category Section */}
      <CategorySection />

      {/* Top Products */}
      <div className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Top Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 cursor-pointer">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
