import { useState, useEffect, useCallback } from 'react'
import { Hourglass, Plus, Pencil, Trash2, Send, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '../api/axios'
import { setForwardPE } from '../api/macro'
import { adminGetPosts, adminCreatePost, adminUpdatePost, adminDeletePost, adminPublishPost } from '../api/blog'
import { PageHeader, Button, SignalBadge } from '../components/ui'
import Seo from '../components/Seo'

const JOB_META = {
  update_prices: {
    label: 'Price Update',
    description: 'Fetches latest closing prices for all 310 KMI stocks from PSX.',
    schedule: 'Daily · 6:00 PM PKT',
  },
  update_dividends: {
    label: 'Dividend Scrape',
    description: 'Checks for new dividend announcements and bonus share ratios.',
    schedule: 'Daily · 6:30 PM PKT',
  },
  process_notifications: {
    label: 'Notifications',
    description: "Sends WhatsApp notifications for dividends with today's ex-date.",
    schedule: 'Daily · 7:00 PM PKT',
  },
  update_macro: {
    label: 'Macro Update',
    description: 'Scrapes KIBOR, PKR/USD, FX reserves, CPI, and Brent crude. Computes ERP and macro stress signals.',
    schedule: 'Daily · 7:30 PM PKT',
  },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function StatusPill({ success }) {
  if (success === null) return <SignalBadge signal="YELLOW" label="No data yet" />
  return success
    ? <SignalBadge signal="GREEN" label="OK" />
    : <SignalBadge signal="RED" label="Failed" />
}

function JobCard({ jobName, lastRun }) {
  const [expanded, setExpanded] = useState(false)
  const meta = JOB_META[jobName]

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${
      lastRun === null
        ? 'bg-gray-900/40 border-gray-800/60'
        : lastRun.success
          ? 'bg-gray-900/60 border-gray-800/80'
          : 'bg-red-950/20 border-red-900/40'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-white font-semibold text-base">{meta.label}</div>
          <div className="text-gray-500 text-xs mt-0.5">{meta.description}</div>
        </div>
        <StatusPill success={lastRun?.success ?? null} />
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span>
          <span className="text-gray-400">Last run:</span>{' '}
          {lastRun ? (
            <span className="text-white font-medium tabular-nums">{timeAgo(lastRun.ran_at)}</span>
          ) : (
            <span className="text-gray-600">never</span>
          )}
        </span>
        {lastRun?.duration_seconds != null && (
          <span>
            <span className="text-gray-400">Duration:</span>{' '}
            <span className="tabular-nums">{lastRun.duration_seconds}s</span>
          </span>
        )}
        <span>
          <span className="text-gray-400">Schedule:</span>{' '}
          <span>{meta.schedule}</span>
        </span>
      </div>

      {lastRun?.output && (
        <div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-1.5"
          >
            {expanded ? '▲ Hide output' : '▼ Show output'}
          </button>
          {expanded && (
            <pre className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
              {lastRun.output}
            </pre>
          )}
          {!expanded && (
            <div className="bg-gray-950/60 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate">
              {lastRun.output.split('\n').filter(Boolean).slice(-1)[0] || '—'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const meta = JOB_META[log.name] || { label: log.name }

  return (
    <>
      <tr
        className={`border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/20 transition-colors ${
          !log.success ? 'bg-red-950/10' : ''
        }`}
        onClick={() => setExpanded(v => !v)}
      >
        <td className="py-3 px-4 text-sm">
          <StatusPill success={log.success} />
        </td>
        <td className="py-3 px-4 text-sm text-white font-medium">{meta.label}</td>
        <td className="py-3 px-4 text-sm text-gray-400 tabular-nums whitespace-nowrap">
          {new Date(log.ran_at).toLocaleString('en-PK', {
            dateStyle: 'medium', timeStyle: 'short',
          })}
        </td>
        <td className="py-3 px-4 text-sm text-gray-500 tabular-nums">
          {log.duration_seconds != null ? `${log.duration_seconds}s` : '—'}
        </td>
        <td className="py-3 px-4 text-xs text-gray-600 font-mono truncate max-w-xs">
          {log.output.split('\n').filter(Boolean).slice(-1)[0] || '—'}
        </td>
      </tr>
      {expanded && log.output && (
        <tr className="bg-gray-950/60">
          <td colSpan={5} className="px-4 pb-3 pt-0">
            <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto bg-gray-950 border border-gray-800 rounded-xl p-3">
              {log.output}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}

function ForwardPEPanel() {
  const [pe, setPe] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const val = parseFloat(pe)
    if (!pe || isNaN(val) || val <= 0) {
      setError('Enter a positive number, e.g. 7.2')
      return
    }
    setSaving(true)
    setError('')
    try {
      await setForwardPE(val)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Check the value and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="mb-4">
        <div className="text-white font-semibold text-base">KSE-100 Forward PE</div>
        <div className="text-gray-500 text-xs mt-0.5">
          Set from broker consensus weekly. Drives the ERP signal on the Macro tab for all users.
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={pe}
          onChange={e => { setPe(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="e.g. 7.2"
          className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm font-mono w-36 focus:outline-none focus:border-brand-500 tabular-nums"
        />
        <Button onClick={handleSave} loading={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {saved && (
          <span className="text-brand-400 text-sm font-medium">Saved</span>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}

// ── Blog Manager ──────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', excerpt: '', featured_image_url: '', content: '' }

function PostStatusBadge({ status }) {
  return status === 'published'
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 border border-brand-600/20 font-medium">Published</span>
    : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-ink-dim border border-edge font-medium">Draft</span>
}

function BlogEditor({ post, onSave, onBack }) {
  const isNew = !post
  const [form, setForm] = useState(isNew ? EMPTY_FORM : {
    title: post.title,
    excerpt: post.excerpt,
    featured_image_url: post.featured_image_url || '',
    content: post.content,
  })
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState(null)  // { type: 'save'|'publish', message }
  const [error, setError] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = isNew
        ? await adminCreatePost(form)
        : await adminUpdatePost(post.slug, form)
      setResult({ type: 'save', message: 'Draft saved.' })
      onSave(saved)
    } catch {
      setError('Failed to save. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (sendEmail) => {
    if (!post?.slug && !form.title.trim()) {
      setError('Save the post first before publishing.')
      return
    }
    setPublishing(true)
    setError('')
    try {
      // If new or unsaved changes, save first
      let slug = post?.slug
      if (!slug || hasChanges()) {
        const saved = await (slug
          ? adminUpdatePost(slug, form)
          : adminCreatePost(form))
        slug = saved.slug
        onSave(saved)
      }
      const res = await adminPublishPost(slug, sendEmail)
      const msg = sendEmail && res.email_sent
        ? `Published and emailed ${res.recipients} users.`
        : 'Published (no email sent).'
      setResult({ type: 'publish', message: msg })
      onSave({ ...post, status: 'published', slug })
    } catch {
      setError('Publish failed. Try again.')
    } finally {
      setPublishing(false)
    }
  }

  const hasChanges = () => {
    if (!post) return true
    return (
      form.title !== post.title ||
      form.excerpt !== post.excerpt ||
      form.featured_image_url !== (post.featured_image_url || '') ||
      form.content !== post.content
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-ink-dim hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          All posts
        </button>
        {post && <PostStatusBadge status={post.status} />}
        {post?.email_sent && (
          <span className="text-xs text-ink-dim flex items-center gap-1">
            <CheckCircle size={12} className="text-brand-400" /> Email sent
          </span>
        )}
      </div>

      {result && (
        <div className={`rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2 ${
          result.type === 'publish'
            ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
            : 'bg-gray-800 text-ink-mid border border-edge'
        }`}>
          <CheckCircle size={14} />
          {result.message}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="Article title…"
        className="w-full bg-transparent text-white text-2xl font-bold placeholder:text-gray-700 border-none outline-none mb-4"
      />

      {/* Excerpt */}
      <textarea
        value={form.excerpt}
        onChange={e => set('excerpt', e.target.value)}
        placeholder="Short excerpt shown in cards and emails (1–3 sentences)…"
        rows={2}
        className="w-full bg-gray-900/60 border border-edge rounded-xl px-4 py-3 text-ink-mid text-sm placeholder:text-gray-700 focus:outline-none focus:border-brand-500 resize-none mb-3"
      />

      {/* Featured image URL */}
      <input
        type="url"
        value={form.featured_image_url}
        onChange={e => set('featured_image_url', e.target.value)}
        placeholder="Featured image URL (paste from Cloudinary, Imgur, etc.) — optional"
        className="w-full bg-gray-900/60 border border-edge rounded-xl px-4 py-3 text-ink-mid text-sm placeholder:text-gray-700 focus:outline-none focus:border-brand-500 mb-4"
      />
      {form.featured_image_url && (
        <div className="mb-4 rounded-xl overflow-hidden aspect-[16/9] bg-gray-800 max-w-sm">
          <img src={form.featured_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Editor / Preview toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setPreview(false)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            !preview ? 'bg-gray-800 text-white' : 'text-ink-dim hover:text-white'
          }`}
        >
          <Pencil size={13} />
          Write
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            preview ? 'bg-gray-800 text-white' : 'text-ink-dim hover:text-white'
          }`}
        >
          <Eye size={13} />
          Preview
        </button>
        <span className="text-ink-dim text-xs ml-2">Supports Markdown</span>
      </div>

      {preview ? (
        <div className="bg-gray-900/40 border border-edge rounded-2xl p-6 min-h-64 blog-content mb-4">
          {form.content
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            : <p className="text-ink-dim italic">Nothing to preview yet.</p>
          }
        </div>
      ) : (
        <textarea
          value={form.content}
          onChange={e => set('content', e.target.value)}
          placeholder={`Write your article in Markdown…\n\n## Heading\n\nParagraph text here.\n\n- Bullet point\n\n![Image alt](https://your-image-url.com/photo.jpg)`}
          rows={20}
          className="w-full bg-gray-900/40 border border-edge rounded-2xl px-5 py-4 text-ink-mid text-sm font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-500 resize-y mb-4 leading-relaxed"
        />
      )}

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} loading={saving} variant="secondary">
          {saving ? 'Saving…' : 'Save draft'}
        </Button>

        {(!post || post.status === 'draft') && (
          <>
            <Button onClick={() => handlePublish(true)} loading={publishing}>
              {publishing ? 'Publishing…' : 'Publish & email users'}
            </Button>
            <Button onClick={() => handlePublish(false)} loading={publishing} variant="secondary">
              Publish (no email)
            </Button>
          </>
        )}
        {post?.status === 'published' && !post?.email_sent && (
          <Button onClick={() => handlePublish(true)} loading={publishing}>
            <Send size={14} />
            {publishing ? 'Sending…' : 'Send email to users'}
          </Button>
        )}
      </div>
    </div>
  )
}

function BlogManager() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')   // 'list' | 'editor'
  const [editing, setEditing] = useState(null)   // null = new post

  const fetchPosts = useCallback(async () => {
    try {
      const data = await adminGetPosts()
      setPosts(data)
    } catch {
      // silently fail — if user isn't staff the whole section won't render
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const openEditor = (post = null) => {
    setEditing(post)
    setView('editor')
  }

  const handleSave = (saved) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.slug === saved.slug)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setEditing(saved)
  }

  const handleDelete = async (slug) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await adminDeletePost(slug)
      setPosts(prev => prev.filter(p => p.slug !== slug))
      if (editing?.slug === slug) setView('list')
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Blog</h2>
        {view === 'list' && (
          <Button size="sm" onClick={() => openEditor(null)}>
            <Plus size={14} />
            New post
          </Button>
        )}
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        {view === 'editor' ? (
          <BlogEditor
            post={editing}
            onSave={handleSave}
            onBack={() => { setView('list'); fetchPosts() }}
          />
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1].map(i => (
              <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-ink-dim">
            <p className="mb-3">No posts yet.</p>
            <Button size="sm" onClick={() => openEditor(null)}>
              <Plus size={14} />
              Write your first post
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div
                key={post.slug}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-medium truncate">{post.title}</span>
                    <PostStatusBadge status={post.status} />
                  </div>
                  <div className="text-ink-dim text-xs mt-0.5">
                    {post.status === 'published'
                      ? new Date(post.published_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })
                      : `Created ${new Date(post.created_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })}`
                    }
                    {post.email_sent && <span className="ml-2 text-brand-400">· emailed</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditor(post)}
                    className="p-2 rounded-lg text-ink-dim hover:text-white hover:bg-gray-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="p-2 rounded-lg text-ink-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(Date.now())

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/admin/cron-logs/')
      setLogs(Array.isArray(res.data) ? res.data : (res.data.results || []))
      setError('')
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access required.' : 'Failed to load logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Tick relative times every 30s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  // Build "latest per job" lookup
  const latest = {}
  for (const log of logs) {
    if (!latest[log.name]) latest[log.name] = log
  }

  return (
    <div className="max-w-5xl mx-auto" key={now}>
      <Seo title="Scrape Monitor" noindex />
      <PageHeader
        title="Scrape Monitor"
        subtitle="Last 30 cron runs across all three jobs"
        className="mb-6"
        action={
          <Button variant="secondary" size="sm" onClick={fetchLogs}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Status cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Object.keys(JOB_META).map(jobName => (
            <JobCard key={jobName} jobName={jobName} lastRun={latest[jobName] || null} />
          ))}
        </div>
      )}

      {/* History table */}
      {!loading && logs.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Run history</h2>
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Job</th>
                    <th className="py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Ran at</th>
                    <th className="py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Duration</th>
                    <th className="py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Last line</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <HistoryRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-2 text-center">Click any row to expand the full output</p>
        </div>
      )}

      {!loading && logs.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          <Hourglass size={36} className="mx-auto mb-3 text-ink-dim" />
          <p>No cron runs recorded yet.</p>
          <p className="text-sm mt-1 text-gray-600">Trigger a cron job to see its log here.</p>
        </div>
      )}

      {/* Forward PE panel */}
      <div className="mt-8">
        <h2 className="text-white font-semibold mb-3">Market Data</h2>
        <ForwardPEPanel />
      </div>

      {/* Blog manager */}
      <div className="mt-8">
        <BlogManager />
      </div>
    </div>
  )
}
