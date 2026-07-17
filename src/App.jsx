// AI tools (Claude/ChatGPT) were used to assist with boilerplate
// and code generation throughout this project.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Stocks from './pages/Stocks'
import Learn from './pages/Learn'
import Dividends from './pages/Dividends'
import Portfolio from './pages/Portfolio'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import Macro from './pages/Macro'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (!user.is_staff) return <Navigate to="/dashboard" />
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <BrowserRouter>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />
        <Route path="/dividends" element={
          <ProtectedRoute>
            <Dividends />
          </ProtectedRoute>
        } />
        <Route path="/stocks" element={
          <ProtectedRoute>
            <Stocks />
          </ProtectedRoute>
        } />
        {/* Public: indexable Shariah education content; Layout shows a sign-in CTA when logged out */}
        <Route path="/learn" element={
          <Layout>
            <Learn />
          </Layout>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/macro" element={
          <ProtectedRoute>
            <Macro />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
