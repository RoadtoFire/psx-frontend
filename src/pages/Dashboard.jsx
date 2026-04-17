import { useState, useEffect } from 'react'
import { getPortfolioValue } from '../api/portfolio'
import { useAuth } from '../context/useAuth'
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'

function BagIcon({ size = 20 }) {
  return <span style={{ fontSize: size }}>💰</span>
}

function StatCard({ title, value, subtitle, positive, icon: Icon, color }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {positive !== undefined && (
          <span className={`text-sm font-medium flex items-center gap-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
      {subtitle && <div className="text-gray-600 text-xs mt-1">{subtitle}</div>}
    </div>
  )
}

function formatPKR(amount) {
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`
  return `Rs. ${amount?.toFixed(2)}`
}

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">
          Assalam o Alaikum, {user?.username} 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your portfolio overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 animate-pulse">
              <div className="w-10 h-10 bg-gray-800 rounded-xl mb-4" />
              <div className="h-7 bg-gray-800 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Portfolio Value"
              value={formatPKR(summary?.total_current_value)}
              subtitle="Current market value"
              icon={BarChart2}
              color="bg-emerald-600"
            />
          <StatCard
            title="Total Invested"
            value={formatPKR(summary?.total_cost_basis)}
            subtitle="Cost basis"
            icon={BagIcon}
            color="bg-emerald-600"
        />
            <StatCard
              title="Total P&L"
              value={formatPKR(Math.abs(summary?.total_pnl))}
              subtitle={`${summary?.total_pnl_pct?.toFixed(2)}% return`}
              positive={summary?.total_pnl >= 0}
              icon={summary?.total_pnl >= 0 ? TrendingUp : TrendingDown}
              color={summary?.total_pnl >= 0 ? 'bg-emerald-600' : 'bg-red-600'}
            />
            <StatCard
              title="Holdings"
              value={holdings.length}
              subtitle="Active positions"
              icon={BarChart2}
              color="bg-purple-600"
            />
          </div>

          {/* Holdings table */}
          {holdings.length > 0 ? (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-white font-semibold">Your Holdings</h2>
                <Link to="/portfolio" className="text-emerald-400 text-sm hover:text-emerald-300">
                  Manage →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-right">Shares</th>
                      <th className="px-6 py-3 text-right">Avg Buy</th>
                      <th className="px-6 py-3 text-right">Current</th>
                      <th className="px-6 py-3 text-right">Value</th>
                      <th className="px-6 py-3 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {holdings.map((h) => (
                      <tr key={h.stock} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{h.stock}</div>
                          <div className="text-gray-500 text-xs truncate max-w-32">{h.stock_name}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">{h.shares}</td>
                        <td className="px-6 py-4 text-right text-gray-300">Rs. {h.avg_buy_price}</td>
                        <td className="px-6 py-4 text-right text-gray-300">Rs. {h.current_price}</td>
                        <td className="px-6 py-4 text-right text-white font-medium">{formatPKR(h.current_value)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-medium ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {h.pnl >= 0 ? '+' : ''}{formatPKR(h.pnl)}
                            <span className="text-xs ml-1 opacity-70">({h.pnl_pct}%)</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart2 size={28} className="text-gray-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">No holdings yet</h3>
              <p className="text-gray-400 text-sm mb-6">Add your first transaction to start tracking your portfolio</p>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Add Transaction
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}