import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPasswordStrength,
  validateRegistration,
} from '../services/validation'

const initialValues = {
  fullName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

function RegistrationPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const passwordStrength = getPasswordStrength(values.password)

  function updateField(event) {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitMessage('Demo registration accepted. No account has been created.')
    navigate('/candidate/verify-otp', {
      state: { mobile: values.mobile, email: values.email },
    })
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

      <div className="auth-layout">
        <section className="auth-intro">
          <p className="eyebrow">Candidate registration</p>
          <h1>Create your candidate account.</h1>
          <p>
            Set up your secure ExamGuard profile to access online examinations
            and manage your candidate journey.
          </p>
          <div className="auth-trust-note">
            <LockKeyhole size={18} aria-hidden="true" />
            <span>Your details are prepared for a protected exam experience.</span>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="registration-title">
          <div className="form-heading">
            <h2 id="registration-title">Create Candidate Account</h2>
            <p>Register with your details to continue.</p>
          </div>

          <form className="registration-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={values.fullName}
                onChange={updateField}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && <span id="fullName-error" className="field-error">{errors.fullName}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={updateField}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                placeholder="+91 "
                value={values.mobile}
                onChange={updateField}
                aria-invalid={Boolean(errors.mobile)}
                aria-describedby={errors.mobile ? 'mobile-error' : undefined}
              />
              {errors.mobile && <span id="mobile-error" className="field-error">{errors.mobile}</span>}
            </div>

            <PasswordField
              id="password"
              label="Password"
              value={values.password}
              visible={showPassword}
              onChange={updateField}
              onToggle={() => setShowPassword((current) => !current)}
              error={errors.password}
            />
            <div className="password-strength" aria-live="polite">
              <div className="strength-bars">
                {[1, 2, 3].map((bar) => (
                  <span
                    className={bar <= passwordStrength.level ? `strength-${passwordStrength.level}` : ''}
                    key={bar}
                  />
                ))}
              </div>
              <span>{passwordStrength.label}</span>
            </div>

            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              value={values.confirmPassword}
              visible={showConfirmPassword}
              onChange={updateField}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              error={errors.confirmPassword}
            />

            <label className="terms-field">
              <input
                name="terms"
                type="checkbox"
                checked={values.terms}
                onChange={updateField}
              />
              <span className="custom-checkbox" aria-hidden="true">
                <Check size={14} />
              </span>
              <span>
                I agree to the <a href="#terms">Terms and Conditions</a>.
              </span>
            </label>
            {errors.terms && <span className="field-error terms-error">{errors.terms}</span>}

            {submitMessage && <p className="form-message">{submitMessage}</p>}

            <button className="button button-primary form-submit" type="submit">
              Create Account
            </button>
          </form>

          <div className="form-divider"><span>or</span></div>
          <button className="button button-google auth-google" type="button" disabled>
            <Globe2 size={18} aria-hidden="true" />
            Continue with Google
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/candidate/login">Login</Link>
          </p>
        </section>
      </div>
    </div>
  )
}

function PasswordField({ id, label, value, visible, onChange, onToggle, error }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={id === 'password' ? 'new-password' : 'new-password'}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label}` : `Show ${label}`}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  )
}

export default RegistrationPage
