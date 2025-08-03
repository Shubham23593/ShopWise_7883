import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EmptyCart from "../assets/Images/empty-cart.png";
import { FaTrashAlt } from "react-icons/fa";
import Modal from '../components/Modal';
import ChangeAddress from '../components/ChangeAddress';
import { decreaseQuantity, increaseQuantity, removeFromCart } from '../redux/cartSlice';

const Cart = () => {
  const cart = useSelector(state => state.cart);
  const [address, setAddress] = useState('India , Maharashtra, 421201');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleShopNow = () => {
    navigate('/shop');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 bg-white">
      {cart.products.length > 0 ? (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

          {/* Left: Shopping Cart */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">SHOPPING CART</h3>

            {/* Table header */}
            <div className="hidden sm:flex justify-between border-b pb-2 text-xs sm:text-sm font-medium text-gray-600">
              <span className="w-28 sm:w-40">PRODUCT</span>
              <div className="flex gap-4 sm:gap-10 md:gap-16">
                <span>PRICE</span>
                <span>QUANTITY</span>
                <span>SUBTOTAL</span>
                <span>REMOVE</span>
              </div>
            </div>

            <div>
              {cart.products.map((product, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b gap-4"
                >
                  {/* Product */}
                  <div className="flex gap-2 items-center w-full sm:w-40">
                    <img src={product.image} alt="" className="w-16 h-16 object-cover" />
                    <h3 className="text-sm">{product.name}</h3>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-10 md:gap-16 w-full sm:w-auto text-xs sm:text-sm">
                    <span>₹{product.price.toFixed(2)}</span>

                    <div className="flex justify-start sm:justify-center">
                      <div className="flex items-center gap-2 w-24 sm:w-24 md:w-28 lg:w-32 bg-white shadow-md rounded">
                        <button className="px-2 py-1 text-gray-600 text-lg hover:text-black"
                          onClick={() => dispatch(decreaseQuantity(product.id))}>-</button>
                        <span className="px-2 text-base font-medium">{product.quantity}</span>
                        <button className="px-2 py-1 text-gray-600 text-lg hover:text-black"
                          onClick={() => dispatch(increaseQuantity(product.id))}>+</button>
                      </div>
                    </div>

                    <span>₹{(product.quantity * product.price).toFixed(2)}</span>

                    <button className="text-red-500"
                      onClick={() => dispatch(removeFromCart(product.id))}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart Totals */}
          <div className="bg-white shadow-md rounded p-4 text-xs sm:text-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4">CART TOTALS</h3>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">TOTAL ITEMS:</span>
              <span>{cart.totalQuantity}</span>
            </div>

            <div className="border-b my-2"></div>

            <div className="mb-4">
              <span className="text-gray-600">Shipping:</span>
              <p className="ml-4 text-gray-800">
                shipping to <span className="font-medium">{address}</span>
              </p>
              <button className="text-blue-600 ml-4 text-xs hover:underline"
                onClick={() => setIsModalOpen(true)}>Change Address</button>
            </div>

            <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
              <ChangeAddress setAddress={setAddress} setIsModalOpen={setIsModalOpen} />
            </Modal>

            <div className="flex justify-between font-semibold mb-4">
              <span>Total Price:</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>

            <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 shadow"
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>

        </div>

      ) : (
        <div className="text-center">
          <img
            src={EmptyCart}
            alt="Empty Cart"
            className="h-48 sm:h-64 md:h-72 lg:h-80 mx-auto"
          />
          <button
            onClick={handleShopNow}
            className="mt-6 px-3 py-1 bg-[#3B2F2F] text-white rounded hover:bg-amber-800 transition-colors duration-200"
          >
            Shop Now
          </button>
        </div>
      )}

    </div>
  );
};

export default Cart;
