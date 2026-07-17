import { useState, useEffect, useRef } from 'react'
import { getPortfolio, addTransaction, deleteTransaction, importTransactionsPreview, confirmTransactionImport } from '../api/portfolio'
import { getStocks } from '../api/stocks'
import { Plus, Trash2, TrendingUp, TrendingDown, X, Upload, CheckCircle2, BarChart2, FileText, Check } from 'lucide-react'
import { PageHeader, Modal, Button, Field, Input, EmptyState } from '../components/ui'
import Seo from '../components/Seo'

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Delete Transaction</h3>
        <p className="text-ink-mid text-sm mb-6">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </Modal>
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
    <Modal title="Add Transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, transaction_type: 'buy' })}
            className={`py-3 rounded-xl border text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
              form.transaction_type === 'buy'
                ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                : 'bg-gray-800/50 border-gray-700/50 text-ink-mid'
            }`}
          >
            <TrendingUp size={16} />
            Buy
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, transaction_type: 'sell' })}
            className={`py-3 rounded-xl border text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
              form.transaction_type === 'sell'
                ? 'bg-red-600/20 border-red-500 text-red-400'
                : 'bg-gray-800/50 border-gray-700/50 text-ink-mid'
            }`}
          >
            <TrendingDown size={16} />
            Sell
          </button>
        </div>

        <div>
          <Field label="Stock">
            <Input
              type="text"
              placeholder="Search by symbol or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setForm({ ...form, stock_symbol: '' })
              }}
            />
          </Field>
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
                  <span className="text-ink-mid text-xs truncate max-w-40">{s.name}</span>
                </button>
              ))}
            </div>
          )}
          {form.stock_symbol && (
            <p className="text-brand-400 text-xs mt-1 flex items-center gap-1">
              <Check size={12} /> Selected: {form.stock_symbol}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Shares">
            <Input
              type="number"
              value={form.shares}
              onChange={(e) => setForm({ ...form, shares: e.target.value })}
              placeholder="100"
              required
            />
          </Field>
          <Field label="Price per share">
            <Input
              type="number"
              value={form.price_per_share}
              onChange={(e) => setForm({ ...form, price_per_share: e.target.value })}
              placeholder="250.00"
              required
            />
          </Field>
        </div>

        <Field label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </Field>

        <Button
          type="submit"
          loading={loading}
          disabled={!form.stock_symbol}
          className="w-full"
          size="lg"
        >
          {loading ? 'Adding…' : 'Add Transaction'}
        </Button>
      </form>
    </Modal>
  )
}

const ACCEPTED = '.csv,.xlsx,.png,.jpg,.jpeg'

function ImportModal({ onClose, onSuccess }) {
  const [stage, setStage] = useState('upload')   // 'upload' | 'preview' | 'success'
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])            // editable parsed rows
  const [skipped, setSkipped] = useState([])
  const [showSkipped, setShowSkipped] = useState(false)
  const [importing, setImporting] = useState(false)
  const [createdCount, setCreatedCount] = useState(0)
  const fileRef = useRef()
  const finqlabRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const doParse = async (fileObj) => {
    setParsing(true)
    setError('')
    try {
      const data = await importTransactionsPreview(fileObj)
      if (data.error) { setError(data.error); return }
      setRows(data.parsed || [])
      setSkipped(data.skipped || [])
      if ((data.parsed || []).length === 0 && (data.skipped || []).length === 0) {
        setError(data.message || 'No transaction rows found in the file.')
        return
      }
      setStage('preview')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse the file. Please try again.')
    } finally {
      setParsing(false)
    }
  }

  const handleParse = () => { if (file) doParse(file) }

  const handleFinqlabFile = (f) => {
    if (!f) return
    setFile(f)
    setError('')
    doParse(f)
  }

  const updateRow = (i, field, value) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  const removeRow = (i) => {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleConfirm = async () => {
    if (!rows.length) return
    setImporting(true)
    setError('')
    try {
      const data = await confirmTransactionImport(rows)
      setCreatedCount(data.created || 0)
      setStage('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const cellCls = 'bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white w-full focus:outline-none focus:border-brand-500'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-panel rounded-2xl border border-edge w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-edge flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">Import Transactions</h2>
            <p className="text-ink-dim text-xs mt-0.5">Upload a CSV, Excel, or screenshot from your broker</p>
          </div>
          <button onClick={onClose} className="text-ink-mid hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Stage: upload ── */}
          {stage === 'upload' && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-brand-500 bg-brand-500/5' : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <Upload size={32} className="mx-auto mb-3 text-ink-dim" />
                {file ? (
                  <p className="text-brand-400 font-medium text-sm">{file.name}</p>
                ) : (
                  <>
                    <p className="text-white font-medium mb-1">Drop your file here or click to browse</p>
                    <p className="text-ink-dim text-xs">CSV, Excel (.xlsx), or screenshot (.png / .jpg)</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-gray-800/50 border border-edge rounded-xl px-4 py-3 text-xs text-ink-dim space-y-1">
                <p className="font-medium text-ink-mid">Supported formats</p>
                <p>CSV / Excel: any broker export — column names are detected automatically.</p>
                <p>Screenshot: a photo or screenshot of a transaction table.</p>
              </div>

              <Button
                onClick={handleParse}
                loading={parsing}
                disabled={!file}
                className="w-full"
                size="lg"
              >
                {parsing ? 'Parsing…' : 'Parse File'}
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-edge" />
                <span className="text-ink-dim text-xs">or</span>
                <div className="flex-1 border-t border-edge" />
              </div>

              <Button
                variant="secondary"
                onClick={() => finqlabRef.current?.click()}
                disabled={parsing}
                className="w-full"
                size="lg"
              >
                <FileText size={16} className="text-ink-mid" />
                Finqalab Cashbook (PDF)
              </Button>
              <input
                ref={finqlabRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFinqlabFile(e.target.files[0])}
              />
            </div>
          )}

          {/* ── Stage: preview ── */}
          {stage === 'preview' && (
            <div className="space-y-4">
              <p className="text-ink-mid text-sm">
                Review and edit the detected transactions before importing.
                {skipped.length > 0 && (
                  <span className="text-amber-400 ml-1">{skipped.length} row{skipped.length !== 1 ? 's' : ''} could not be parsed.</span>
                )}
              </p>

              {rows.length === 0 ? (
                <div className="text-center py-8 text-ink-dim text-sm">
                  No importable rows remain. Remove bad rows from skipped or upload a different file.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-edge">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-edge bg-panel">
                        <th className="px-3 py-2 text-left text-ink-dim font-medium uppercase tracking-wide">Symbol</th>
                        <th className="px-3 py-2 text-left text-ink-dim font-medium uppercase tracking-wide">Date</th>
                        <th className="px-3 py-2 text-left text-ink-dim font-medium uppercase tracking-wide">Type</th>
                        <th className="px-3 py-2 text-left text-ink-dim font-medium uppercase tracking-wide">Shares</th>
                        <th className="px-3 py-2 text-left text-ink-dim font-medium uppercase tracking-wide">Price</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-edge">
                      {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-800/30">
                          <td className="px-3 py-2">
                            <input
                              value={row.stock_symbol || ''}
                              onChange={(e) => updateRow(i, 'stock_symbol', e.target.value.toUpperCase())}
                              className={cellCls + ' w-24 font-mono'}
                              placeholder="OGDC"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={row.date || ''}
                              onChange={(e) => updateRow(i, 'date', e.target.value)}
                              className={cellCls + ' w-32'}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.transaction_type || 'buy'}
                              onChange={(e) => updateRow(i, 'transaction_type', e.target.value)}
                              className={cellCls + ' w-20'}
                            >
                              <option value="buy">Buy</option>
                              <option value="sell">Sell</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.shares || ''}
                              onChange={(e) => updateRow(i, 'shares', e.target.value)}
                              className={cellCls + ' w-24'}
                              placeholder="100"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.price_per_share || ''}
                              onChange={(e) => updateRow(i, 'price_per_share', e.target.value)}
                              className={cellCls + ' w-28'}
                              placeholder="250.00"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeRow(i)} className="text-ink-dim hover:text-red-400 transition-colors" aria-label="Remove row">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Skipped rows */}
              {skipped.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSkipped(v => !v)}
                    className="text-xs text-ink-dim hover:text-gray-300 transition-colors"
                  >
                    {showSkipped ? '▲ Hide' : '▼ Show'} {skipped.length} skipped row{skipped.length !== 1 ? 's' : ''}
                  </button>
                  {showSkipped && (
                    <div className="mt-2 space-y-1">
                      {skipped.map((s, i) => (
                        <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 text-xs text-red-400">
                          Row {s.row}: {s.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Stage: success ── */}
          {stage === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={30} className="text-brand-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Import complete</h3>
              <p className="text-ink-mid text-sm">
                {createdCount} transaction{createdCount !== 1 ? 's' : ''} added to your portfolio.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {stage === 'preview' && (
          <div className="flex items-center justify-between p-6 border-t border-edge flex-shrink-0">
            <button
              onClick={() => { setStage('upload'); setError('') }}
              className="text-sm text-ink-mid hover:text-white transition-colors"
            >
              ← Back
            </button>
            <Button
              onClick={handleConfirm}
              loading={importing}
              disabled={rows.length === 0}
            >
              {importing ? 'Importing…' : `Import ${rows.length} transaction${rows.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        )}

        {stage === 'success' && (
          <div className="p-6 border-t border-edge flex-shrink-0">
            <Button
              onClick={() => { onClose(); onSuccess() }}
              className="w-full"
              size="lg"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
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
      <Seo title="Portfolio" noindex />
      <PageHeader
        title="Portfolio"
        subtitle="Manage your transactions"
        action={
          <>
            <Button variant="secondary" onClick={() => setShowImport(true)}>
              <Upload size={16} />
              Import
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Add Transaction
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-panel rounded-2xl p-6 border border-edge animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No transactions yet"
          description="Add your first buy or sell transaction"
          action={
            <Button onClick={() => setShowModal(true)} size="lg">
              <Plus size={18} />
              Add Transaction
            </Button>
          }
        />
      ) : (
        <div className="bg-panel/80 rounded-2xl border border-edge overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-edge">
            <h2 className="text-white font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y divide-edge">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  t.transaction_type === 'buy' ? 'bg-brand-600/20' : 'bg-red-600/20'
                }`}>
                  {t.transaction_type === 'buy'
                    ? <TrendingUp size={18} className="text-brand-400" />
                    : <TrendingDown size={18} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{t.stock.split(' - ')[0]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.transaction_type === 'buy'
                        ? 'bg-brand-600/20 text-brand-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {t.transaction_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-ink-mid text-sm truncate font-mono tabular-nums">
                    {t.shares} @ Rs. {t.price_per_share} <span className="font-sans">• {t.date}</span>
                  </div>
                  {/* Mobile: total sits under the details so nothing clips off-screen */}
                  <div className="sm:hidden text-white text-sm font-medium font-mono tabular-nums mt-0.5">
                    Rs. {t.total_value?.toLocaleString()}
                  </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <div className="text-white font-medium font-mono tabular-nums whitespace-nowrap">Rs. {t.total_value?.toLocaleString()}</div>
                  <div className="text-ink-dim text-xs">Total value</div>
                </div>
                <button
                  onClick={() => setConfirmId(t.id)}
                  className="text-ink-dim hover:text-red-400 transition-colors p-1 shrink-0"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
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

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
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
