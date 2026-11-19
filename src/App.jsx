import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminModulePlaceholderPage from './pages/AdminModulePlaceholderPage'
import AdminWorkspacePage from './pages/AdminWorkspacePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OtpVerificationPage from './pages/OtpVerificationPage'
import RegistrationPage from './pages/RegistrationPage'
import RegistrationSuccessPage from './pages/RegistrationSuccessPage'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminWorkspacePage />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="exams" element={<AdminModulePlaceholderPage />} />
              <Route path="candidates" element={<AdminModulePlaceholderPage />} />
              <Route path="monitoring" element={<AdminModulePlaceholderPage />} />
              <Route path="alerts" element={<AdminModulePlaceholderPage />} />
              <Route path="reports" element={<AdminModulePlaceholderPage />} />
            </Route>
            <Route path="/candidate/register" element={<RegistrationPage />} />
            <Route path="/candidate/login" element={<LoginPage />} />
            <Route
              path="/candidate/verify-otp"
              element={<OtpVerificationPage />}
            />
            <Route
              path="/candidate/registration-success"
              element={<RegistrationSuccessPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
