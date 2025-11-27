import { useEffect, useState } from 'react';
import { FaEye, FaLock, FaUnlock, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search, status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      let url = `${API_URL}/admin/users?page=${page}&limit=10`;
      
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/admin/users/${selectedUser._id}/block`,
        { reason: blockReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      fetchUsers();
      alert('✅ User blocked!');
    } catch (err) {
      alert('❌ Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/admin/users/${userId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      alert('✅ User unblocked!');
    } catch (err) {
      alert('❌ Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        alert('✅ User deleted');
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
      <h1 className="text-3xl font-bold mb-6">👥 User Management</h1>

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
            placeholder="Search users..."
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
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-3 text-center">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{user.name}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{user.phone}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded text-sm ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? '✅ Active' : '🔒 Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                      <FaEye /> View
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 flex items-center gap-1"
                      >
                        <FaLock /> Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblockUser(user._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <FaUnlock /> Unblock
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
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

      {/* Block User Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Block User</h2>

            <p className="text-gray-700 mb-4">Block <strong>{selectedUser.name}</strong>?</p>

            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking (optional)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              rows="3"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleBlockUser}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Block
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

export default UserManagement;