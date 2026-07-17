import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, positive, icon: Icon, tone = 'brand' }) {
  const chip = {
    brand: 'bg-brand-600/15 text-brand-400 border-brand-600/20',
    red: 'bg-danger/15 text-red-400 border-danger/20',
    purple: 'bg-purple-600/15 text-purple-400 border-purple-600/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    gray: 'bg-gray-700/30 text-gray-400 border-gray-700/40',
  }[tone]

  return (
    <div className="bg-panel/80 rounded-2xl p-5 sm:p-6 border border-edge min-w-[200px] md:min-w-0">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${chip}`}>
          <Icon size={19} />
        </div>
        {positive !== undefined && (
          <span className={`text-sm font-medium flex items-center gap-1 ${positive ? 'text-brand-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1 font-mono tabular-nums">{value}</div>
      <div className="text-ink-mid text-sm">{title}</div>
      {subtitle && <div className="text-ink-dim text-xs mt-1">{subtitle}</div>}
    </div>
  )
}
