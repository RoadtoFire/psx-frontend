import { useState, useEffect, useCallback } from 'react'
import { getStocks, getStock } from '../api/stocks'
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react'

function StockLogo({ symbol, name, tvLogoId }) {
  const [imgError, setImgError] = useState(false)

  const colors = [
    'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600',
    'bg-blue-600', 'bg-violet-600', 'bg-purple-600',
  ]
  const color = colors[symbol.charCodeAt(0) % colors.length]

  if (tvLogoId && !imgError) {
    return (
      <img
        src={`https://s3-symbol-logo.tradingview.com/${tvLogoId}.svg`}
        alt={symbol}
        onError={() => setImgError(true)}
        className="w-9 h-9 rounded-xl object-contain bg-white p-1"
      />
    )
  }

  return (
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {symbol[0]}
    </div>
  )
}

function StockCard({ stock, onClick }) {
  return (
    <div
      onClick={() => onClick(stock.symbol)}
      className="bg-gray-900/60 rounded-2xl border border-gray-800/80 p-4 hover:border-emerald-600/40 hover:bg-gray-800/60 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-3">
        <StockLogo symbol={stock.symbol} name={stock.name} tvLogoId={stock.tv_logo_id} />
        <div className="min-w-0">
          <div className="text-white font-bold text-sm">{stock.symbol}</div>
          <div className="text-gray-500 text-xs truncate">{stock.name}</div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-white font-semibold text-sm">
            Rs. {stock.latest_price?.toFixed(2) || 'N/A'}
          </div>
          <div className="text-gray-600 text-xs mt-0.5">{stock.latest_close}</div>
        </div>
        <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-lg truncate max-w-20 group-hover:text-gray-400 transition-colors">
          {stock.sector?.split(' ')[0]}
        </span>
      </div>
    </div>
  )
}

function StockDetailModal({ symbol, onClose }) {
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStock(symbol)
      .then(setStock)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [symbol])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h2 className="text-white font-semibold text-lg">{symbol}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stock ? (
          <div className="p-6 space-y-6">

            {/* Basic info */}
            <div className="flex items-center gap-4">
              <StockLogo symbol={stock.symbol} name={stock.name} tvLogoId={stock.tv_logo_id} />
              <div>
                <div className="text-white font-bold text-xl">{stock.name}</div>
                <div className="text-gray-400 text-sm mt-1">{stock.sector}</div>
              </div>
            </div>

            {/* Current price */}
            {stock.latest_price && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-gray-400 text-xs mb-1">Current Price</div>
                <div className="text-white text-2xl font-bold">
                  Rs. {stock.latest_price.close?.toFixed(2)}
                </div>
                <div className="text-gray-500 text-xs mt-1">As of {stock.latest_price.date}</div>
              </div>
            )}

            {/* Recent dividends */}
            {stock.recent_dividends?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Recent Dividends</h3>
                <div className="space-y-2">
                  {stock.recent_dividends.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                      <div className="text-gray-400 text-sm">{d.ex_date}</div>
                      <div className="flex items-center gap-2">
                        {d.cash_amount && (
                          <span className="text-emerald-400 text-sm font-medium">
                            Rs. {d.cash_amount}
                          </span>
                        )}
                        {d.bonus_ratio && (
                          <span className="text-amber-400 text-sm font-medium">
                            {(d.bonus_ratio * 100).toFixed(1)}% bonus
                          </span>
                        )}
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                          {d.dividend_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purification */}
            {stock.current_purification && (
              <div>
                <h3 className="text-white font-semibold mb-3">Shariah Purification</h3>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  {stock.current_purification.ratio ? (
                    <>
                      <div className="text-amber-400 font-semibold">
                        {stock.current_purification.ratio}% purification rate
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        For every Rs. 100 in dividends, donate Rs. {stock.current_purification.ratio} in charity
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Period: {stock.current_purification.period}
                      </div>
                    </>
                  ) : (
                    <div className="text-emerald-400 font-semibold">
                      ✓ No purification needed — income is already pure
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">Failed to load stock details</div>
        )}
      </div>
    </div>
  )
}

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [sectors, setSectors] = useState([])
  const [activeSector, setActiveSector] = useState('all')

  const fetchStocks = useCallback(async () => {
    setLoading(true)
    try {
      // Always fetch all when sector is active, paginated when no filter
      const data = await getStocks(search, activeSector === 'all' ? '' : activeSector)
      const list = Array.isArray(data) ? data : (data.results || [])
      setStocks(list)
      if (!search && activeSector === 'all') {
        const uniqueSectors = [...new Set(list.map(s => s.sector).filter(Boolean))].sort()
        setSectors(uniqueSectors)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, activeSector])

  useEffect(() => {
    const timeout = setTimeout(fetchStocks, 300)
    return () => clearTimeout(timeout)
  }, [fetchStocks])

  const filtered = stocks

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Shariah Compliant Stocks</h1>
        <p className="text-gray-400 mt-1">{stocks.length} stocks from PSX KMI All Share Index</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by symbol or company name..."
          className="w-full bg-gray-900/80 text-white rounded-xl pl-11 pr-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none placeholder-gray-600"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sector filter */}
      {!search && sectors.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveSector('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              activeSector === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Sectors
          </button>
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setActiveSector(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeSector === s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
              <div className="h-6 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">No stocks found for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(stock => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={setSelectedSymbol}
            />
          ))}
        </div>
      )}

      {selectedSymbol && (
        <StockDetailModal
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
    </div>
  )
}