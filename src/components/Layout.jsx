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
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { path: '/dividends', icon: DollarSign, label: 'Dividends' },
  { path: '/stocks', icon: ShieldCheck, label: 'Stocks' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
]

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

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
        {/* Ambient background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-teal-400 rounded-full filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 fixed h-full z-20">

        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-none stroke-current" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">Amanat</span>
              <span className="text-gray-600 text-sm">|</span>
              <span className="text-emerald-400 font-bold" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>امانت</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  active
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium"
          >
            <User size={18} />
            {user?.email}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-none stroke-current" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-white font-bold">Amanat</span>
          <span className="text-emerald-400 text-sm" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>امانت</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-gray-950/95 backdrop-blur-sm pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-base font-medium ${
                    active
                      ? 'bg-emerald-600/15 text-emerald-400'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 text-base font-medium"
            >
              <LogOut size={20} />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 relative z-10">
        <div className="p-6">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}