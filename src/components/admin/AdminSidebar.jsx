import {
  BellRing,
  BookOpenCheck,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MonitorCheck,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Exam Management', icon: ClipboardList, to: '/admin/exams' },
  { label: 'Candidate Management', icon: Users, to: '/admin/candidates' },
  { label: 'Live Monitoring', icon: MonitorCheck, to: '/admin/monitoring' },
  { label: 'Integrity Alerts', icon: BellRing, to: '/admin/alerts' },
  { label: 'Reports', icon: FileBarChart, to: '/admin/reports' },
]

function AdminSidebar() {
  const navigate = useNavigate()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-logo"><BookOpenCheck size={21} /></span>
        <span>ExamGuard</span>
      </div>
      <p className="admin-sidebar-label">Workspace</p>
      <nav aria-label="Admin navigation">
        {navigationItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            key={to}
            to={to}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="admin-logout-link" type="button" onClick={() => navigate('/')}>
        <LogOut size={18} aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  )
}

export default AdminSidebar
