import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Landmark, Moon, TrendingUp, MonitorPlay } from 'lucide-react'
import { PageHeader, Card, Tabs, Badge } from '../components/ui'
import Seo from '../components/Seo'

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
      className={`rounded-2xl border ${item.border} ${item.bg} p-5 cursor-pointer transition-all hover:brightness-110`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={`text-2xl font-black font-mono ${item.color} shrink-0`}>{item.number}</span>
          <div>
            <div className="text-white font-semibold">{item.title}</div>
            <div className="text-ink-mid text-sm mt-1">{item.short}</div>
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

function IconChip({ icon: Icon, className }) {
  return (
    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${className}`}>
      <Icon size={22} />
    </div>
  )
}

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ...shariah_criteria.map((c) => ({
      '@type': 'Question',
      name: `Shariah screening: ${c.title}`,
      acceptedAnswer: { '@type': 'Answer', text: c.detail },
    })),
    {
      '@type': 'Question',
      name: 'What is dividend purification in Islamic investing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Even Shariah-compliant companies may earn a small amount of non-compliant income (under 5%). When you receive dividends, you must donate the equivalent proportion to charity. Amanat calculates this automatically based on the purification ratios published by Al-Meezan in their semi-annual KMI recomposition reports.',
      },
    },
  ],
}

export default function Learn() {
  const [activeTab, setActiveTab] = useState('shariah')

  return (
    <div className="max-w-3xl mx-auto">
      <Seo
        title="Learn Shariah Investing on PSX"
        description="How Shariah-compliant stock screening works on the Pakistan Stock Exchange: the 6 KMI criteria, dividend purification, withholding tax, and investing basics — explained simply."
        path="/learn"
        jsonLd={FAQ_JSON_LD}
      />
      <PageHeader
        title="Learn"
        subtitle="Understand Shariah investing and stock market basics"
      />

      <Tabs
        className="mb-8"
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: 'shariah', label: 'Shariah Compliance' },
          { value: 'investing', label: 'Investing Basics' },
        ]}
      />

      {activeTab === 'shariah' && (
        <div className="space-y-4">
          <Card className="mb-6">
            <div className="flex items-start gap-4">
              <IconChip icon={Landmark} className="bg-brand-600/15 text-brand-400 border-brand-600/20" />
              <div>
                <h2 className="text-white font-bold text-lg mb-2">What makes a stock Shariah compliant?</h2>
                <p className="text-ink-mid text-sm leading-relaxed">
                  The KMI All Shares Islamic Index is developed by PSX and Meezan Bank. A stock must pass
                  all 6 criteria below to be included. The index is reviewed every 6 months — stocks that
                  no longer qualify are removed.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">285 compliant stocks on PSX</Badge>
                  <Badge tone="gray">Reviewed every 6 months</Badge>
                </div>
              </div>
            </div>
          </Card>

          {shariah_criteria.map((item) => (
            <CriteriaCard key={item.number} item={item} />
          ))}

          {/* Purification explainer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-4">
              <IconChip icon={Moon} className="bg-amber-500/15 text-amber-400 border-amber-500/20" />
              <div>
                <h3 className="text-white font-bold mb-2">What is Purification?</h3>
                <p className="text-ink-mid text-sm leading-relaxed">
                  Even Shariah-compliant companies may earn a small amount of non-compliant income
                  (under 5%). When you receive dividends, you must donate the equivalent proportion
                  to charity. This is called <span className="text-amber-400 font-medium">purification (تطهير)</span>.
                </p>
                <p className="text-ink-mid text-sm leading-relaxed mt-2">
                  Amanat calculates this automatically for every dividend you receive based on
                  the purification ratios published by Al-Meezan in their semi-annual KMI recomposition reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investing' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-4">
              <IconChip icon={MonitorPlay} className="bg-red-500/15 text-red-400 border-red-500/20" />
              <div>
                <h2 className="text-white font-bold text-lg mb-2">Investkaar — Learn to Invest in Urdu</h2>
                <p className="text-ink-mid text-sm leading-relaxed">
                  The best Pakistani YouTube channel for learning stock market investing from scratch.
                  All videos are in Urdu and specifically cover the Pakistan Stock Exchange.
                </p>

                <a
                  href="https://www.youtube.com/playlist?list=PLgaVB1A1vB-21-v7CHJuOduGv-HZzwTSd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-brand-400 hover:text-brand-light text-sm font-medium transition-colors"
                >
                  View full playlist on YouTube
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </Card>

          <Card title="Start Here" bodyClassName="p-4">
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
          </Card>

          <Card>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-400" />
              Key Concepts
            </h3>
            <div className="space-y-3">
              {[
                { term: 'KMI All Shares Index', def: 'The benchmark index for Shariah compliant stocks on PSX. Contains ~285 stocks screened by Meezan Bank.' },
                { term: 'Ex-Dividend Date', def: 'The date you must own a stock to receive its dividend. Buy before this date to qualify.' },
                { term: 'Book Closure', def: 'Period when a company closes its share register to determine who receives dividends or bonus shares.' },
                { term: 'Bonus Shares', def: 'Free additional shares given to existing shareholders instead of cash. Increases your share count.' },
                { term: 'Right Shares', def: 'New shares offered to existing shareholders at a discounted price to raise capital.' },
                { term: 'Withholding Tax', def: 'Tax deducted at source on dividends. 15% for filers, 30% for non-filers.' },
              ].map((c) => (
                <div key={c.term} className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-3 border-b border-edge last:border-0">
                  <div className="text-brand-400 font-semibold text-sm shrink-0 sm:w-48">{c.term}</div>
                  <div className="text-ink-mid text-sm">{c.def}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
