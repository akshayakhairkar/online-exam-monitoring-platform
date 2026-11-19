import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail, validateRequired } from '../services/validation'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isLoading) return undefined

    const timer = window.setTimeout(() => {
      setIsLoading(false)
      navigate('/admin/dashboard')
    }, 900)

    return () => window.clearTimeout(timer)
  }, [isLoading, navigate])

  function updateField(event) {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      email: validateEmail(values.email),
      password: validateRequired(values.password, 'Password'),
    }
    const validationErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, error]) => error),
    )

    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setMessage('')
    setIsLoading(true)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-header">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to welcome
        </Link>
        <div className="admin-brand">
          <ShieldCheck size={24} aria-hidden="true" />
          <span>ExamGuard</span>
          <small>ADMIN CONSOLE</small>
        </div>
      </div>

      <main className="admin-login-layout">
        <section className="admin-login-context" aria-labelledby="admin-intro-title">
          <p className="eyebrow">Examination management</p>
          <h1 id="admin-intro-title">A secure command center for trusted assessments.</h1>
          <p>
            Manage examination operations, monitor platform activity, and
            protect assessment integrity from one professional workspace.
          </p>
          <div className="admin-security-note">
            <KeyRound size={18} aria-hidden="true" />
            <span>Authorized administrator access only.</span>
          </div>
        </section>

        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <div className="admin-card-icon">
            <ShieldCheck size={25} aria-hidden="true" />
          </div>
          <div className="admin-form-heading">
            <p className="eyebrow">Administrator sign in</p>
            <h2 id="admin-login-title">Welcome back</h2>
            <p>Sign in to access the ExamGuard administration panel.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@organization.com"
                value={values.email}
                onChange={updateField}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'admin-email-error' : undefined}
              />
              {errors.email && (
                <span id="admin-email-error" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field-group">
              <div className="admin-password-label">
                <label htmlFor="admin-password">Password</label>
                <a href="#forgot-password">Forgot Password?</a>
              </div>
              <div className="password-input">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'admin-password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span id="admin-password-error" className="field-error">
                  {errors.password}
                </span>
              )}
            </div>

            <label className="admin-remember-field">
              <input
                name="rememberMe"
                type="checkbox"
                checked={values.rememberMe}
                onChange={updateField}
              />
              <span>Remember me on this device</span>
            </label>

            {message && <p className="admin-login-message" role="status">{message}</p>}

            <button className="button button-primary admin-login-submit" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Login to Admin Console'
              )}
            </button>
          </form>

          <p className="admin-demo-note">
            Authentication will be connected to the backend in a future integration step.
          </p>
        </section>
      </main>
    </div>
  )
}

export default AdminLoginPage
