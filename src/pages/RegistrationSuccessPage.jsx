import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function RegistrationSuccessPage() {
  const { state } = useLocation()
  return (
    <section className="otp-card auth-card success-card" aria-labelledby="success-title">
      <div className="success-icon"><CheckCircle2 size={30} aria-hidden="true" /></div>
      <p className="eyebrow">Registration complete</p>
      <h1 id="success-title">You are ready to continue.</h1>
      <Link className="button button-primary form-submit" to="/">Return to ExamGuard</Link>
    </section>
  )
}

export default RegistrationSuccessPage
