import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchOrders();
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      
      console.log('📦 Orders response:', response.data);
      
      // ✅ FIX: Extract orders array from response
      const ordersData = response.data?.data || response.data || [];
      
      // Ensure it's an array
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        console.warn('Orders data is not an array:', ordersData);
        setOrders([]);
        toast.warning('No orders found');
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
      setOrders([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Orders Section */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-600 mt-2">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No orders yet</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order ID: #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.name}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      <p className="font-medium">Shipping to:</p>
                      <p>{order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.zip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;