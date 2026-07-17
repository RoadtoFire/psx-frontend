import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login, getProfile, googleAuth } from '../api/auth'
import { useAuth } from '../context/useAuth'
import { AuthCard, Field, Input, Button } from '../components/ui'
import Seo from '../components/Seo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const user = await getProfile()
      setUser(user)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      await googleAuth(credentialResponse.credential)
      const user = await getProfile()
      setUser(user)
      navigate('/dashboard')
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Shariah-compliant portfolio"
      footer={<span className="text-ink-dim text-xs">Pakistan Stock Exchange • Shariah Compliant Stocks Only</span>}
    >
      <Seo
        title="Sign in"
        description="Sign in to Amanat — the free Shariah-compliant PSX portfolio tracker for Pakistani investors."
        path="/login"
      />
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-5">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed. Please try again.')}
          theme="filled_black"
          shape="rectangular"
          text="signin_with"
          width="320"
        />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-ink-dim text-xs">or continue with email</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-mid uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-brand-500 hover:text-brand-400 text-xs transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-ink-dim text-sm text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-light transition-colors">
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}
