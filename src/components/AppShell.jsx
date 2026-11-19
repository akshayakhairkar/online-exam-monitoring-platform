import { ShieldCheck } from 'lucide-react'
import '../App.css'

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <ShieldCheck size={24} aria-hidden="true" />
          <span>ExamGuard</span>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default AppShell
