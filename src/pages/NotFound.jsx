import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { AmbientBackground, Logo, Button } from '../components/ui'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      <Seo title="Page not found" noindex />
      <AmbientBackground />
      <div className="relative z-10 text-center max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" aria-label="Amanat home">
            <Logo />
          </Link>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gray-800/80 border border-edge flex items-center justify-center mx-auto mb-6">
          <Compass size={30} className="text-ink-dim" />
        </div>
        <h1 className="text-white text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-ink-mid mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button as={Link} to="/" size="lg">Go home</Button>
          <Button as={Link} to="/learn" variant="secondary" size="lg">Learn Shariah investing</Button>
        </div>
      </div>
    </div>
  )
}
