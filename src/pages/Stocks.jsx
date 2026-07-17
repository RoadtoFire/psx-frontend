import { useState, useEffect, useCallback } from 'react'
import { getStocks, getStock } from '../api/stocks'
import { Search, X, SearchX, Check } from 'lucide-react'
import { PageHeader, Modal, Badge } from '../components/ui'
import Seo from '../components/Seo'

function StockLogo({ symbol, tvLogoId }) {
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
      className="bg-panel/60 rounded-2xl border border-gray-800/80 p-4 hover:border-brand-600/40 hover:bg-gray-800/60 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-3">
        <StockLogo symbol={stock.symbol} tvLogoId={stock.tv_logo_id} />
        <div className="min-w-0">
          <div className="text-white font-bold text-sm">{stock.symbol}</div>
          <div className="text-ink-dim text-xs truncate">{stock.name}</div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="shrink-0">
          {stock.latest_price != null ? (
            <>
              <div className="text-white font-semibold text-sm font-mono tabular-nums whitespace-nowrap">
                Rs. {stock.latest_price.toFixed(2)}
              </div>
              <div className="text-ink-dim text-xs mt-0.5 whitespace-nowrap">{stock.latest_close}</div>
            </>
          ) : (
            <>
              <div className="text-ink-dim font-semibold text-sm font-mono">—</div>
              <div className="text-ink-dim text-xs mt-0.5 whitespace-nowrap">No recent price</div>
            </>
          )}
        </div>
        <span className="text-xs bg-gray-800 text-ink-dim px-2 py-0.5 rounded-lg truncate min-w-0 group-hover:text-ink-mid transition-colors">
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
    <Modal title={symbol} onClose={onClose} size="lg">
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stock ? (
        <div className="space-y-6">
          {/* Basic info */}
          <div className="flex items-center gap-4">
            <StockLogo symbol={stock.symbol} tvLogoId={stock.tv_logo_id} />
            <div>
              <div className="text-white font-bold text-xl">{stock.name}</div>
              <div className="text-ink-mid text-sm mt-1">{stock.sector}</div>
            </div>
          </div>

          {/* Current price */}
          {stock.latest_price_detail && (
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-ink-mid text-xs mb-1 uppercase tracking-wider">Current Price</div>
              <div className="text-white text-2xl font-bold font-mono tabular-nums">
                Rs. {stock.latest_price_detail.close?.toFixed(2)}
              </div>
              <div className="text-ink-dim text-xs mt-1">As of {stock.latest_price_detail.date}</div>
            </div>
          )}

          {/* Recent dividends */}
          {stock.recent_dividends?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Recent Dividends</h3>
              <div className="space-y-2">
                {stock.recent_dividends.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                    <div className="text-ink-mid text-sm">{d.ex_date}</div>
                    <div className="flex items-center gap-2">
                      {d.cash_amount && (
                        <span className="text-brand-400 text-sm font-medium font-mono tabular-nums">
                          Rs. {d.cash_amount}
                        </span>
                      )}
                      {d.bonus_ratio && (
                        <span className="text-amber-400 text-sm font-medium font-mono tabular-nums">
                          {(d.bonus_ratio * 100).toFixed(1)}% bonus
                        </span>
                      )}
                      <Badge tone="gray">{d.dividend_type}</Badge>
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
                    <div className="text-ink-mid text-xs mt-1">
                      For every Rs. 100 in dividends, donate Rs. {stock.current_purification.ratio} in charity
                    </div>
                    <div className="text-ink-dim text-xs mt-1">
                      Period: {stock.current_purification.period}
                    </div>
                  </>
                ) : (
                  <div className="text-brand-400 font-semibold flex items-center gap-2">
                    <Check size={16} />
                    No purification needed — income is already pure
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-ink-mid">Failed to load stock details</div>
      )}
    </Modal>
  )
}

const PAGE_SIZE = 48

const SORTS = {
  symbol: { label: 'Symbol A–Z', fn: (a, b) => a.symbol.localeCompare(b.symbol) },
  price_desc: { label: 'Price: high → low', fn: (a, b) => (b.latest_price ?? -1) - (a.latest_price ?? -1) },
  price_asc: { label: 'Price: low → high', fn: (a, b) => (a.latest_price ?? Infinity) - (b.latest_price ?? Infinity) },
  sector: { label: 'Sector', fn: (a, b) => (a.sector || '').localeCompare(b.sector || '') || a.symbol.localeCompare(b.symbol) },
}

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [sectors, setSectors] = useState([])
  const [activeSector, setActiveSector] = useState('all')
  const [sortKey, setSortKey] = useState('symbol')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

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

  // Reset paging whenever the result set changes shape
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, activeSector, sortKey])

  const filtered = [...stocks].sort(SORTS[sortKey].fn)
  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="max-w-6xl mx-auto">
      <Seo title="Shariah Compliant Stocks" noindex />
      <PageHeader
        title="Shariah Compliant Stocks"
        subtitle={`${stocks.length} stocks from PSX KMI All Share Index`}
        className="mb-6"
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by symbol or company name..."
          className="w-full bg-panel/80 text-white rounded-xl pl-11 pr-4 py-3 border border-edge focus:border-brand-500 focus:outline-none placeholder:text-ink-dim"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-dim hover:text-white"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sector filter + sort */}
      <div className="flex items-center gap-3 mb-6">
        {!search && sectors.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 min-w-0">
            {['all', ...sectors].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSector(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeSector === s
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'bg-gray-800/70 text-ink-mid hover:text-white border border-edge'
                }`}
              >
                {s === 'all' ? 'All Sectors' : s}
              </button>
            ))}
          </div>
        )}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          aria-label="Sort stocks"
          className="ml-auto shrink-0 bg-gray-800/70 text-ink-mid text-sm rounded-xl border border-edge px-3 py-1.5 focus:border-brand-500 focus:outline-none mb-2"
        >
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-panel rounded-2xl border border-edge p-5 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
              <div className="h-6 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <SearchX size={40} className="text-ink-dim mx-auto mb-4" />
          <p className="text-ink-mid">No stocks found for "{search}"</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map(stock => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={setSelectedSymbol}
              />
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="bg-gray-800/70 hover:bg-gray-800 text-ink-mid hover:text-white text-sm font-medium px-6 py-2.5 rounded-xl border border-edge transition-colors"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
                <span className="text-ink-dim ml-2">({visibleCount} of {filtered.length})</span>
              </button>
            </div>
          )}
        </>
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
