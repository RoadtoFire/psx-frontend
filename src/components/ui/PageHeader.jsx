export default function PageHeader({ title, subtitle, action, className = 'mb-8' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-mid mt-1 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3 flex-wrap min-w-0">{action}</div>}
    </div>
  )
}
