import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const MOCK_OTP = '123456'
const RESEND_DELAY = 30

function OtpVerificationPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const mobile = state?.mobile || 'your registered mobile number'
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [secondsRemaining, setSecondsRemaining] = useState(RESEND_DELAY)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    if (secondsRemaining === 0) return undefined
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsRemaining])

  function updateDigit(index, value) {
    const nextValue = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = nextValue
    setDigits(nextDigits)
    setError('')
    setNotice('')
    if (nextValue && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handlePaste(event) {
    event.preventDefault()
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedDigits) return
    const nextDigits = Array(6).fill('')
    pastedDigits.split('').forEach((digit, index) => { nextDigits[index] = digit })
    setDigits(nextDigits)
    setError('')
    setNotice('')
    inputRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus()
  }

  function handleSubmit(event) {
    event.preventDefault()
    const enteredOtp = digits.join('')
    if (enteredOtp.length !== 6) {
      setError('Enter all six digits to verify your mobile number.')
      return
    }
    if (enteredOtp !== MOCK_OTP) {
      setError('That OTP is not valid. Check the mock code and try again.')
      return
    }
    setNotice('OTP verified successfully.')
    navigate('/candidate/registration-success', { state: { mobile } })
  }

  function handleResend() {
    if (secondsRemaining > 0) return
    setDigits(Array(6).fill(''))
    setSecondsRemaining(RESEND_DELAY)
    setError('')
    setNotice('Mock OTP reset. No SMS was sent.')
    inputRefs.current[0]?.focus()
  }

  return (
    <section className="otp-card auth-card" aria-labelledby="otp-title">
      <div className="otp-icon"><LockKeyhole size={25} aria-hidden="true" /></div>
      <p className="eyebrow">Mobile verification</p>
      <h1 id="otp-title">Verify your mobile number</h1>
      <p className="otp-description">Enter the six-digit OTP for <strong>{mobile}</strong>.</p>
      <form className="otp-form" onSubmit={handleSubmit}>
        <div className="otp-inputs" onPaste={handlePaste} aria-label="Six-digit OTP">
          {digits.map((digit, index) => (
            <input
              aria-label={`OTP digit ${index + 1}`}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              className={error ? 'otp-input otp-input-error' : 'otp-input'}
              inputMode="numeric"
              key={index}
              maxLength={1}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              ref={(element) => { inputRefs.current[index] = element }}
              type="text"
              value={digit}
            />
          ))}
        </div>
        {error && <p className="otp-error" role="alert">{error}</p>}
        {notice && <p className="otp-success" role="status">{notice}</p>}
        <button className="button button-primary form-submit" type="submit">Verify OTP</button>
      </form>
      <div className="resend-row">
        <span>Didn&apos;t receive a code?</span>
        <button className="resend-button" disabled={secondsRemaining > 0} onClick={handleResend} type="button">
          {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend OTP'}
        </button>
      </div>
      <Link className="back-link otp-back" to="/candidate/register">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to registration
      </Link>
    </section>
  )
}

export default OtpVerificationPage
