import { useState } from 'react'

// Popover renders with position:absolute above the trigger — every ancestor up to
// the positioning context must keep overflow: visible or it will be clipped.
export default function Tooltip({ label, children, align = 'center', width = 'w-60' }) {
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
