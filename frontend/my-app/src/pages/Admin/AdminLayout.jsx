import { useState } from 'react';
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('adminToken');
  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/brands', label: 'Brands' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'ShopWise' : 'S'}
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block p-3 rounded ${
                location.pathname === item.path
                  ? 'bg-indigo-600'
                  : 'hover:bg-gray-800'
              } ${!sidebarOpen && 'text-center'}`}
            >
              {sidebarOpen ? item.label : item.label[0]}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 p-2 rounded hover:bg-red-700 text-sm"
          >
            {sidebarOpen ? 'Logout' : 'L'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl"
          >
            ☰
          </button>
          <div className="text-right">
            <p className="font-bold">{admin.name}</p>
            <p className="text-sm text-gray-600">{admin.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;