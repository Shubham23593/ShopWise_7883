import React, { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [billingToggle, setBillingToggle] = useState(true);
  const [shippingToggle, setShippingToggle] = useState(false);
  const [paymentToggle, setPaymentToggle] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const cart = useSelector((state) => state.cart) || { products: [], totalPrice: 0 };

  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    zip: "",
  });

  const handlePlaceOrder = () => {
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

    const totalItems = cart.products.reduce((sum, p) => sum + p.quantity, 0);

    toast.success("Order placed successfully!");
    dispatch(clearCart());
    navigate("/order-confirmation", {
      state: {
        products: cart.products,
        totalPrice: cart.totalPrice,
        totalItems,
      },
    });
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
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
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
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setPaymentToggle(!paymentToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Payment Method
              </h4>
              {paymentToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>
            <div className={`${paymentToggle ? "mt-4 space-y-4" : "hidden"}`}>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>Cash on Delivery</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "dc"}
                  onChange={() => setPaymentMethod("dc")}
                />
                <span>Debit Card</span>
              </label>

              {paymentMethod === "dc" && (
                <div className="bg-slate-50 p-4 rounded-lg shadow-inner space-y-2">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    className="w-full px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-1/2 px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-1/2 px-4 py-2 rounded-lg shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3 bg-white rounded-2xl shadow-3xl p-6 h-fit">
          <h4 className="text-2xl font-semibold mb-4 text-gray-800">
            Order Summary
          </h4>
          <div className="space-y-4">
            {cart.products.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h5 className="font-medium">{product.name}</h5>
                  <p className="text-gray-600">
                    ₹{product.price} x {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between font-bold text-lg">
            <span>Total Price:</span>
            <span>₹{cart.totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
