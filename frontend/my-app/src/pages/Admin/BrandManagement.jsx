import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaStar, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    country: '',
    logo: ''
  });

  useEffect(() => {
    fetchBrands();
  }, [page, search]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      let url = `${API_URL}/admin/brands?page=${page}&limit=10`;
      if (search) url += `&search=${search}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_URL}/admin/brands`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          website: '',
          country: '',
          logo: ''
        });
        fetchBrands();
        alert('✅ Brand added!');
      }
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to add brand'));
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/admin/brands/${id}/featured`,
        { isFeatured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrands();
      alert(!currentStatus ? '⭐ Brand featured!' : '❌ Removed from featured');
    } catch (err) {
      alert('❌ Failed to update');
    }
  };

  const handleDeleteBrand = async (id) => {
    if (window.confirm('Delete this brand?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/admin/brands/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBrands();
        alert('✅ Brand deleted');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🏷️ Brand Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <FaPlus /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search brands..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Country</th>
              <th className="px-6 py-3 text-left">Featured</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-3 text-center">No brands found</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{brand.name}</td>
                  <td className="px-6 py-3">{brand.country || '-'}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggleFeatured(brand._id, brand.isFeatured)}
                      className={`flex items-center gap-1 px-3 py-1 rounded ${
                        brand.isFeatured
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <FaStar size={14} />
                      {brand.isFeatured ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand._id)}
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

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Brand</h2>

            <form onSubmit={handleAddBrand} className="space-y-4">
              <input
                type="text"
                placeholder="Brand Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <input
                type="url"
                placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <input
                type="url"
                placeholder="Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Add Brand
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandManagement;