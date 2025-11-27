import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../../utils/adminAuth';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;