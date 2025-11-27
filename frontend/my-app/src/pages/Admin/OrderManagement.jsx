import { useEffect, useState } from 'react';
import { FaEye, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      let url = `${API_URL}/admin/orders?page=${page}&limit=10`;
      
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_URL}/admin/orders/${selectedOrder._id}`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowModal(false);
        fetchOrders();
        alert('✅ Order status updated!');
      }
    } catch (err) {
      alert('❌ Failed to update order');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchOrders();
        alert('✅ Order deleted');
      } catch (err) {
        alert('❌ Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📋 Order Management</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-xs relative">
          <FaSearch className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-3 text-center">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{order.orderNumber}</td>
                  <td className="px-6 py-3">{order.userId?.name || 'N/A'}</td>
                  <td className="px-6 py-3 font-semibold">₹{order.finalAmount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded text-sm ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.orderStatus);
                        setShowModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Update Order Status</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">Order: <strong>{selectedOrder.orderNumber}</strong></p>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Update
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;