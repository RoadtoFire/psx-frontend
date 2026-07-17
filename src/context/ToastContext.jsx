import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((message, { type = 'success', duration = 4000 } = {}) => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, message, type }])
    if (duration) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const value = {
    success: (msg, opts) => push(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => push(msg, { ...opts, type: 'error', duration: 6000 }),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 z-[60] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm max-w-sm w-full sm:w-auto ${
              type === 'error'
                ? 'bg-red-950/80 border-red-500/30 text-red-200'
                : 'bg-panel/90 border-emerald-500/30 text-gray-100'
            }`}
          >
            {type === 'error'
              ? <AlertCircle size={18} className="text-red-400 shrink-0" />
              : <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            <span className="flex-1">{message}</span>
            <button onClick={() => dismiss(id)} className="text-ink-dim hover:text-white shrink-0" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
