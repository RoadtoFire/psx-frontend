import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBlogPosts } from '../api/blog'
import { PageHeader } from '../components/ui'
import Seo from '../components/Seo'
import { ArrowRight, BookOpen } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function PostCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col bg-panel/60 rounded-2xl border border-edge hover:border-brand-600/40 hover:bg-gray-800/50 transition-all overflow-hidden"
    >
      {post.featured_image_url ? (
        <div className="aspect-[16/9] overflow-hidden bg-gray-800 shrink-0">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-brand-700/30 via-brand-600/20 to-gray-900 flex items-center justify-center shrink-0">
          <BookOpen size={32} className="text-brand-600/50" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <div className="text-ink-dim text-xs mb-3 tabular-nums">
          {formatDate(post.published_at)}
        </div>
        <h2 className="text-white font-bold text-base leading-snug mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-ink-dim text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-auto">
          Read article
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-panel/60 rounded-2xl border border-edge overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-800 rounded w-1/4" />
        <div className="h-5 bg-gray-800 rounded w-5/6" />
        <div className="h-4 bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-800 rounded w-3/4" />
      </div>
    </div>
  )
}

export default function BlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <Seo
        title="Blog"
        description="Insights on Shariah-compliant investing, PSX stocks, dividend income, and macroeconomic signals for Pakistan investors."
        path="/blog"
      />

      <PageHeader
        title="Insights & Analysis"
        subtitle="Shariah-compliant investing in Pakistan"
        className="mb-8"
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="text-ink-dim mx-auto mb-4" />
          <p className="text-ink-mid text-lg font-medium">No articles yet</p>
          <p className="text-ink-dim text-sm mt-1">Check back soon — articles are on the way.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
