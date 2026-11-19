function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="admin-stat-content">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}

export default StatCard
