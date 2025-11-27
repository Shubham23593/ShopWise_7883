import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaTruck, FaCheckCircle } from "react-icons/fa";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      console.log('📦 Fetching order:', id);
      const response = await orderAPI.getOrderById(id);
      
      // Extract order from response
      const orderData = response.data?.data || response.data;
      
      console.log('✅ Order fetched:', orderData);
      setOrder(orderData);
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      toast.error(error.response?.data?.message || "Order not found");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Order not found</p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <FaCheckCircle className="text-green-600" />;
      case 'shipped': return <FaTruck className="text-purple-600" />;
      case 'processing': return <FaBox className="text-blue-600" />;
      default: return <FaBox className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <FaArrowLeft /> Back to Profile
        </button>

        {/* Order Header */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
              <p className="text-gray-600">
                Order ID: <span className="font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</span>
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-bold text-lg capitalize">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FaBox className="text-blue-600" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                        {item.brand && (
                          <p className="text-sm text-gray-500 mb-1">Brand: {item.brand}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-600">
                            Quantity: <span className="font-semibold">{item.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: <span className="font-semibold">₹{item.price?.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                        <p className="text-xl font-bold text-gray-800">
                          ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No items in this order</p>
                )}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-700">Order Total:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" />
                Shipping Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-gray-700 space-y-2">
                  <p className="font-semibold">{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p className="font-mono">{order.shippingAddress.zip}</p>
                </div>
              ) : (
                <p className="text-gray-500">No shipping address available</p>
              )}
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Order Timeline</h2>
              <div className="space-y-4">
                <div className={`flex items-start gap-3 ${order.status === 'pending' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1 ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-semibold">Order Placed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.status === 'processing' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1 ${order.status === 'processing' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-semibold">Processing</p>
                    <p className="text-sm text-gray-500">Order is being prepared</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.status === 'shipped' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1 ${order.status === 'shipped' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-semibold">Shipped</p>
                    <p className="text-sm text-gray-500">Order is on the way</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.status === 'delivered' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-semibold">Delivered</p>
                    <p className="text-sm text-gray-500">Order delivered successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <button
                onClick={() => navigate("/products")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors mb-2"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;