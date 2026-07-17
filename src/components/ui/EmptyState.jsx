export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-panel/80 rounded-2xl border border-edge p-12 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-ink-dim" />
        </div>
      )}
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {description && <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  )
}
