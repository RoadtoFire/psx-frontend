export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 ${className}`}>
      {tabs.map((tab) => {
        const value = tab.value ?? tab
        const label = tab.label ?? tab
        const isActive = active === value
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'bg-gray-800/60 text-ink-mid hover:text-white hover:bg-gray-800 border border-edge'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
