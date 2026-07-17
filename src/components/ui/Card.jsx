export default function Card({ title, action, className = '', bodyClassName = '', children }) {
  return (
    <div className={`bg-panel/80 rounded-2xl border border-edge ${className}`}>
      {(title || action) && (
        <div className="px-5 sm:px-6 py-4 border-b border-edge flex items-center justify-between gap-3">
          {typeof title === 'string'
            ? <h2 className="text-white font-semibold">{title}</h2>
            : title}
          {action}
        </div>
      )}
      <div className={bodyClassName || 'p-5 sm:p-6'}>{children}</div>
    </div>
  )
}
