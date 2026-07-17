import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { register, login, getProfile, googleAuth } from '../api/auth'
import { useAuth } from '../context/useAuth'
import { AuthCard, Field, Input, Button } from '../components/ui'
import Seo from '../components/Seo'

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    filer_status: 'filer',
    whatsapp_number: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
      await login(form.email, form.password)
      const user = await getProfile()
      setUser(user)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const firstError = Object.values(data)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Get started"
      subtitle="Create your free account"
      footer={<span className="text-ink-dim text-xs">Pakistan Stock Exchange • Shariah Compliant Stocks Only</span>}
    >
      <Seo
        title="Create your free account"
        description="Create a free Amanat account to track your PSX portfolio, dividends, and Shariah purification automatically."
        path="/register"
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
          text="signup_with"
          width="320"
        />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-ink-dim text-xs">or register with email</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Username">
            <Input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" hint="Min 8 chars, not a common word">
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </Field>
          <Field label="Confirm">
            <Input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </Field>
        </div>

        <Field label={<>WhatsApp Number <span className="text-ink-dim normal-case">(optional)</span></>}>
          <Input
            type="text"
            name="whatsapp_number"
            value={form.whatsapp_number}
            onChange={handleChange}
            placeholder="03001234567"
          />
        </Field>

        <Field label="Tax Filer Status">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'filer', label: 'Filer', sub: '(15% tax)' },
              { value: 'non_filer', label: 'Non-Filer', sub: '(30% tax)' },
            ].map(({ value, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, filer_status: value })}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.filer_status === value
                    ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                    : 'bg-gray-800/50 border-gray-700/50 text-ink-mid hover:border-gray-600'
                }`}
              >
                {label} <span className="text-xs opacity-70">{sub}</span>
              </button>
            ))}
          </div>
        </Field>

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-ink-dim text-sm text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-light transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
