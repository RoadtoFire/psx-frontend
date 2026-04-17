import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS] = useState(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
  )
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Don't show if already installed (running as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isStandalone) return

    // Don't show if user already dismissed
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) return

    if (isIOS) {
      // Show iOS banner after a short delay
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isIOS])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop blur for iOS instruction panel */}
      {isIOS && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={handleDismiss}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        `}</style>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 max-w-md mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                A
              </div>
              <div>
                <div className="text-white font-medium text-sm">Amanat | امانت</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {isIOS ? 'Add to Home Screen' : 'Install App'}
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {isIOS ? (
            <>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Install Amanat on your home screen for the best experience — works offline and opens instantly.
              </p>
              <div className="bg-gray-800 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Share size={15} className="text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    Tap the <span className="text-white font-medium">Share</span> button in Safari's toolbar
                  </p>
                </div>
                <div className="w-full h-px bg-gray-700" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    Scroll down and tap <span className="text-white font-medium">Add to Home Screen</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Install Amanat on your home screen for the best experience — works offline and opens instantly.
              </p>
              <button
                onClick={handleInstallAndroid}
                className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}