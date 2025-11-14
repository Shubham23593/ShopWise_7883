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
      const { data } = await orderAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow"
          >
            Logout
          </button>
        </div>

        {/* Orders Section */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h3>
          
          {loading ? (
            <p className="text-center text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-600">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order ID: {order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Items: {order.items.length}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
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