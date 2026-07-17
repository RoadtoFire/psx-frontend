import { useState, useEffect } from 'react'
import { getPortfolioValue } from '../api/portfolio'
import { useAuth } from '../context/useAuth'
import { TrendingUp, TrendingDown, Wallet, BarChart2, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPKR } from '../utils/format'
import { PageHeader, StatCard, Card, SkeletonCard, EmptyState, Button, Table, TableWrap, Th, Td, Tr } from '../components/ui'
import Seo from '../components/Seo'

export default function Dashboard() {
  const { user } = useAuth()
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortfolioValue()
      .then(setPortfolioData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const summary = portfolioData?.summary
  const holdings = portfolioData?.holdings || []

  return (
    <div className="max-w-6xl mx-auto">
      <Seo title="Dashboard" noindex />
      <PageHeader
        title={`Assalam o Alaikum, ${user?.username ?? ''}`}
        subtitle="Here's your portfolio overview"
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
            <StatCard
              title="Portfolio Value"
              value={formatPKR(summary?.total_current_value)}
              subtitle="Current market value"
              icon={BarChart2}
            />
            <StatCard
              title="Total Invested"
              value={formatPKR(summary?.total_cost_basis)}
              subtitle="Cost basis"
              icon={Wallet}
            />
            <StatCard
              title="Total P&L"
              value={<>{summary?.total_pnl >= 0 ? '+' : ''}{formatPKR(summary?.total_pnl)}</>}
              subtitle={`${summary?.total_pnl_pct?.toFixed(2)}% return`}
              positive={summary?.total_pnl >= 0}
              icon={summary?.total_pnl >= 0 ? TrendingUp : TrendingDown}
              tone={summary?.total_pnl >= 0 ? 'brand' : 'red'}
            />
            <StatCard
              title="Holdings"
              value={holdings.length}
              subtitle="Active positions"
              icon={Layers}
              tone="purple"
            />
          </div>

          {/* Holdings table */}
          {holdings.length > 0 ? (
            <Card
              title="Your Holdings"
              bodyClassName=""
              action={
                <Link to="/portfolio" className="text-brand-400 text-sm hover:text-brand-light transition-colors">
                  Manage →
                </Link>
              }
            >
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th>Stock</Th>
                      <Th align="right">Shares</Th>
                      <Th align="right">Avg Buy</Th>
                      <Th align="right">Current</Th>
                      <Th align="right">Value</Th>
                      <Th align="right">P&L</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge">
                    {holdings.map((h) => (
                      <Tr key={h.stock}>
                        <Td>
                          <div className="font-semibold text-white">{h.stock}</div>
                          <div className="text-ink-dim text-xs truncate max-w-32">{h.stock_name}</div>
                        </Td>
                        <Td align="right" className="text-gray-300 font-mono tabular-nums whitespace-nowrap">{h.shares}</Td>
                        <Td align="right" className="text-gray-300 font-mono tabular-nums whitespace-nowrap">Rs. {h.avg_buy_price}</Td>
                        <Td align="right" className="text-gray-300 font-mono tabular-nums whitespace-nowrap">Rs. {h.current_price}</Td>
                        <Td align="right" className="text-white font-medium font-mono tabular-nums whitespace-nowrap">{formatPKR(h.current_value)}</Td>
                        <Td align="right">
                          <span className={`font-medium font-mono tabular-nums whitespace-nowrap ${h.pnl >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                            {h.pnl >= 0 ? '+' : ''}{formatPKR(h.pnl)}
                            <span className="text-xs ml-1 opacity-70">({h.pnl_pct}%)</span>
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            </Card>
          ) : (
            <EmptyState
              icon={BarChart2}
              title="No holdings yet"
              description="Add your first transaction to start tracking your portfolio"
              action={
                <Button as={Link} to="/portfolio" size="lg">
                  Add Transaction
                </Button>
              }
            />
          )}
        </>
      )}
    </div>
  )
}
