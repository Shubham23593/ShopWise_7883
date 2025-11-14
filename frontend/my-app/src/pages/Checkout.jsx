import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { clearCartAsync } from "../redux/cartSlice";
import { orderAPI } from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [billingToggle, setBillingToggle] = useState(true);
  const [shippingToggle, setShippingToggle] = useState(false);
  const [paymentToggle, setPaymentToggle] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const cart = useSelector((state) => state.cart) || { products: [], totalPrice: 0 };

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/");
    }
  }, [user, navigate]);

  const [billingInfo, setBillingInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    zip: "",
  });

  const handlePlaceOrder = async () => {
    if (!billingInfo.name || !billingInfo.email || !billingInfo.phone) {
      toast.error("Please fill all Billing Information fields");
      return;
    }
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zip) {
      toast.error("Please fill all Shipping Information fields");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a Payment Method");
      return;
    }

    try {
      // Create order in backend
      const { data } = await orderAPI.createOrder({ shippingAddress: shippingInfo });
      
      toast.success("Order placed successfully!");
      
      // Clear cart
      await dispatch(clearCartAsync()).unwrap();
      
      // Navigate to order confirmation
      navigate("/order-confirmation", {
        state: {
          orderId: data._id,
          products: data.items,
          totalPrice: data.totalAmount,
          totalItems: data.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-10 lg:px-20 min-h-screen bg-gradient-to-r from-slate-100 to-slate-200">
      <h3 className="text-3xl font-bold mb-8 text-gray-800 drop-shadow">
        Checkout
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          {/* Billing Info */}
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setBillingToggle(!billingToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Billing Information
              </h4>
              {billingToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>
            <div className={`${billingToggle ? "mt-4 space-y-4" : "hidden"}`}>
              <input
                type="text"
                placeholder="Name"
                value={billingInfo.name}
                onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={billingInfo.email}
                onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Shipping Info */}
          <div className="rounded-xl shadow-2xl p-4 bg-white">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShippingToggle(!shippingToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Shipping Information
              </h4>
              {shippingToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>
            <div className={`${shippingToggle ? "mt-4 space-y-4" : "hidden"}`}>
              <input
                type="text"
                placeholder="Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="City"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={shippingInfo.zip}
                onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl shadow-2xl p-4 bg-white">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setPaymentToggle(!paymentToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Payment Method
              </h4>
              {paymentToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>
            <div className={`${paymentToggle ? "mt-4 space-y-3" : "hidden"}`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <label>Cash on Delivery</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <label>Credit/Debit Card</label>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3 bg-white p-6 rounded-xl shadow-2xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Order Summary
          </h3>
          <div className="space-y-3">
            {cart.products.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  ₹{(product.price * product.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-lg"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;