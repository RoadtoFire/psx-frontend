import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { logout } from '../api/auth'
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  BookOpen,
  ShieldCheck,
  Globe,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Activity
} from 'lucide-react'
import { AmbientBackground, Logo, Button } from './ui'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { path: '/dividends', icon: DollarSign, label: 'Dividends' },
  { path: '/stocks', icon: ShieldCheck, label: 'Stocks' },
  { path: '/macro', icon: Globe, label: 'Macro' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
]

function NavLink({ path, icon: Icon, label, active, onClick, mobile = false }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 rounded-xl transition-all font-medium ${
        mobile ? 'py-4 text-base' : 'py-3 text-sm'
      } ${
        active
          ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
          : 'text-ink-mid hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={mobile ? 20 : 18} />
      {label}
    </Link>
  )
}

export default function Layout({ children }) {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-surface flex relative overflow-x-hidden">
      <AmbientBackground />

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-panel/80 backdrop-blur-xl border-r border-edge fixed h-full z-20">
        <div className="p-6 border-b border-edge">
          <Link to={user ? '/dashboard' : '/'} aria-label="Amanat home">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} {...item} active={location.pathname === item.path} />
          ))}
          {user?.is_staff && (
            <NavLink
              path="/admin"
              icon={Activity}
              label="Scrape Monitor"
              active={location.pathname === '/admin'}
            />
          )}
        </nav>

        <div className="p-4 border-t border-edge space-y-1">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-mid hover:bg-gray-800 hover:text-white transition-all text-sm font-medium"
              >
                <User size={18} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-mid hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" className="w-full">
                <LogIn size={16} />
                Sign in
              </Button>
              <Link
                to="/register"
                className="flex items-center justify-center px-4 py-3 rounded-xl text-ink-mid hover:text-white transition-colors text-sm font-medium"
              >
                Create free account
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-panel/80 backdrop-blur-xl border-b border-edge px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} aria-label="Amanat home">
          <Logo size="sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-ink-mid hover:text-white p-1"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-surface/95 backdrop-blur-sm pt-16 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                mobile
                active={location.pathname === item.path}
                onClick={closeMobile}
              />
            ))}
            {user?.is_staff && (
              <NavLink
                path="/admin"
                icon={Activity}
                label="Scrape Monitor"
                mobile
                active={location.pathname === '/admin'}
                onClick={closeMobile}
              />
            )}
            {user ? (
              <>
                <NavLink
                  path="/profile"
                  icon={User}
                  label="Profile"
                  mobile
                  active={location.pathname === '/profile'}
                  onClick={closeMobile}
                />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 text-base font-medium"
                >
                  <LogOut size={20} />
                  Sign out
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2 px-1">
                <Button as={Link} to="/login" size="lg" className="w-full" onClick={closeMobile}>
                  <LogIn size={18} />
                  Sign in
                </Button>
                <Button as={Link} to="/register" variant="secondary" size="lg" className="w-full" onClick={closeMobile}>
                  Create free account
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Main content */}
      {/* min-w-0: without it this flex item refuses to shrink below its content's
          intrinsic width, silently clipping pages on narrow viewports */}
      <main className="flex-1 min-w-0 md:ml-64 pt-16 md:pt-0 relative z-10">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
