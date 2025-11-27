import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    stock: '',
    discount: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const url = search 
        ? `${API_URL}/admin/products?search=${search}` 
        : `${API_URL}/admin/products?page=${page}&limit=10`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_URL}/admin/products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          brand: '',
          price: '',
          originalPrice: '',
          description: '',
          stock: '',
          discount: ''
        });
        fetchProducts();
        alert('✅ Product added successfully!');
      }
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to add product'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.delete(`${API_URL}/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          fetchProducts();
          alert('✅ Product deleted successfully!');
        }
      } catch (err) {
        alert('❌ Failed to delete product');
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📦 Product Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Search Bar */}
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
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Brand</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Stock</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-3 text-center text-gray-600">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-800">{product.name}</td>
                  <td className="px-6 py-3 text-gray-800">{product.brand}</td>
                  <td className="px-6 py-3 text-gray-800 font-semibold">₹{product.price}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Product</h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows="3"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
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

export default ProductManagement;