import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentOrders = dashboard?.recentOrders || [];
  const topProducts = dashboard?.topProducts || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Products</p>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">₹{stats.totalRevenue || 0}</p>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📋 Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.userId?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.finalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.orderStatus === 'Delivered' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Top Products</h2>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">#{index + 1} {product.name}</p>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{product.price}</p>
                  <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;