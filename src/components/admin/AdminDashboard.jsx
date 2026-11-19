import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
} from 'lucide-react'
import StatCard from './StatCard'

function AdminDashboard() {
  return (
    <div className="admin-dashboard-content">
      <div className="admin-welcome-row">
        <div>
          <p className="admin-dashboard-kicker">Admin workspace</p>
          <h2>Overview</h2>
        </div>
        <span className="backend-status-badge">Awaiting backend data</span>
      </div>

      <section className="admin-stats-grid" aria-label="Dashboard summary">
        <StatCard label="Total Exams" value="—" detail="No data available" icon={BookOpen} tone="blue" />
        <StatCard label="Registered Candidates" value="—" detail="No data available" icon={Users} tone="green" />
        <StatCard label="Active Exams" value="—" detail="No data available" icon={Clock3} tone="purple" />
        <StatCard label="Integrity Alerts" value="—" detail="No data available" icon={AlertTriangle} tone="orange" />
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Examination activity</h3>
              <p>Weekly examination participation</p>
            </div>
          </div>
          <div className="activity-chart" aria-label="Bar chart showing weekly examination participation">
            <div className="chart-bars">
              <div className="admin-empty-chart">
                <BarChart3 size={27} aria-hidden="true" />
                <span>Activity data will appear after backend integration.</span>
              </div>
            </div>
          </div>
        </article>

        <article className="admin-panel upcoming-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Upcoming examinations</h3>
              <p>Next scheduled assessments</p>
            </div>
            <CalendarDays size={19} aria-hidden="true" />
          </div>
          <div className="upcoming-list">
            <div className="admin-empty-state">No upcoming examinations available.</div>
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid lower-grid">
        <article className="admin-panel admin-table-panel">
          <div className="admin-panel-heading">
            <div><h3>Recent examinations</h3><p>Connected examination records</p></div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Examination</th><th>Date</th><th>Candidates</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="admin-table-empty" colSpan="4">No examinations available.</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel alerts-panel">
          <div className="admin-panel-heading">
            <div><h3>Recent integrity alerts</h3><p>Connected monitoring events</p></div>
            <AlertTriangle size={19} aria-hidden="true" />
          </div>
          <div className="alert-list">
            <div className="admin-empty-state">No integrity alerts available.</div>
          </div>
          <div className="alerts-footer"><CheckCircle2 size={16} /> Alert data will appear after backend integration.</div>
        </article>
      </section>
    </div>
  )
}

export default AdminDashboard
