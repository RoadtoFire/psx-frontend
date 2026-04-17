import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../api/auth'
import { useAuth } from '../context/useAuth'

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
      const { getProfile } = await import('../api/auth')
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 overflow-hidden relative">

      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="w-full max-w-md relative z-10 py-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 mb-4">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-none stroke-current" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Amanat
            </span>
            <div className="w-px h-6 bg-gray-600" />
            <span className="text-emerald-400 text-2xl font-bold" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>
              امانت
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Create your free account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-6">Get started</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Confirm</label>
                <input
                  type="password"
                  name="password2"
                  value={form.password2}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">WhatsApp Number <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
                className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600 text-sm"
                placeholder="03001234567"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Tax Filer Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, filer_status: 'filer' })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.filer_status === 'filer'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  ✓ Filer <span className="text-xs opacity-70">(15% tax)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, filer_status: 'non_filer' })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.filer_status === 'non_filer'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Non-Filer <span className="text-xs opacity-70">(30% tax)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-900/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          Pakistan Stock Exchange • Shariah Compliant Stocks Only
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}