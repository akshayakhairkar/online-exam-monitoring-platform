import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="welcome-page">
      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Trusted examination security</span>
          </div>
          <h1 id="welcome-title">Secure Examinations. Trusted Results.</h1>
          <p className="hero-description">
            ExamGuard provides a secure, reliable candidate experience for
            online examinations, helping institutions protect assessment
            integrity and deliver results they can trust.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/candidate/login">
              Candidate Login
            </Link>
            <Link className="button button-secondary" to="/admin/login">
              Admin Login
            </Link>
          </div>

          <div className="security-note">
            <LockKeyhole size={17} aria-hidden="true" />
            <span>Your examination journey starts in a protected environment.</span>
          </div>
        </div>

        <div className="welcome-panel" aria-label="ExamGuard platform highlights">
          <div className="panel-icon">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <p className="panel-label">Built for confidence</p>
          <h2>Assessment integrity, from sign-in to submission.</h2>
          <ul className="feature-list">
            <li>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Secure candidate access</span>
            </li>
            <li>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Reliable examination experience</span>
            </li>
            <li>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Results institutions can trust</span>
            </li>
          </ul>
        </div>
      </section>

      <footer className="welcome-footer">
        <div className="footer-brand">
          <ShieldCheck size={20} aria-hidden="true" />
          <span>ExamGuard</span>
        </div>
        <p>Secure assessments. Trusted outcomes.</p>
        <span className="footer-legal">© 2026 ExamGuard</span>
      </footer>
    </div>
  )
}

export default HomePage
