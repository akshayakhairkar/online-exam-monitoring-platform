import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { validateEmail, validatePassword } from '../services/validation'

function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    }
    const filteredErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, error]) => error),
    )
    setErrors(filteredErrors)

    if (Object.keys(filteredErrors).length === 0) {
      setMessage('Demo login submitted. Authentication is not connected yet.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-heading">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to welcome
        </Link>
        <div className="auth-brand">
          <ShieldCheck size={23} aria-hidden="true" />
          <span>ExamGuard</span>
        </div>
      </div>

      <section className="auth-card login-card" aria-labelledby="login-title">
        <div className="login-icon">
          <LockKeyhole size={25} aria-hidden="true" />
        </div>
        <div className="form-heading">
          <p className="eyebrow">Candidate portal</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Login to continue to your secure examination experience.</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={values.email}
              onChange={updateField}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={updateField}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {message && <p className="form-message">{message}</p>}

          <button className="button button-primary form-submit" type="submit">
            Candidate Login
          </button>
        </form>

        <p className="auth-switch login-register-link">
          Don&apos;t have an account? <Link to="/candidate/register">Create an account</Link>
        </p>
      </section>
    </div>
  )
}

export default LoginPage
