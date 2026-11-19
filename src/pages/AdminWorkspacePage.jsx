import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminNavbar from '../components/admin/AdminNavbar'
import AdminSidebar from '../components/admin/AdminSidebar'

function AdminWorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const title = location.pathname === '/admin/dashboard' ? 'Dashboard' : 'Admin Module'

  return (
    <div className="admin-workspace">
      <AdminSidebar />
      {isSidebarOpen && <button className="admin-sidebar-overlay" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation" />}
      <div className="admin-workspace-main">
        <AdminNavbar title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <Outlet />
      </div>
    </div>
  )
}

export default AdminWorkspacePage
