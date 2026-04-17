import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { User, Mail, Phone, Shield, CheckCircle } from 'lucide-react'
import api from '../api/axios'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username || '',
    whatsapp_number: user?.whatsapp_number || '',
    filer_status: user?.filer_status || 'filer',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.patch('/api/v1/auth/profile/', form)
      setUser({ ...user, ...res.data })
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-xl font-bold">{user?.username}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              user?.filer_status === 'filer'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/20'
                : 'bg-amber-600/20 text-amber-400 border border-amber-600/20'
            }`}>
              {user?.filer_status === 'filer' ? '✓ Tax Filer (15%)' : 'Non-Filer (30%)'}
            </div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          Profile updated successfully
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Details */}
      <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Account Details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm"
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
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                  }`}
                >
                  ✓ Filer (15% tax)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, filer_status: 'non_filer' })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.filer_status === 'non_filer'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
                  }`}
                >
                  Non-Filer (30% tax)
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-semibold rounded-xl py-3 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="divide-y divide-gray-800">
            {[
              { icon: User, label: 'Username', value: user?.username },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Phone, label: 'WhatsApp', value: user?.whatsapp_number || 'Not set' },
              { icon: Shield, label: 'Tax Status', value: user?.filer_status === 'filer' ? 'Filer (15% withholding tax)' : 'Non-Filer (30% withholding tax)' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-gray-400" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">{label}</div>
                  <div className="text-white text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}