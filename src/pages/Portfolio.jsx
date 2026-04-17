import { useState, useEffect } from 'react'
import { getPortfolio, addTransaction, deleteTransaction } from '../api/portfolio'
import { getStocks } from '../api/stocks'
import { Plus, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react'

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm shadow-2xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🗑️</div>
          <h3 className="text-white font-semibold text-lg mb-2">Delete Transaction</h3>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="py-3 rounded-xl bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddTransactionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    stock_symbol: '',
    transaction_type: 'buy',
    date: new Date().toISOString().split('T')[0],
    shares: '',
    price_per_share: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stocks, setStocks] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (search.length < 2) return
    getStocks(search).then(data => {
      setStocks(Array.isArray(data) ? data : (data.results || []))
    })
  }, [search])

  const filtered = stocks.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await addTransaction(form)
      onSuccess()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const firstError = Object.values(data)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError('Failed to add transaction')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, transaction_type: 'buy' })}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                form.transaction_type === 'buy'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
              }`}
            >
              📈 Buy
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, transaction_type: 'sell' })}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                form.transaction_type === 'sell'
                  ? 'bg-red-600/20 border-red-500 text-red-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
              }`}
            >
              📉 Sell
            </button>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Stock</label>
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setForm({ ...form, stock_symbol: '' })
              }}
              className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm placeholder-gray-600"
            />
            {search.length >= 2 && filtered.length > 0 && !form.stock_symbol && (
              <div className="mt-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {filtered.map(s => (
                  <button
                    key={s.symbol}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, stock_symbol: s.symbol })
                      setSearch(s.symbol)
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-white font-medium text-sm">{s.symbol}</span>
                    <span className="text-gray-400 text-xs truncate max-w-40">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
            {form.stock_symbol && (
              <p className="text-emerald-400 text-xs mt-1">✓ Selected: {form.stock_symbol}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Shares</label>
              <input
                type="number"
                value={form.shares}
                onChange={(e) => setForm({ ...form, shares: e.target.value })}
                className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm placeholder-gray-600"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Price per share</label>
              <input
                type="number"
                value={form.price_per_share}
                onChange={(e) => setForm({ ...form, price_per_share: e.target.value })}
                className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm placeholder-gray-600"
                placeholder="250.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-gray-800/50 text-white rounded-xl px-4 py-3 border border-gray-700/50 focus:border-emerald-500 focus:outline-none text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.stock_symbol}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  const fetchPortfolio = () => {
    getPortfolio()
      .then(setPortfolio)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const handleDelete = async () => {
    try {
      await deleteTransaction(confirmId)
      fetchPortfolio()
    } catch {
      // silently fail
    } finally {
      setConfirmId(null)
    }
  }

  const transactions = portfolio?.transactions || []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Portfolio</h1>
          <p className="text-gray-400 mt-1">Manage your transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-white font-semibold mb-2">No transactions yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first buy or sell transaction</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.transaction_type === 'buy' ? 'bg-emerald-600/20' : 'bg-red-600/20'
                  }`}>
                    {t.transaction_type === 'buy'
                      ? <TrendingUp size={18} className="text-emerald-400" />
                      : <TrendingDown size={18} className="text-red-400" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{t.stock.split(' - ')[0]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.transaction_type === 'buy'
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {t.transaction_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {t.shares} shares @ Rs. {t.price_per_share} • {t.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-medium">Rs. {t.total_value?.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">Total value</div>
                  </div>
                  <button
                    onClick={() => setConfirmId(t.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPortfolio}
        />
      )}

      {confirmId && (
        <ConfirmModal
          message="Are you sure you want to delete this transaction? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}