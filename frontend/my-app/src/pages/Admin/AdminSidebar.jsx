import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChartLine,
  FaBox,
  FaCliplist,
  FaUsers,
  FaTag,
  FaTimes,
} from 'react-icons/fa';

function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/admin/products', label: 'Products', icon: FaBox },
    { path: '/admin/orders', label: 'Orders', icon: FaCliplist },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/brands', label: 'Brands', icon: FaTag },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-40 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">ShopWise</h2>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">ShopWise Admin v1.0.0</p>
            <p className="text-xs text-gray-500 mt-2">© 2025 All Rights Reserved</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;