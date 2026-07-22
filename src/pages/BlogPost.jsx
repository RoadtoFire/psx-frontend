import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getBlogPost } from '../api/blog'
import Seo from '../components/Seo'
import { ArrowLeft, Share2, Check } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false)

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`
  const twUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — do nothing
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-ink-dim text-sm flex items-center gap-1.5">
        <Share2 size={14} />
        Share:
      </span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-green-600/15 text-green-400 border border-green-600/20 text-xs font-medium hover:bg-green-600/25 transition-colors"
      >
        WhatsApp
      </a>
      <a
        href={twUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-gray-800 text-ink-mid border border-edge text-xs font-medium hover:text-white transition-colors"
      >
        X / Twitter
      </a>
      <button
        onClick={copyLink}
        className="px-3 py-1.5 rounded-lg bg-gray-800 text-ink-mid border border-edge text-xs font-medium hover:text-white transition-colors flex items-center gap-1"
      >
        {copied ? <><Check size={12} /> Copied!</> : 'Copy link'}
      </button>
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBlogPost(slug)
      .then(setPost)
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  const postUrl = `https://www.amanat-psx.com/blog/${slug}`

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4 pt-4">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-8" />
        <div className="aspect-[16/9] bg-gray-800 rounded-2xl mb-8" />
        <div className="h-8 bg-gray-800 rounded w-4/5" />
        <div className="h-4 bg-gray-800 rounded w-1/4" />
        <div className="space-y-3 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: `${75 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-2xl mx-auto">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.featured_image_url || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at,
          author: { '@type': 'Person', name: post.author_name },
          publisher: { '@type': 'Organization', name: 'Amanat | امانت' },
          ...(post.featured_image_url ? { image: post.featured_image_url } : {}),
        }}
      />

      {/* Back link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-ink-dim hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        All articles
      </Link>

      {/* Featured image */}
      {post.featured_image_url && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-800">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-white text-3xl font-bold leading-tight mb-4" style={{ textWrap: 'balance' }}>
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-ink-dim text-sm">
          <span>{post.author_name}</span>
          <span className="text-edge">·</span>
          <span className="tabular-nums">{formatDate(post.published_at)}</span>
        </div>
      </header>

      <div className="border-t border-edge mb-8" />

      {/* Content */}
      <div className="blog-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Share */}
      <div className="border-t border-edge mt-12 pt-8">
        <ShareButtons title={post.title} url={postUrl} />
      </div>

      {/* Footer nav */}
      <div className="mt-10 pt-8 border-t border-edge">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Back to all articles
        </Link>
      </div>
    </div>
  )
}
