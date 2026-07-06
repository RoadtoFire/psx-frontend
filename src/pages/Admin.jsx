import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

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
    description: 'Sends WhatsApp notifications for dividends with today\'s ex-date.',
    schedule: 'Daily · 7:00 PM PKT',
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
  if (success === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        No data yet
      </span>
    )
  }
  return success ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      OK
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Failed
    </span>
  )
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Scrape Monitor</h1>
          <p className="text-gray-400 mt-1 text-sm">Last 30 cron runs across all three jobs</p>
        </div>
        <button
          onClick={fetchLogs}
          className="text-xs text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
      </div>

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
          <div className="text-4xl mb-3">⏳</div>
          <p>No cron runs recorded yet.</p>
          <p className="text-sm mt-1 text-gray-600">Trigger a cron job to see its log here.</p>
        </div>
      )}
    </div>
  )
}
