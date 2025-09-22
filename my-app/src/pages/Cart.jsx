import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import EmptyCart from "../assets/Images/empty-cart.png";
import { FaTrashAlt } from "react-icons/fa";
import Modal from '../components/Modal';
import ChangeAddress from '../components/ChangeAddress';
import { useAuth } from '../context/AuthContext';
import { 
  decreaseQuantity, 
  increaseQuantity, 
  removeFromCart,
  decreaseQuantityAsync,
  increaseQuantityAsync,
  removeFromCartAsync,
  fetchCart,
  clearError
} from '../redux/cartSlice';

const Cart = () => {
  const cart = useSelector(state => state.cart);
  const { user } = useAuth();
  const [address, setAddress] = useState('India , Maharashtra, 421201');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Load cart data when component mounts or user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  // Show error messages
  useEffect(() => {
    if (cart.error) {
      toast.error(cart.error);
      dispatch(clearError());
    }
  }, [cart.error, dispatch]);

  const handleShopNow = () => {
    navigate('/shop');
  };

  const handleIncreaseQuantity = (product) => {
    if (user) {
      dispatch(increaseQuantityAsync(product.productId || product.id));
    } else {
      dispatch(increaseQuantity(product.id));
    }
  };

  const handleDecreaseQuantity = (product) => {
    if (user) {
      dispatch(decreaseQuantityAsync(product.productId || product.id));
    } else {
      dispatch(decreaseQuantity(product.id));
    }
  };

  const handleRemoveFromCart = (product) => {
    if (user) {
      dispatch(removeFromCartAsync(product.productId || product.id));
    } else {
      dispatch(removeFromCart(product.id));
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.info('Please login to proceed to checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 bg-white">
      {cart.loading && (
        <div className="text-center text-gray-600">
          Loading cart...
        </div>
      )}
      
      {!cart.loading && cart.products.length > 0 ? (
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
                  key={product.productId || product.id || idx}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b gap-4"
                >
                  {/* Product */}
                  <div className="flex gap-2 items-center w-full sm:w-40">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" />
                    <h3 className="text-sm">{product.name}</h3>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-10 md:gap-16 w-full sm:w-auto text-xs sm:text-sm">
                    <span>₹{product.price.toFixed(2)}</span>

                    <div className="flex justify-start sm:justify-center">
                      <div className="flex items-center gap-2 w-24 sm:w-24 md:w-28 lg:w-32 bg-white shadow-md rounded">
                        <button 
                          className="px-2 py-1 text-gray-600 text-lg hover:text-black disabled:opacity-50"
                          onClick={() => handleDecreaseQuantity(product)}
                          disabled={cart.loading}
                        >
                          -
                        </button>
                        <span className="px-2 text-base font-medium">{product.quantity}</span>
                        <button 
                          className="px-2 py-1 text-gray-600 text-lg hover:text-black disabled:opacity-50"
                          onClick={() => handleIncreaseQuantity(product)}
                          disabled={cart.loading}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span>₹{(product.totalPrice || (product.quantity * product.price)).toFixed(2)}</span>

                    <button 
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      onClick={() => handleRemoveFromCart(product)}
                      disabled={cart.loading}
                    >
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

            <button 
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 shadow disabled:opacity-50"
              onClick={handleProceedToCheckout}
              disabled={cart.loading}
            >
              Proceed to Checkout
            </button>
            
            {!user && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please login to save your cart and proceed to checkout
              </p>
            )}
          </div>

        </div>

      ) : (
        <div className="text-center">
          <img
            src={EmptyCart}
            alt="Empty Cart"
            className="h-48 sm:h-64 md:h-72 lg:h-80 mx-auto"
          />
          <p className="text-gray-600 mt-4 mb-6">Your cart is empty</p>
          <button
            onClick={handleShopNow}
            className="mt-6 px-6 py-2 bg-[#3B2F2F] text-white rounded hover:bg-amber-800 transition-colors duration-200"
          >
            Shop Now
          </button>
        </div>
      )}

    </div>
  );
};

export default Cart;
