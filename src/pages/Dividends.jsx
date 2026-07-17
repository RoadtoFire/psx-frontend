import { useState, useEffect } from 'react'
import { getDividendIncome, markPurified, getPurificationHistory } from '../api/portfolio'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Check, HandCoins } from 'lucide-react'
import { formatPKR } from '../utils/format'
import { PageHeader, Card, Badge, Skeleton, EmptyState, Table, TableWrap, Th, Td, Tr } from '../components/ui'
import Seo from '../components/Seo'

function SummaryCard({ label, value, sub, color, action }) {
  return (
    <div className="bg-panel/80 backdrop-blur-sm rounded-2xl p-5 border border-edge relative">
      {action && (
        <button
          onClick={action.onClick}
          title={action.label}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-400 hover:bg-brand-600/40 transition-all flex items-center justify-center"
        >
          <Check size={13} />
        </button>
      )}
      <div className={`text-xs font-medium mb-1 uppercase tracking-wider ${color}`}>{label}</div>
      <div className="text-white text-xl font-bold font-mono tabular-nums whitespace-nowrap">{value}</div>
      {sub && <div className="text-ink-dim text-xs mt-1">{sub}</div>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm shadow-2xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-brand-400 font-mono tabular-nums whitespace-nowrap">Net: {formatPKR(payload[0]?.value)}</p>
      <p className="text-ink-mid font-mono tabular-nums whitespace-nowrap">Gross: {formatPKR(payload[1]?.value)}</p>
    </div>
  )
}

export default function Dividends() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
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
      getPurificationHistory().then(setPurificationHistory)
    } catch {
      // silently fail
    }
  }

  const dividends = data?.dividends || []
  const summary = data?.summary

  const isPurified = summary?.total_purification > 0
    && purificationHistory?.total_purified >= summary?.total_purification

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
      <Seo title="Dividend Income" noindex />
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-panel rounded-2xl p-5 border border-edge animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-6 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Seo title="Dividend Income" noindex />
      <PageHeader
        title="Dividend Income"
        subtitle={
          <>
            Complete history with tax & Shariah purification
            <Badge tone="brand" className="ml-2 align-middle">
              {summary?.filer_status === 'filer' ? '15% Tax Filer' : '30% Non-Filer'}
            </Badge>
          </>
        }
      />

      {dividends.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No dividend history yet"
          description="Add transactions to see your dividend income"
        />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Gross"
              value={formatPKR(summary?.total_gross)}
              sub="Before tax"
              color="text-ink-mid"
            />
            <SummaryCard
              label="Tax Deducted"
              value={formatPKR(summary?.total_tax_deducted)}
              sub={`${(summary?.tax_rate * 100).toFixed(0)}% withholding`}
              color="text-red-400"
            />
            <SummaryCard
              label="Purification Due"
              value={isPurified ? 'Rs. 0' : formatPKR(summary?.total_purification)}
              sub={isPurified ? '✓ Marked as given' : 'Give in charity'}
              color="text-amber-400"
              action={!isPurified && summary?.total_purification > 0 ? {
                label: 'Mark as purified',
                onClick: handleMarkPurified
              } : null}
            />
            <SummaryCard
              label="Net Income"
              value={formatPKR(summary?.total_net)}
              sub="After tax & purification"
              color="text-brand-400"
            />
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <Card title="Dividend Income by Year" className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="year" stroke="#1f2937" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} />
                  <YAxis stroke="#1f2937" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="net" radius={[6, 6, 0, 0]} fill="#059669" />
                  <Bar dataKey="gross" radius={[6, 6, 0, 0]} fill="#374151" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Filter by year */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {['all', ...years].map((y) => (
              <button
                key={y}
                onClick={() => setFilter(y)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === y
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'bg-gray-800/70 text-ink-mid hover:text-white border border-edge'
                }`}
              >
                {y === 'all' ? 'All' : y}
              </button>
            ))}
          </div>

          {/* Dividend list */}
          <Card bodyClassName="">
            <TableWrap>
              <Table>
                <thead>
                  <tr className="border-b border-edge">
                    <Th>Stock</Th>
                    <Th>Ex-Date</Th>
                    <Th align="right">Shares</Th>
                    <Th align="right">Per Share</Th>
                    <Th align="right">Gross</Th>
                    <Th align="right">Tax</Th>
                    <Th align="right">Purification</Th>
                    <Th align="right">Net</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {filtered.map((d, i) => (
                    <Tr key={i}>
                      <Td>
                        <div className="text-white font-semibold text-sm">{d.stock}</div>
                        <div className="text-ink-dim text-xs truncate max-w-28">{d.stock_name}</div>
                      </Td>
                      <Td className="text-ink-mid text-sm whitespace-nowrap">{d.ex_date}</Td>
                      <Td align="right" className="text-ink-mid text-sm font-mono tabular-nums whitespace-nowrap">{d.shares_held}</Td>
                      <Td align="right" className="text-ink-mid text-sm font-mono tabular-nums whitespace-nowrap">
                        {d.cash_amount_per_share != null ? `Rs. ${d.cash_amount_per_share}` : '—'}
                      </Td>
                      <Td align="right" className="text-gray-300 text-sm font-mono tabular-nums whitespace-nowrap">{formatPKR(d.gross_dividend)}</Td>
                      <Td align="right" className="text-red-400 text-sm font-mono tabular-nums whitespace-nowrap">-{formatPKR(d.tax_deducted)}</Td>
                      <Td align="right" className="text-amber-400 text-sm font-mono tabular-nums whitespace-nowrap">
                        {d.purification_amount > 0 ? `-${formatPKR(d.purification_amount)}` : (
                          <span className="text-ink-dim text-xs font-sans">Pure ✓</span>
                        )}
                      </Td>
                      <Td align="right" className="text-brand-400 font-semibold text-sm font-mono tabular-nums whitespace-nowrap">
                        {formatPKR(d.final_amount)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
        </>
      )}
    </div>
  )
}
