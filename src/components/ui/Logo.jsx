export default function Logo({ size = 'md' }) {
  const box = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const glyph = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const name = size === 'sm' ? 'text-base' : 'text-lg'
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${box} rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/30`}>
        <svg viewBox="0 0 24 24" className={`${glyph} text-white fill-none stroke-current`} strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-white font-bold ${name}`}>Amanat</span>
        <span className="text-gray-600 text-sm">|</span>
        <span className="text-brand-400 font-bold font-urdu">امانت</span>
      </div>
    </div>
  )
}
