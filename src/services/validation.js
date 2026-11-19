export function validateRequired(value, label) {
  return value.trim() ? '' : `${label} is required.`
}

export function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? ''
    : 'Enter a valid email address.'
}

export function validateMobile(value) {
  if (!value.trim()) return 'Mobile number is required.'
  return /^\+?[0-9\s()-]{10,15}$/.test(value.trim())
    ? ''
    : 'Enter a valid mobile number.'
}

export function getPasswordStrength(password) {
  if (!password) return { label: 'Enter a password', level: 0 }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: 'Weak password', level: 1 }
  if (score <= 4) return { label: 'Good password', level: 2 }
  return { label: 'Strong password', level: 3 }
}

export function validatePassword(value) {
  if (!value) return 'Password is required.'
  return value.length >= 8
    ? ''
    : 'Password must be at least 8 characters.'
}

export function validateRegistration(values) {
  const errors = {
    fullName: validateRequired(values.fullName, 'Full name'),
    email: validateEmail(values.email),
    mobile: validateMobile(values.mobile),
    password: validatePassword(values.password),
    confirmPassword: values.confirmPassword
      ? values.password === values.confirmPassword
        ? ''
        : 'Passwords do not match.'
      : 'Please confirm your password.',
    terms: values.terms ? '' : 'Accept the Terms and Conditions to continue.',
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  )
}
