import { FaBars, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUser, logoutAdmin } from '../../utils/adminAuth';

function AdminHeader({ onMenuClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const admin = getAdminUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-800 lg:hidden"
        >
          <FaBars size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">🛍️ ShopWise Admin</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* Admin Info */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg transition"
          >
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-gray-800">{admin?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{admin?.role}</p>
            </div>
            <FaChevronDown size={12} className="text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200">
              <button
                onClick={() => navigate('/admin/profile')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-b"
              >
                <FaUser /> My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;