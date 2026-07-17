const CONTROL =
  'w-full bg-gray-800/50 rounded-xl border border-gray-700/50 px-4 py-2.5 text-sm text-white ' +
  'placeholder:text-ink-dim focus:border-brand-500 focus:outline-none transition-colors'

export function Input({ className = '', ...props }) {
  return <input className={`${CONTROL} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${CONTROL} appearance-none ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-ink-mid uppercase tracking-wider">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-ink-dim">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
