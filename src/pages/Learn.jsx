import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const shariah_criteria = [
  {
    number: '01',
    title: 'Halal Business',
    color: 'text-emerald-400',
    border: 'border-emerald-600/20',
    bg: 'bg-emerald-600/10',
    short: 'Core business must be permissible under Islamic law.',
    detail: 'The company must not be involved in conventional banking, insurance, alcohol, tobacco, pork, gambling, weapons, or any other Shariah-prohibited activity. Even partial involvement disqualifies the company.'
  },
  {
    number: '02',
    title: 'Debt Ratio under 37%',
    color: 'text-blue-400',
    border: 'border-blue-600/20',
    bg: 'bg-blue-600/10',
    short: 'Interest-bearing debt must be less than 37% of total assets.',
    detail: 'Companies that rely heavily on interest-based borrowing are considered non-compliant. This includes conventional bank loans, bonds, TFCs, leasing, and preference shares. The 37% threshold allows some tolerance for companies operating in mixed environments.'
  },
  {
    number: '03',
    title: 'Non-Compliant Investments < 33%',
    color: 'text-purple-400',
    border: 'border-purple-600/20',
    bg: 'bg-purple-600/10',
    short: 'Investments in haram instruments must be less than 33% of total assets.',
    detail: 'This includes investments in conventional mutual funds, T-Bills, PIBs, bonds, fixed deposits, and any company declared Shariah non-compliant. The company may hold some such investments without losing compliance, as long as they stay below the threshold.'
  },
  {
    number: '04',
    title: 'Non-Compliant Income < 5%',
    color: 'text-amber-400',
    border: 'border-amber-600/20',
    bg: 'bg-amber-600/10',
    short: 'Income from haram sources must be less than 5% of total revenue.',
    detail: 'Includes interest income, income from gambling, derivatives, insurance claims from conventional insurers, and dividends from non-compliant companies. If this income exceeds 5%, the stock is removed from the index. If under 5%, the investor must purify that portion of their dividend income.'
  },
  {
    number: '05',
    title: 'Illiquid Assets over 25%',
    color: 'text-teal-400',
    border: 'border-teal-600/20',
    bg: 'bg-teal-600/10',
    short: 'At least 25% of total assets must be physical/illiquid assets.',
    detail: 'Shariah law treats pure cash and liquid assets differently from physical assets. A company must have meaningful real assets — property, machinery, inventory, equipment — for its shares to represent ownership of something tangible rather than just money.'
  },
  {
    number: '06',
    title: 'Market Price ≥ Net Liquid Assets',
    color: 'text-rose-400',
    border: 'border-rose-600/20',
    bg: 'bg-rose-600/10',
    short: 'Stock price must be at or above the net liquid assets per share.',
    detail: 'This prevents trading in shares that are essentially just cash at a discount, which would resemble currency exchange (Bai al-Sarf) and could involve riba. The market price must reflect the real value of the business, not just its liquid holdings.'
  },
]

function CriteriaCard({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`rounded-2xl border ${item.border} ${item.bg} p-5 cursor-pointer transition-all`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={`text-2xl font-black ${item.color} shrink-0`}>{item.number}</span>
          <div>
            <div className="text-white font-semibold">{item.title}</div>
            <div className="text-gray-400 text-sm mt-1">{item.short}</div>
            {open && (
              <div className="text-gray-300 text-sm mt-3 leading-relaxed border-t border-gray-700 pt-3">
                {item.detail}
              </div>
            )}
          </div>
        </div>
        <div className={`${item.color} shrink-0 mt-1`}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
    </div>
  )
}

export default function Learn() {
  const [activeTab, setActiveTab] = useState('shariah')

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Learn</h1>
        <p className="text-gray-400 mt-1">Understand Shariah investing and stock market basics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('shariah')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'shariah'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          🕌 Shariah Compliance
        </button>
        <button
          onClick={() => setActiveTab('investing')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'investing'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📈 Investing Basics
        </button>
      </div>

      {/* Shariah tab */}
      {activeTab === 'shariah' && (
        <div className="space-y-4">
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🕌</div>
              <div>
                <h2 className="text-white font-bold text-lg mb-2">What makes a stock Shariah compliant?</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The KMI All Shares Islamic Index is developed by PSX and Meezan Bank. A stock must pass
                  all 6 criteria below to be included. The index is reviewed every 6 months — stocks that
                  no longer qualify are removed.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-600/20">
                    285 compliant stocks on PSX
                  </span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                    Reviewed every 6 months
                  </span>
                </div>
              </div>
            </div>
          </div>

          {shariah_criteria.map((item) => (
            <CriteriaCard key={item.number} item={item} />
          ))}

          {/* Purification explainer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🌙</div>
              <div>
                <h3 className="text-white font-bold mb-2">What is Purification?</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Even Shariah-compliant companies may earn a small amount of non-compliant income
                  (under 5%). When you receive dividends, you must donate the equivalent proportion
                  to charity. This is called <span className="text-amber-400 font-medium">purification (تطهير)</span>.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mt-2">
                  Amanat calculates this automatically for every dividend you receive based on
                  the purification ratios published by Al-Meezan in their semi-annual KMI recomposition reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investing tab */}
      {activeTab === 'investing' && (
        <div className="space-y-6">
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📺</div>
              <div>
                <h2 className="text-white font-bold text-lg mb-2">Investkaar — Learn to Invest in Urdu</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The best Pakistani YouTube channel for learning stock market investing from scratch.
                  All videos are in Urdu and specifically cover the Pakistan Stock Exchange.
                </p>
                
                <a 
                  href="https://www.youtube.com/playlist?list=PLgaVB1A1vB-21-v7CHJuOduGv-HZzwTSd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  View full playlist on YouTube
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Featured video */}
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Start Here</h3>
            </div>
            <div className="p-4">
              <div className="rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="315"
                  src="https://www.youtube.com/embed/l2Gb7vOgGug"
                  title="Introduction to Stock Market - Investkaar"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quick concepts */}
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-semibold mb-4">Key Concepts</h3>
            <div className="space-y-3">
              {[
                { term: 'KMI All Shares Index', def: 'The benchmark index for Shariah compliant stocks on PSX. Contains ~285 stocks screened by Meezan Bank.' },
                { term: 'Ex-Dividend Date', def: 'The date you must own a stock to receive its dividend. Buy before this date to qualify.' },
                { term: 'Book Closure', def: 'Period when a company closes its share register to determine who receives dividends or bonus shares.' },
                { term: 'Bonus Shares', def: 'Free additional shares given to existing shareholders instead of cash. Increases your share count.' },
                { term: 'Right Shares', def: 'New shares offered to existing shareholders at a discounted price to raise capital.' },
                { term: 'Withholding Tax', def: 'Tax deducted at source on dividends. 15% for filers, 30% for non-filers.' },
              ].map((c) => (
                <div key={c.term} className="flex gap-4 py-3 border-b border-gray-800 last:border-0">
                  <div className="text-emerald-400 font-semibold text-sm shrink-0 w-48">{c.term}</div>
                  <div className="text-gray-400 text-sm">{c.def}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}