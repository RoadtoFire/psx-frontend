import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { User, Mail, Phone, Shield, Check } from 'lucide-react'
import api from '../api/axios'
import { PageHeader, Card, Badge, Button, Field, Input } from '../components/ui'
import Seo from '../components/Seo'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username || '',
    whatsapp_number: user?.whatsapp_number || '',
    filer_status: user?.filer_status || 'filer',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.patch('/api/v1/auth/profile/', form)
      setUser({ ...user, ...res.data })
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Seo title="Profile" noindex />
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      {/* Avatar + name */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-brand-600/25">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-xl font-bold">{user?.username}</div>
            <div className="text-ink-mid text-sm">{user?.email}</div>
            <div className="mt-1.5">
              <Badge tone={user?.filer_status === 'filer' ? 'brand' : 'amber'}>
                {user?.filer_status === 'filer' && <Check size={12} />}
                {user?.filer_status === 'filer' ? 'Tax Filer (15%)' : 'Non-Filer (30%)'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Account Details"
        bodyClassName={editing ? 'p-6' : ''}
        action={!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-brand-400 hover:text-brand-light text-sm font-medium transition-colors"
          >
            Edit
          </button>
        )}
      >
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username">
              <Input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp Number">
              <Input
                type="text"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="03001234567"
              />
            </Field>
            <Field label="Tax Filer Status">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'filer', label: 'Filer (15% tax)' },
                  { value: 'non_filer', label: 'Non-Filer (30% tax)' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, filer_status: value })}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      form.filer_status === value
                        ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-ink-mid hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="divide-y divide-edge">
            {[
              { icon: User, label: 'Username', value: user?.username },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Phone, label: 'WhatsApp', value: user?.whatsapp_number || 'Not set' },
              { icon: Shield, label: 'Tax Status', value: user?.filer_status === 'filer' ? 'Filer (15% withholding tax)' : 'Non-Filer (30% withholding tax)' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-ink-mid" />
                </div>
                <div>
                  <div className="text-ink-dim text-xs">{label}</div>
                  <div className="text-white text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
