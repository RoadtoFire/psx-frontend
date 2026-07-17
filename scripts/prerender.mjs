/**
 * Post-build prerender: snapshots the public routes of the built SPA into
 * static HTML so crawlers and social scrapers see real content and per-page
 * meta tags (React 19 hoists them into <head> at runtime).
 *
 * Design constraints:
 * - Never fail the build: any error logs and exits 0, leaving the plain SPA
 *   build in dist/ fully deployable.
 * - Snapshots the real client bundle in headless Chromium — no SSR entry
 *   needed, so browser-only code (localStorage, IntersectionObserver, OAuth)
 *   just works.
 * - Vercel serves filesystem matches before rewrites, so dist/learn/index.html
 *   wins for /learn while unknown paths still fall through to the SPA.
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PORT = 4173
const BASE = `http://localhost:${PORT}`

// route -> output file relative to dist/
// '/' MUST come last: writing dist/index.html replaces the SPA fallback that
// vite preview serves for every other route, polluting their snapshots.
const ROUTES = {
  '/login': 'login/index.html',
  '/register': 'register/index.html',
  '/forgot-password': 'forgot-password/index.html',
  '/learn': 'learn/index.html',
  '/not-found': '404.html',
  '/': 'index.html',
}

// Third-party nodes injected at runtime that must not be baked into static HTML.
const STRIP_SELECTORS = [
  'script[src*="accounts.google.com"]',
  'link[href*="accounts.google.com"]',
  'iframe[src*="accounts.google.com"]',
  'script[src*="vercel-insights"]',
  'script[src*="/_vercel/insights"]',
]

// Full puppeteer's bundled Chromium can't run on Vercel's build image (missing
// system libraries), so fall back to @sparticuz/chromium (statically linked,
// built for serverless Linux) with puppeteer-core.
async function launchBrowser() {
  try {
    const { default: puppeteer } = await import('puppeteer')
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    console.log('prerender: using full puppeteer')
    return browser
  } catch (err) {
    console.warn(`prerender: full puppeteer unavailable (${err.message.split('\n')[0]}); trying @sparticuz/chromium`)
    const { default: chromium } = await import('@sparticuz/chromium')
    const { default: puppeteerCore } = await import('puppeteer-core')
    const browser = await puppeteerCore.launch({
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, '--no-sandbox'],
      headless: true,
    })
    console.log('prerender: using @sparticuz/chromium')
    return browser
  }
}

async function main() {

  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
    detached: false,
  })

  const cleanup = () => { try { preview.kill() } catch { /* already dead */ } }
  process.on('exit', cleanup)

  // wait for the preview server
  let up = false
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE)
      if (res.ok) { up = true; break }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250))
  }
  if (!up) throw new Error('vite preview did not start')

  const browser = await launchBrowser()

  try {
    for (const [route, outFile] of Object.entries(ROUTES)) {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 900 })
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
      await page.waitForFunction(
        () => document.getElementById('root')?.children.length > 0,
        { timeout: 15000 },
      )

      const html = await page.evaluate((selectors) => {
        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach((el) => el.remove())
        }

        // The static template's default meta and the React-hoisted per-page
        // meta both end up in <head>; keep only the last (React) one per key.
        const keyOf = (el) => {
          if (el.tagName === 'TITLE') return 'title'
          if (el.tagName === 'LINK' && el.rel === 'canonical') return 'canonical'
          if (el.tagName === 'META') {
            const name = el.getAttribute('name') || el.getAttribute('property')
            if (['description', 'robots'].includes(name) || /^(og|twitter):/.test(name || '')) {
              return `meta:${name}`
            }
          }
          return null
        }
        const seen = new Set()
        const nodes = [...document.head.querySelectorAll('title, meta, link[rel="canonical"]')].reverse()
        for (const el of nodes) {
          const key = keyOf(el)
          if (!key) continue
          if (seen.has(key)) el.remove()
          else seen.add(key)
        }

        return '<!doctype html>\n' + document.documentElement.outerHTML
      }, STRIP_SELECTORS)

      const outPath = path.join('dist', outFile)
      await mkdir(path.dirname(outPath), { recursive: true })
      await writeFile(outPath, html)
      console.log(`prerendered ${route} -> ${outPath} (${(html.length / 1024).toFixed(0)} kB)`)
      await page.close()
    }
  } finally {
    await browser.close()
    cleanup()
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.warn(`prerender skipped: ${err.message} — deploying plain SPA build`)
    process.exit(0)
  })
