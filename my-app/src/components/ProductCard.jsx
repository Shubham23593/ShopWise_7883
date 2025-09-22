import React from "react";
import { FaStar } from 'react-icons/fa';
import { addToCart, addToCartAsync } from "../redux/cartSlice";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    event.preventDefault();
    
    try {
      if (user) {
        // User is authenticated, use backend
        await dispatch(addToCartAsync({ 
          productId: product.id, 
          product, 
          quantity: 1 
        })).unwrap();
        toast.success("Product added to cart!");
      } else {
        // User not authenticated, use local cart
        dispatch(addToCart(product));
        toast.success("Product added to cart!");
      }
    } catch (error) {
      toast.error(error || "Failed to add product to cart");
    }
  };

  return (
    <div className="bg-white p-3 shadow-sm rounded-lg relative border border-transparent transform duration-200 hover:scale-105 hover:shadow-md">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain mb-2"
      />

      <h3 className="text-base font-semibold truncate">{product.name}</h3>

      <p className="text-green-600 text-sm font-medium">
        ₹{product.price}
      </p>

      <div className="flex items-center mt-1 gap-0.5">
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
      </div>

      <div
        className="absolute bottom-3 right-2 flex items-center justify-center w-7 h-7 bg-[#3B2F2F]
          group text-white text-xs rounded-full hover:w-28 hover:bg-red-700 transition-all overflow-hidden cursor-pointer"
        onClick={(event) => handleAddToCart(event, product)}
      >
        <span className="group-hover:hidden">+</span>
        <span className="hidden group-hover:block">Add to Cart</span>
      </div>
    </div>
  );
};

export default ProductCard;







