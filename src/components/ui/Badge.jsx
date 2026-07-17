// Signal color system — single source of truth, ported verbatim from Macro's SIG.
export const SIG = {
  GREEN: {
    text: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20', topColor: '#10b981',
    cardBorder: 'border-emerald-500/15', label: 'Green',
  },
  YELLOW: {
    text: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-500/10',
    border: 'border-amber-500/20', topColor: '#f59e0b',
    cardBorder: 'border-amber-500/15', label: 'Yellow',
  },
  RED: {
    text: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/10',
    border: 'border-red-500/20', topColor: '#f43f5e',
    cardBorder: 'border-red-500/15', label: 'Red',
  },
  UNKNOWN: {
    text: 'text-gray-500', dot: 'bg-gray-600', bg: 'bg-gray-800/60',
    border: 'border-gray-700', topColor: '#374151',
    cardBorder: 'border-gray-800', label: 'Unknown',
  },
}

const TONES = {
  brand: 'bg-brand-600/10 text-brand-400 border-brand-600/20',
  red: 'bg-danger/10 text-red-400 border-danger/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  gray: 'bg-gray-800/60 text-gray-400 border-gray-700',
  blue: 'bg-info/10 text-blue-400 border-info/20',
}

export function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function SignalBadge({ signal, label, className = '' }) {
  const s = SIG[signal] || SIG.UNKNOWN
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label ?? s.label}
    </span>
  )
}
