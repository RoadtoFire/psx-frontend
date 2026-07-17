import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { confirmPasswordReset } from '../api/auth'
import { AuthCard, Field, Input, Button } from '../components/ui'
import Seo from '../components/Seo'

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
    <AuthCard>
      <Seo title="Reset password" noindex />
      {success ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={26} className="text-brand-400" />
          </div>
          <h1 className="text-white text-xl font-semibold mb-2">Password updated</h1>
          <p className="text-ink-mid text-sm mb-1">Your password has been changed successfully.</p>
          <p className="text-ink-dim text-xs">Redirecting you to sign in…</p>
        </div>
      ) : (
        <>
          <h1 className="text-white text-xl font-semibold mb-2">Set a new password</h1>
          <p className="text-ink-mid text-sm mb-6">Choose a strong password for your Amanat account.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
              {(error.includes('invalid') || error.includes('expired')) && (
                <Link to="/forgot-password" className="block mt-2 text-red-300 underline text-xs">
                  Request a new reset link
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New password" hint="Min 8 chars, not a common word">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={!uid || !token}
              />
            </Field>

            <Field label="Confirm password">
              <Input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="••••••••"
                required
                disabled={!uid || !token}
              />
            </Field>

            <Button type="submit" loading={loading} disabled={!uid || !token} className="w-full" size="lg">
              {loading ? 'Updating…' : 'Update password'}
            </Button>
          </form>

          <p className="text-center mt-6">
            <Link to="/login" className="text-brand-400 hover:text-brand-light text-sm transition-colors">
              ← Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}
