import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { confirmPasswordReset } from '../api/auth'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (!uid || !token) {
      setError('This reset link is invalid. Please request a new one.')
    }
  }, [uid, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await confirmPasswordReset(uid, token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please request a new reset link.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 mb-4">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-none stroke-current" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-white text-2xl font-bold">Amanat</span>
            <div className="w-px h-6 bg-gray-600" />
            <span className="text-emerald-400 text-2xl font-bold" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>امانت</span>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-400 fill-none stroke-current" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Password updated</h2>
              <p className="text-gray-400 text-sm mb-1">Your password has been changed successfully.</p>
              <p className="text-gray-600 text-xs">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h2 className="text-white text-xl font-semibold mb-2">Set a new password</h2>
              <p className="text-gray-400 text-sm mb-6">Choose a strong password for your Amanat account.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                  {(error.includes('invalid') || error.includes('expired')) && (
                    <Link to="/forgot-password" className="block mt-2 text-red-300 underline text-xs">
                      Request a new reset link
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600"
                    placeholder="••••••••"
                    required
                    disabled={!uid || !token}
                  />
                  <p className="text-gray-600 text-xs mt-1.5">Min 8 chars, not a common word</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Confirm password</label>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600"
                    placeholder="••••••••"
                    required
                    disabled={!uid || !token}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !uid || !token}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-900/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Updating...
                    </span>
                  ) : 'Update password'}
                </button>
              </form>

              <p className="text-gray-500 text-sm text-center mt-6">
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}
