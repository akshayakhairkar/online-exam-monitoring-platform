import { Bell, ChevronDown, Menu, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminNavbar({ title, onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="admin-navbar">
      <button className="admin-menu-button" type="button" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={21} />
      </button>
      <div>
        <p className="admin-navbar-kicker">Admin workspace</p>
        <h1>{title}</h1>
      </div>
      <div className="admin-navbar-actions">
        <button className="admin-notification-button" type="button" aria-label="View notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <div className="admin-profile-wrapper">
          <button
            className="admin-profile-button"
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            aria-expanded={isProfileOpen}
          >
            <span className="admin-avatar"><UserRound size={17} /></span>
            <span className="admin-profile-copy">
              <strong>Admin User</strong>
              <small>Administrator</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {isProfileOpen && (
            <div className="admin-profile-menu">
              <button type="button" onClick={() => setIsProfileOpen(false)}>Profile</button>
              <button type="button" onClick={() => navigate('/')}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
