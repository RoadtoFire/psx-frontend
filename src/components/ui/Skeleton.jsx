export function Skeleton({ className = '' }) {
  return <div className={`bg-gray-800 rounded animate-pulse ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-panel/80 rounded-2xl p-6 border border-edge animate-pulse ${className}`}>
      <div className="w-10 h-10 bg-gray-800 rounded-xl mb-4" />
      <div className="h-7 bg-gray-800 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
    </div>
  )
}
