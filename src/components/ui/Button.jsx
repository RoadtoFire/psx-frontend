import Spinner from './Spinner'

const VARIANTS = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20',
  secondary: 'bg-gray-800/60 hover:bg-gray-800 text-gray-200 border border-edge',
  ghost: 'text-ink-mid hover:text-white hover:bg-gray-800/60',
  danger: 'bg-danger/10 hover:bg-danger/20 text-red-400 border border-danger/20',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-sm gap-2',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </Tag>
  )
}
