import { useState, useEffect, useCallback } from 'react'
import { getMacroData } from '../api/macro'

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n, dec = 2) {
  if (n == null) return '—'
  return Number(n).toFixed(dec)
}

function fmtSigned(n, dec = 2) {
  if (n == null) return '—'
  const num = Number(n)
  return (num > 0 ? '+' : '') + num.toFixed(dec)
}

function timeAgo(date) {
  if (!date) return null
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Signal config ──────────────────────────────────────────────────────────

const SIG = {
  GREEN: {
    text: 'text-emerald-400', dot: 'bg-emerald-400',
    topColor: '#10b981', cardBorder: 'border-emerald-500/15', label: 'Green',
  },
  YELLOW: {
    text: 'text-amber-400', dot: 'bg-amber-400',
    topColor: '#f59e0b', cardBorder: 'border-amber-500/15', label: 'Yellow',
  },
  RED: {
    text: 'text-red-400', dot: 'bg-red-400',
    topColor: '#f43f5e', cardBorder: 'border-red-500/15', label: 'Red',
  },
  UNKNOWN: {
    text: 'text-gray-500', dot: 'bg-gray-600',
    topColor: '#374151', cardBorder: 'border-gray-800', label: 'Unknown',
  },
}

const ERP_BADGE = {
  GREEN:  { label: 'Attractive',   text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  YELLOW: { label: 'Neutral Zone', text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'  },
  RED:    { label: 'Expensive',    text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400'    },
}

const COMPOSITE_STEPS = ['CALM', 'WATCH', 'STRESSED', 'PEAK_STRESS']
const COMPOSITE_LABEL = { CALM: 'Calm', WATCH: 'Watch', STRESSED: 'Stressed', PEAK_STRESS: 'Peak' }
const COMPOSITE_DESC = {
  CALM:       "No macro indicators are in the danger zone. Pakistan's external position, oil costs, and monetary conditions are all manageable right now.",
  WATCH:      'One macro indicator is flashing red. Keep an eye on developments but no immediate cause for alarm.',
  STRESSED:   'Two macro indicators are in the danger zone. Consider reducing fresh equity exposure until conditions stabilise.',
  PEAK_STRESS:'All three macro indicators are red. Historically a high-stress environment for Pakistani equities. Preserve capital.',
}
const COMPOSITE_SIG = { CALM: 'GREEN', WATCH: 'YELLOW', STRESSED: 'RED', PEAK_STRESS: 'RED' }

// ── Tooltip ────────────────────────────────────────────────────────────────

function Tooltip({ label, children, align = 'center', width = 'w-60' }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex items-center gap-1.5 uppercase tracking-[.06em] font-semibold cursor-default select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {label}
      <span className={`w-4 h-4 rounded-full border text-[10px] font-bold inline-flex items-center justify-center flex-shrink-0 transition-colors ${
        open ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
      }`}>?</span>
      {open && (
        <div className={`absolute bottom-full mb-2 ${width} bg-[#1a2640] border border-gray-700 rounded-xl px-3 py-3 text-xs text-gray-300 leading-relaxed z-50 shadow-2xl normal-case tracking-normal font-normal whitespace-normal text-left pointer-events-none ${
          align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2'
        }`}>
          {children}
        </div>
      )}
    </span>
  )
}

// ── Warning Card ───────────────────────────────────────────────────────────

function WarnCard({ signal, title, titleTooltip, tooltipAlign = 'left', metric, unit, children }) {
  const s = SIG[signal] || SIG.UNKNOWN
  return (
    <div className={`relative rounded-2xl border ${s.cardBorder} bg-gray-900/60 p-5 flex flex-col gap-3`}>
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: s.topColor }} />
      <div className="flex flex-col gap-1 mt-0.5">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[.07em] ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
          {s.label}
        </div>
        <div className="text-xs font-medium uppercase tracking-[.06em] text-gray-500">
          {titleTooltip
            ? <Tooltip label={title} align={tooltipAlign}>{titleTooltip}</Tooltip>
            : title}
        </div>
      </div>
      <div className="font-mono text-4xl font-bold text-white leading-none tabular-nums">
        {metric}
        {unit && <span className="text-base font-normal text-gray-500 ml-1 font-sans">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-800/60 pt-3">
        {children}
      </div>
    </div>
  )
}

// ── ERP interpretation copy ────────────────────────────────────────────────

function erpCopy(erp, composite) {
  if (erp == null) return null
  if (erp > 5 && composite === 'PEAK_STRESS')
    return "Generational signal: equities are cheap and macro is at maximum stress. Patient investors have historically been rewarded here."
  if (erp > 5)
    return "Equities look attractive relative to deposits. This is a strong signal to be fully invested or deploy fresh capital."
  if (erp > 0)
    return "Equities offer a modest premium over KIBOR deposits but short of the 5% threshold historically associated with strong conviction buying in Pakistan. Maintain current allocation. Hold fresh capital or deploy it gradually rather than all at once."
  return "Equities are offering less than KIBOR deposits on earnings yield. Deposits look more attractive on a risk-adjusted basis right now."
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Macro() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshedAt, setRefreshedAt] = useState(null)

  const load = useCallback(async () => {
    try {
      setError('')
      const d = await getMacroData()
      setData(d)
      setRefreshedAt(new Date())
    } catch {
      setError('Failed to load macro data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const snap = data?.snapshot
  const warn = data?.warning
  const personal = data?.personal

  const erpSig = snap?.erp_signal ? SIG[snap.erp_signal] : SIG.UNKNOWN
  const erpBadge = snap?.erp_signal ? ERP_BADGE[snap.erp_signal] : null
  const composite = warn?.composite_signal || 'CALM'
  const compSig = SIG[COMPOSITE_SIG[composite]] || SIG.GREEN

  const spectrumPos = snap?.market_erp != null
    ? Math.min(100, Math.max(0, (snap.market_erp + 5) / 15 * 100))
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Disclaimer ── */}
      <div className="flex gap-4 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm mt-0.5">
          ℹ
        </div>
        <div className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-white font-semibold block mb-1">Market context, not investment advice</strong>
          This snapshot exists to give the Amanat family a reading of Pakistan's overall equity market climate: whether conditions favour deploying fresh capital, staying invested, or gradually rotating into deposits. It is not a recommendation to buy or sell any specific stock. Your individual circumstances and risk tolerance always take priority.
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Macro Climate</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pakistan equity risk indicators
            {refreshedAt && <> · Updated {timeAgo(refreshedAt)}</>}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-2 transition-colors disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !data && (
        <div className="space-y-4 animate-pulse">
          <div className="h-64 bg-gray-900/60 border border-gray-800 rounded-2xl" />
          <div className="grid sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(i => <div key={i} className="h-40 bg-gray-900/60 border border-gray-800 rounded-2xl" />)}
          </div>
          <div className="h-14 bg-gray-900/60 border border-gray-800 rounded-2xl" />
          <div className="h-36 bg-gray-900/60 border border-gray-800 rounded-2xl" />
          <div className="h-40 bg-gray-900/60 border border-gray-800 rounded-2xl" />
        </div>
      )}

      {/* ── Content ── */}
      {!loading && data && (
        <>
          {/* ── ERP Hero ── */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.10em] text-gray-600 mb-3">Equity Risk Signal</p>
            <div
              className={`relative bg-gray-900/60 border ${snap?.erp_signal ? `border-${snap.erp_signal === 'GREEN' ? 'emerald' : snap.erp_signal === 'RED' ? 'red' : 'amber'}-500/20` : 'border-gray-800'} rounded-2xl p-7`}
              style={{ overflow: 'visible', boxShadow: 'inset 0 0 120px rgba(245,158,11,0.03)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(to right, ${erpSig.topColor}, transparent)` }}
              />

              {/* Eyebrow + badge */}
              <div className="flex items-center justify-between mb-7">
                <span className="text-xs font-semibold uppercase tracking-[.10em] text-gray-600">
                  Equity Risk Premium
                </span>
                {erpBadge ? (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${erpBadge.bg} border ${erpBadge.border} ${erpBadge.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${erpBadge.dot}`} />
                    {erpBadge.label}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 italic">Forward PE not set</span>
                )}
              </div>

              {/* Formula — mobile: flex-wrap; desktop: CSS grid for baseline alignment */}
              {(() => {
                const eyVal = snap?.kse100_earnings_yield != null ? `${fmt(snap.kse100_earnings_yield)}%` : '—'
                const kibVal = snap?.kibor_6m != null ? `${fmt(snap.kibor_6m)}%` : '—'
                const erpVal = snap?.market_erp != null ? `${snap.market_erp > 0 ? '+' : ''}${fmt(snap.market_erp)}%` : '—'
                const peNote = snap?.kse100_forward_pe != null
                  ? `KSE-100 Forward PE ${Number(snap.kse100_forward_pe).toFixed(1)}×`
                  : 'Set Forward PE in Scrape Monitor'
                const kibTooltip = (
                  <Tooltip label="KIBOR 6M" align="left">
                    Pakistan's interbank interest rate, the benchmark return on savings deposits and money market funds.
                    When KIBOR is high, it's the hurdle equities must clear. The State Bank raises it to fight inflation
                    and cuts it to stimulate growth.
                  </Tooltip>
                )
                return (
                  <>
                    {/* Mobile layout */}
                    <div className="sm:hidden mb-6">
                      <div className="flex items-end gap-2 flex-wrap mb-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-2xl font-semibold text-gray-300 tabular-nums leading-none">{eyVal}</span>
                          <span className="text-[10px] text-gray-600 uppercase tracking-[.08em] font-medium">Earnings Yield</span>
                        </div>
                        <span className="text-2xl text-gray-600 font-light leading-none pb-4">−</span>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-2xl font-semibold text-gray-300 tabular-nums leading-none">{kibVal}</span>
                          <span className="text-[10px] text-gray-600">{kibTooltip}</span>
                        </div>
                        <span className="text-2xl text-gray-600 font-light leading-none pb-4">=</span>
                        <div className="flex flex-col gap-1">
                          <span className={`font-mono text-[40px] font-bold tabular-nums leading-none ${erpSig.text}`}>{erpVal}</span>
                          <span className={`text-[10px] uppercase tracking-[.08em] font-medium ${erpSig.text} opacity-70`}>ERP Spread</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-gray-700">{peNote}</span>
                    </div>

                    {/* Desktop layout — CSS grid */}
                    <div
                      className="hidden sm:grid mb-8"
                      style={{ gridTemplateColumns: 'auto 52px auto 52px auto', alignItems: 'end', rowGap: '8px' }}
                    >
                      <span className="font-mono text-[30px] font-semibold text-gray-300 tabular-nums leading-none">{eyVal}</span>
                      <span className="text-[28px] text-gray-600 font-light text-center leading-none">−</span>
                      <span className="font-mono text-[30px] font-semibold text-gray-300 tabular-nums leading-none">{kibVal}</span>
                      <span className="text-[28px] text-gray-600 font-light text-center leading-none">=</span>
                      <span className={`font-mono text-[52px] font-bold tabular-nums leading-none ${erpSig.text}`}>{erpVal}</span>

                      <span className="text-xs text-gray-600 uppercase tracking-[.08em] font-medium self-start">Earnings Yield</span>
                      <span />
                      <span className="text-xs text-gray-600 self-start">{kibTooltip}</span>
                      <span />
                      <span className={`text-xs uppercase tracking-[.08em] font-medium self-start ${erpSig.text} opacity-70`}>ERP Spread</span>

                      <span className="font-mono text-xs text-gray-700 self-start mt-0.5">{peNote}</span>
                      <span /><span /><span /><span />
                    </div>
                  </>
                )
              })()}

              {/* Spectrum bar */}
              {spectrumPos != null && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-700 font-mono tabular-nums mb-1.5">
                    <span>−5%</span><span>0%</span><span>+5%</span><span>+10%</span>
                  </div>
                  <div className="relative h-1.5 rounded-full" style={{
                    background: 'linear-gradient(to right, rgba(244,63,94,.8) 0%, rgba(244,63,94,.8) 33.2%, rgba(245,158,11,.8) 33.4%, rgba(245,158,11,.8) 66.6%, rgba(16,185,129,.8) 66.8%, rgba(16,185,129,.8) 100%)'
                  }}>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-950 border-2 border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                      style={{ left: `${spectrumPos}%` }}
                    />
                  </div>
                  <div className="flex mt-5 text-[10.5px] font-semibold uppercase tracking-[.08em]">
                    <span className="flex-1 text-center text-red-500/50">Expensive</span>
                    <span className="flex-1 text-center text-amber-500/50">Neutral</span>
                    <span className="flex-1 text-center text-emerald-500/50">Attractive</span>
                  </div>
                </div>
              )}

              {/* Interpretation */}
              <p className="text-sm text-gray-400 leading-relaxed border-t border-gray-800/60 pt-5 max-w-prose">
                {snap?.kse100_forward_pe
                  ? erpCopy(snap.market_erp, composite)
                  : 'The ERP calculation requires the KSE-100 Forward PE. Set it in the Scrape Monitor (staff only).'}
              </p>
            </div>
          </section>

          {/* ── Macro Environment ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[.10em] text-gray-600">Macro Environment</p>
              <div className={`flex items-center gap-2 text-sm font-semibold ${compSig.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${compSig.dot}`} />
                {COMPOSITE_LABEL[composite]}
                <span className="text-gray-600 font-normal">
                  · {warn?.macro_stress_score ?? 0} of 3 in danger zone
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <WarnCard
                signal={warn?.reserves_signal || 'UNKNOWN'}
                title="FX Reserves"
                titleTooltip="Foreign currency held by the State Bank. More reserves = a stronger, more stable PKR and more capacity to absorb shocks. Think of it as Pakistan's national emergency fund: the lower it falls, the more vulnerable the economy is to external pressures."
                tooltipAlign="left"
                metric={warn?.import_cover_months != null ? Number(warn.import_cover_months).toFixed(2) : '—'}
                unit="mo"
              >
                {warn?.sbp_fx_reserves_usd_bn != null && warn?.monthly_imports_usd_bn != null ? (
                  <>
                    ${Number(warn.sbp_fx_reserves_usd_bn).toFixed(1)}bn reserves ÷ ${Number(warn.monthly_imports_usd_bn).toFixed(1)}bn/month imports. Below the{' '}
                    <Tooltip label="IMF threshold" align="left">
                      Under Pakistan's current IMF program, maintaining adequate import cover is a key benchmark.
                      The IMF has set 3 months as the minimum comfort threshold. Falling below this triggers closer
                      scrutiny and can delay or complicate disbursements.
                    </Tooltip>
                    {' '}of 3 months.
                  </>
                ) : 'No data yet.'}
              </WarnCard>

              <WarnCard
                signal={warn?.oil_signal || 'UNKNOWN'}
                title="Brent Crude Oil"
                titleTooltip="Oil accounts for roughly 25% of Pakistan's total import bill. When Brent rises, the trade deficit widens, the PKR comes under pressure, and inflation picks up through fuel and transport costs. Lower oil is one of the most direct macro tailwinds for Pakistan."
                metric={warn?.brent_crude_usd != null ? `$${Math.round(warn.brent_crude_usd)}` : '—'}
                unit="/bbl"
              >
                {warn?.oil_signal === 'GREEN' && 'Well below the $90 stress threshold. Fuel and fertilizer import costs remain contained, a meaningful tailwind for the current account.'}
                {warn?.oil_signal === 'YELLOW' && 'Approaching the $90 stress threshold. Monitor for further rises that could widen the trade deficit.'}
                {warn?.oil_signal === 'RED' && 'Above the $110 danger level. Import costs are elevated, widening the current account deficit and putting pressure on the PKR.'}
                {(!warn?.oil_signal || warn?.oil_signal === 'UNKNOWN') && 'No data yet.'}
              </WarnCard>

              <WarnCard
                signal={warn?.real_rate_signal || 'UNKNOWN'}
                title="Real Policy Rate"
                metric={warn?.real_rate != null ? fmtSigned(warn.real_rate) : '—'}
                unit="%"
              >
                {snap?.kibor_6m != null && warn?.cpi_yoy != null ? (
                  <>
                    <Tooltip label="KIBOR" align="right">
                      Pakistan's interbank rate, set by the State Bank's Monetary Policy Committee. It's the lever the
                      government has to speed up (cuts) or slow down (hikes) the economy. A high KIBOR makes borrowing
                      expensive and savings more attractive.
                    </Tooltip>
                    {' '}{fmt(snap.kibor_6m)}% minus CPI {fmt(warn.cpi_yoy)}%.{' '}
                    {warn.real_rate_signal === 'GREEN'
                      ? 'Monetary policy is clearly restrictive, providing a real positive return on deposits.'
                      : warn.real_rate_signal === 'YELLOW'
                      ? 'Monetary policy is neutral, not restrictive. Deposits beat inflation by a thin margin only.'
                      : 'Real rates are negative. Inflation is outpacing deposit returns, eroding purchasing power.'}
                  </>
                ) : 'No data yet.'}
              </WarnCard>
            </div>

            {/* Composite stepper — mobile: stacked; desktop: side-by-side */}

            {/* Mobile */}
            <div className="sm:hidden mt-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {COMPOSITE_STEPS.map(step => {
                  const active = step === composite
                  return (
                    <span key={step} className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.06em] ${active ? compSig.text : 'text-gray-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? compSig.dot : 'bg-gray-800 border border-gray-700'}`} />
                      {COMPOSITE_LABEL[step]}
                    </span>
                  )
                })}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{COMPOSITE_DESC[composite]}</p>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex mt-3 items-stretch bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
              {COMPOSITE_STEPS.map((step, i) => {
                const active = step === composite
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2 px-4 py-3.5 flex-shrink-0 ${
                      i < COMPOSITE_STEPS.length - 1 ? 'border-r border-gray-800/60' : ''
                    } ${active ? compSig.text : 'text-gray-700'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      active ? compSig.dot : 'bg-transparent border border-gray-700'
                    }`} />
                    <span className="text-xs font-semibold uppercase tracking-[.06em]">
                      {COMPOSITE_LABEL[step]}
                    </span>
                  </div>
                )
              })}
              <div className="flex-1 flex items-center px-5 py-3 text-sm text-gray-400 leading-relaxed min-w-0">
                {COMPOSITE_DESC[composite]}
              </div>
            </div>
          </section>

          {/* ── Your Portfolio ── */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.10em] text-gray-600 mb-3">Your Portfolio</p>
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6" style={{ overflow: 'visible' }}>
              <div className="mb-5">
                <div className="text-white font-semibold text-base">
                  <Tooltip label="Dividend Yield vs KIBOR" align="left" width="w-72">
                    If your goal is passive income from dividends, this gap is what matters. When your portfolio yield
                    exceeds KIBOR, equities are generating more income than a term deposit or money market fund would.
                    A negative gap means deposits are currently more generous on income alone, though equity upside and
                    capital gains are a separate consideration.
                  </Tooltip>
                </div>
                {personal?.holdings_count > 0 && (
                  <p className="text-gray-500 text-xs mt-1.5">
                    {personal.holdings_count} holdings · trailing 12-month cash dividends
                  </p>
                )}
              </div>

              {personal?.portfolio_yield == null ? (
                <p className="text-sm text-gray-600 py-6 text-center">
                  {personal?.holdings_count === 0
                    ? 'Add holdings in Portfolio to see your personal dividend yield vs KIBOR.'
                    : 'None of your holdings paid cash dividends in the last 12 months.'}
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {[
                      { label: 'Your yield',  val: personal.portfolio_yield, pct: (personal.portfolio_yield / (snap?.kibor_6m || 12)) * 100, cls: 'bg-amber-400' },
                      { label: 'KIBOR 6M',    val: snap?.kibor_6m,           pct: 100,                                                        cls: 'bg-gray-600' },
                    ].map(({ label, val, pct, cls }) => (
                      <div key={label} className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cls}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                        </div>
                        <span className="font-mono text-sm font-bold text-white w-14 text-right tabular-nums">
                          {fmt(val)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 pt-4 border-t border-gray-800/60">
                    <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">Dividend gap</span>
                    <span className={`px-3 py-0.5 rounded-full font-mono text-xs font-bold flex-shrink-0 ${
                      personal.dividend_gap >= 0
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                      {personal.dividend_gap > 0 ? '+' : ''}{fmt(personal.dividend_gap)}%
                    </span>
                    <span className="text-xs text-gray-500 leading-relaxed">
                      {personal.dividend_gap >= 0
                        ? 'Your portfolio yields more than KIBOR on income. Equities are beating deposits on pure income right now.'
                        : 'Your portfolio yields less than KIBOR on income. Deposits win on pure income right now. Equities need capital appreciation to make up the difference.'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 mt-4">
                    Weighted by current market value · Excludes bonus shares · Updates daily after market close
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ── Key Indicators ── */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.10em] text-gray-600 mb-3">Key Indicators</p>
            {/* No overflow-hidden so tooltips escape the grid */}
            {/* overflow-visible so tooltips escape; borders on cells instead of gap-px trick */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl" style={{ overflow: 'visible' }}>
              {/* 2-col on mobile, 3-col on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {[
                  {
                    label: <Tooltip label="KIBOR 6M" align="left">
                      Pakistan's 6-month interbank offered rate, the standard benchmark for savings deposits,
                      money market funds, and term finance. This is the hurdle your equity portfolio must beat
                      to justify the extra risk.
                    </Tooltip>,
                    val: snap?.kibor_6m != null ? `${fmt(snap.kibor_6m)}%` : '—',
                    note: snap?.date ? `SBP · ${snap.date}` : 'SBP',
                  },
                  {
                    label: 'KIBOR 1Y',
                    val: snap?.kibor_1y != null ? `${fmt(snap.kibor_1y)}%` : '—',
                    note: snap?.date ? `SBP · ${snap.date}` : 'SBP',
                  },
                  {
                    label: 'CPI YoY',
                    val: warn?.cpi_yoy != null ? `${fmt(warn.cpi_yoy)}%` : '—',
                    note: 'PBS · Latest',
                  },
                  {
                    label: 'Real Rate',
                    val: warn?.real_rate != null ? `${fmtSigned(warn.real_rate)}%` : '—',
                    note: 'KIBOR − CPI',
                  },
                  {
                    label: 'PKR / USD',
                    val: snap?.pkr_usd_rate != null ? Number(snap.pkr_usd_rate).toFixed(2) : '—',
                    note: 'SBP · Latest',
                  },
                  {
                    label: <Tooltip label="SBP Reserves" align="right">
                      The State Bank's liquid foreign exchange holdings. A higher number means the country can absorb
                      shocks (import price spikes, external debt payments, capital outflows) without the PKR going
                      into freefall.
                    </Tooltip>,
                    val: warn?.sbp_fx_reserves_usd_bn != null ? `$${Number(warn.sbp_fx_reserves_usd_bn).toFixed(1)}B` : '—',
                    note: 'Liquid FX · Latest',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={[
                      'px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-1.5',
                      // Right border: mobile=odd cols (0,2,4), desktop=non-last col (not 2,5)
                      i % 2 === 0 ? 'border-r border-gray-800' : '',
                      // sm overrides: remove right border from col-3 on desktop (index 2,5)
                      i === 2 || i === 5 ? 'sm:border-r-0' : '',
                      // sm adds right border back to col-2 on desktop (index 1,4)
                      i === 1 || i === 4 ? 'sm:border-r sm:border-gray-800' : '',
                      // Bottom border: mobile=first 4 (2 rows of 2), desktop=first 3 (row 1 of 3)
                      i < 4 ? 'border-b border-gray-800' : '',
                      i === 3 ? 'sm:border-b-0' : '',
                      i < 3 ? 'sm:border-b sm:border-gray-800' : '',
                    ].join(' ')}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[.09em] text-gray-600">
                      {stat.label}
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums leading-tight">
                      {stat.val}
                    </div>
                    <div className="text-xs text-gray-700">{stat.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
