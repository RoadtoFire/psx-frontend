const SITE = 'https://amanat-psx.com'
const DEFAULT_IMAGE = `${SITE}/og-image.png`
const SITE_NAME = 'Amanat | امانت'

// React 19 hoists <title>/<meta>/<link> rendered anywhere into <head>.
// Public pages pass real copy; protected pages pass noindex for a clean tab
// title without inviting indexing.
export default function Seo({ title, description, path = '/', image, noindex = false, jsonLd }) {
  const fullTitle = title ? `${title} · Amanat` : SITE_NAME
  const url = `${SITE}${path}`

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
      {!noindex && <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </>
  )
}
