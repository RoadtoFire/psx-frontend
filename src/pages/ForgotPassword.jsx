import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { requestPasswordReset } from '../api/auth'
import { AuthCard, Field, Input, Button } from '../components/ui'
import Seo from '../components/Seo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestPasswordReset(email)
    } catch {
      // Always show the same message — no user enumeration
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthCard>
      <Seo title="Forgot password" noindex />
      {submitted ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={26} className="text-brand-400" />
          </div>
          <h1 className="text-white text-xl font-semibold mb-2">Check your inbox</h1>
          <p className="text-ink-mid text-sm leading-relaxed mb-6">
            If <span className="text-white">{email}</span> is registered with Amanat, you'll receive a reset link shortly.
          </p>
          <p className="text-ink-dim text-xs mb-6">Didn't get it? Check your spam folder, or wait a minute and try again.</p>
          <Link to="/login" className="inline-block text-brand-400 hover:text-brand-light text-sm transition-colors">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-white text-xl font-semibold mb-2">Forgot your password?</h1>
          <p className="text-ink-mid text-sm mb-6">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p className="text-ink-dim text-sm text-center mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-light transition-colors">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}
