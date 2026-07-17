import { useEffect } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
}

export default function Modal({ open = true, onClose, title, size = 'md', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-full ${SIZES[size]} bg-panel rounded-2xl border border-edge shadow-2xl max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="px-6 py-4 border-b border-edge flex items-center justify-between shrink-0">
            <h2 className="text-white font-semibold">{title}</h2>
            {onClose && (
              <button onClick={onClose} className="text-ink-dim hover:text-white transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-edge shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
