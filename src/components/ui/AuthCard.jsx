import { Link } from 'react-router-dom'
import AmbientBackground from './AmbientBackground'
import Logo from './Logo'

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <AmbientBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" aria-label="Amanat home">
            <Logo />
          </Link>
        </div>
        <div className="bg-panel/80 backdrop-blur-xl rounded-2xl p-8 border border-edge-soft shadow-2xl">
          {title && <h1 className="text-white text-xl font-bold mb-1">{title}</h1>}
          {subtitle && <p className="text-ink-mid text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="text-center mt-6 text-sm text-ink-mid">{footer}</div>}
      </div>
    </div>
  )
}
