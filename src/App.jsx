import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Stocks from './pages/Stocks'
import Learn from './pages/Learn'
import Dividends from './pages/Dividends'
import Portfolio from './pages/Portfolio'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/learn" element={
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App