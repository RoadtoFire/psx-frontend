import { useState, useEffect } from 'react'
import { getDividendIncome, markPurified, getPurificationHistory } from '../api/portfolio'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function formatPKR(amount) {
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`
  return `Rs. ${amount?.toFixed(2)}`
}

function SummaryCard({ label, value, sub, color, action }) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-800 relative">
      {action && (
        <button
          onClick={action.onClick}
          title={action.label}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/40 transition-all flex items-center justify-center text-xs"
        >
          ✓
        </button>
      )}
      <div className={`text-xs font-medium mb-1 ${color}`}>{label}</div>
      <div className="text-white text-xl font-bold">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dividends() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [purified, setPurified] = useState(false)
  const [purificationHistory, setPurificationHistory] = useState(null)  

  useEffect(() => {
    getDividendIncome()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
  getPurificationHistory().then(setPurificationHistory)
}, [])

const handleMarkPurified = async () => {
  if (!summary?.total_purification) return
  try {
    const today = new Date().toISOString().split('T')[0]
    await markPurified(summary.total_purification, today)
    setPurified(true)
    getPurificationHistory().then(setPurificationHistory)
  } catch {
    // silently fail
  }
}
  
  const dividends = data?.dividends || []
  const summary = data?.summary

  // Group by year for chart
  const byYear = dividends.reduce((acc, d) => {
    const year = d.ex_date?.split('-')[0]
    if (!year) return acc
    if (!acc[year]) acc[year] = { year, gross: 0, net: 0, purification: 0 }
    acc[year].gross += d.gross_dividend
    acc[year].net += d.final_amount
    acc[year].purification += d.purification_amount
    return acc
  }, {})

  const chartData = Object.values(byYear).sort((a, b) => a.year - b.year)

  // Filter
  const filtered = filter === 'all'
    ? dividends
    : dividends.filter(d => d.ex_date?.startsWith(filter))

  const years = [...new Set(dividends.map(d => d.ex_date?.split('-')[0]).filter(Boolean))].sort().reverse()

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
        <p className="text-white font-semibold mb-1">{label}</p>
        <p className="text-emerald-400">Net: {formatPKR(payload[0]?.value)}</p>
        <p className="text-gray-400">Gross: {formatPKR(payload[1]?.value)}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-800 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-6 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dividend Income</h1>
        <p className="text-gray-400 mt-1">
          Complete history with tax & Shariah purification
          <span className="ml-2 text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-600/20">
            {summary?.filer_status === 'filer' ? '15% Tax Filer' : '30% Non-Filer'}
          </span>
        </p>
      </div>

      {dividends.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-white font-semibold mb-2">No dividend history yet</h3>
          <p className="text-gray-400 text-sm">Add transactions to see your dividend income</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Gross"
              value={formatPKR(summary?.total_gross)}
              sub="Before tax"
              color="text-gray-400"
            />
            <SummaryCard
              label="Tax Deducted"
              value={formatPKR(summary?.total_tax_deducted)}
              sub={`${(summary?.tax_rate * 100).toFixed(0)}% withholding`}
              color="text-red-400"
            />
            <SummaryCard
              label="Purification Due"
              value={purified ? 'Rs. 0' : formatPKR(summary?.total_purification)}
              sub={purified
                ? `✓ Marked as given`
                : 'Give in charity'
              }
              color="text-amber-400"
              action={!purified && summary?.total_purification > 0 ? {
                label: 'Mark as purified',
                onClick: handleMarkPurified
              } : null}
            />
            <SummaryCard
              label="Net Income"
              value={formatPKR(summary?.total_net)}
              sub="After tax & purification"
              color="text-emerald-400"
            />
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6 mb-6">
              <h2 className="text-white font-semibold mb-4">Dividend Income by Year</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="year" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }}
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="net" radius={[6, 6, 0, 0]} fill="#059669" />
                  <Bar dataKey="gross" radius={[6, 6, 0, 0]} fill="#374151" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Filter by year */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {years.map(y => (
              <button
                key={y}
                onClick={() => setFilter(y)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === y
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Dividend list */}
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="px-6 py-3 text-left">Stock</th>
                    <th className="px-6 py-3 text-left">Ex-Date</th>
                    <th className="px-6 py-3 text-right">Shares</th>
                    <th className="px-6 py-3 text-right">Per Share</th>
                    <th className="px-6 py-3 text-right">Gross</th>
                    <th className="px-6 py-3 text-right">Tax</th>
                    <th className="px-6 py-3 text-right">Purification</th>
                    <th className="px-6 py-3 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold text-sm">{d.stock}</div>
                        <div className="text-gray-500 text-xs truncate max-w-28">{d.stock_name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{d.ex_date}</td>
                      <td className="px-6 py-4 text-right text-gray-400 text-sm">{d.shares_held}</td>
                      <td className="px-6 py-4 text-right text-gray-400 text-sm">Rs. {d.cash_amount_per_share}</td>
                      <td className="px-6 py-4 text-right text-gray-300 text-sm">{formatPKR(d.gross_dividend)}</td>
                      <td className="px-6 py-4 text-right text-red-400 text-sm">-{formatPKR(d.tax_deducted)}</td>
                      <td className="px-6 py-4 text-right text-amber-400 text-sm">
                        {d.purification_amount > 0 ? `-${formatPKR(d.purification_amount)}` : (
                          <span className="text-gray-600 text-xs">Pure ✓</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-semibold text-sm">
                        {formatPKR(d.final_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}