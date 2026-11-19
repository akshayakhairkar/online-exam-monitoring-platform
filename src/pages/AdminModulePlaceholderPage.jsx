import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'

function AdminModulePlaceholderPage() {
  const location = useLocation()
  const title = location.pathname.split('/').pop().replace('-', ' ')

  return (
    <section className="admin-placeholder-panel">
      <Construction size={32} aria-hidden="true" />
      <p className="admin-dashboard-kicker">Admin workspace</p>
      <h2>{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
      <p>This module is reserved for a future implementation stage.</p>
    </section>
  )
}

export default AdminModulePlaceholderPage
