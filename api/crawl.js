import { load } from 'cheerio'

const MAX_CHARS = 120_000
const MAX_PRIORITY_PAGES = 12
const MAX_PRODUCT_PAGES = 6 // second-wave detail pages from product/menu/pricing containers

// First-wave: pages likely to have overview content
const PRIORITY_PATHS = [
  '/about', '/contact', '/faq', '/support', '/help',
  '/products', '/product', '/shop', '/store', '/catalog', '/catalogue',
  '/services', '/service',
  '/pricing', '/price', '/prices', '/rates', '/plans', '/packages',
  '/menu', '/food', '/drinks', '/order',
  '/offers', '/deals', '/promotions', '/specials', '/promo',
  '/collections', '/categories', '/category',
  '/tours', '/tour', '/experiences', '/activities',
  '/booking', '/reservations', '/reserve',
]

// Second-wave: pages that likely *contain* links to individual product/item detail pages
const PRODUCT_CONTAINER_PATHS = [
  '/products', '/shop', '/store', '/catalog', '/catalogue',
  '/menu', '/services', '/pricing', '/plans', '/packages',
  '/tours', '/collections', '/categories', '/experiences',
]

function extractText($) {
  $('script:not([type="application/ld+json"]), style, noscript, nav, footer, header, [role="navigation"], [role="banner"], [role="contentinfo"], .cookie-banner, .cookie-notice, #cookie').remove()

  // Preserve table structure before text extraction
  $('table').each((_, table) => {
    const rows = []
    $(table).find('tr').each((_, row) => {
      const cells = []
      $(row).find('th, td').each((_, cell) => {
        cells.push($(cell).text().replace(/\s+/g, ' ').trim())
      })
      if (cells.some(c => c.length > 0)) rows.push(cells.join(' | '))
    })
    if (rows.length > 0) {
      $(table).replaceWith(`\n[TABLE]\n${rows.join('\n')}\n[/TABLE]\n`)
    }
  })

  const main = $('main, article, [role="main"], .content, #content, .main, #main').first()
  const source = main.length ? main : $('body')
  return source.text().replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

// Extract JSON-LD structured data (product schemas, menus, services, prices, offers)
function extractJsonLd($) {
  const schemas = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html()
      if (!raw) return
      const data = JSON.parse(raw)
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const type = item['@type']
        if (!type) continue
        // Only extract commercially relevant schemas
        const relevant = [
          'Product', 'Offer', 'AggregateOffer', 'Service', 'MenuItem', 'Menu',
          'MenuSection', 'FoodEstablishment', 'LocalBusiness', 'Store',
          'Hotel', 'Event', 'TouristAttraction', 'TouristTrip',
          'PriceSpecification', 'ItemList',
        ]
        if (relevant.some(t => type === t || (Array.isArray(type) && type.includes(t)))) {
          schemas.push(item)
        }
      }
    } catch {}
  })
  if (schemas.length === 0) return ''
  return '[STRUCTURED DATA]\n' + JSON.stringify(schemas, null, 2).slice(0, 20_000) + '\n[/STRUCTURED DATA]'
}

function resolveUrl(base, href) {
  try { return new URL(href, base).href } catch { return null }
}

function isSameOrigin(base, url) {
  try { return new URL(url).origin === new URL(base).origin } catch { return false }
}

function isLikelyFile(url) {
  return /\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4|mp3|css|js|xml|json)$/i.test(new URL(url).pathname)
}

function extractLogoUrl($, baseUrl) {
  const candidates = [
    $('link[rel="apple-touch-icon"]').attr('href'),
    $('link[rel="apple-touch-icon-precomposed"]').attr('href'),
    $('link[rel~="icon"][type="image/png"]').first().attr('href'),
    $('link[rel~="icon"]').first().attr('href'),
    $('meta[property="og:image"]').attr('content'),
  ]
  for (const href of candidates) {
    if (href) {
      const resolved = resolveUrl(baseUrl, href)
      if (resolved) return resolved
    }
  }
  try { return new URL('/favicon.ico', baseUrl).href } catch { return null }
}

function getPriorityLinks($, baseUrl) {
  const links = new Map() // url -> priority score
  $('a[href]').each((_, el) => {
    const href = $( el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    const resolved = resolveUrl(baseUrl, href)
    if (!resolved || !isSameOrigin(baseUrl, resolved)) return
    try { if (isLikelyFile(resolved)) return } catch {}
    const path = new URL(resolved).pathname.toLowerCase()
    const matchIndex = PRIORITY_PATHS.findIndex(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '-'))
    if (matchIndex >= 0) {
      const existing = links.get(resolved)
      if (existing === undefined || matchIndex < existing) links.set(resolved, matchIndex)
    }
  })
  // Sort by priority score (lower index = higher priority) then dedupe
  return [...links.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([url]) => url)
    .slice(0, MAX_PRIORITY_PAGES)
}

// From a product container page, extract links to individual detail pages
function getDetailLinks($, baseUrl, containerUrl) {
  const containerPath = new URL(containerUrl).pathname.toLowerCase()
  const links = new Set()
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    const resolved = resolveUrl(baseUrl, href)
    if (!resolved || !isSameOrigin(baseUrl, resolved)) return
    try { if (isLikelyFile(resolved)) return } catch {}
    const path = new URL(resolved).pathname.toLowerCase()
    // Must be deeper than the container path (e.g. /products/item-name)
    if (path.startsWith(containerPath + '/') && path !== containerPath + '/') {
      links.add(resolved)
    }
  })
  return [...links].slice(0, MAX_PRODUCT_PAGES)
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Auralis-Crawler/1.0 (+https://auralis.app)' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) return null
  return res.text()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { url } = req.body || {}
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required.' })
  }

  let rootUrl
  try {
    rootUrl = new URL(url.startsWith('http') ? url : `https://${url}`).href
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' })
  }

  try {
    const rootHtml = await fetchPage(rootUrl)
    if (!rootHtml) {
      return res.status(422).json({ error: 'Could not fetch the page. Make sure the URL is public and accessible.' })
    }

    const $root = load(rootHtml)

    const pageTitle = $root('title').text().trim()
    const ogTitle = $root('meta[property="og:title"]').attr('content') || ''
    const ogDesc = $root('meta[property="og:description"]').attr('content') || ''
    const metaDesc = $root('meta[name="description"]').attr('content') || ''
    const logoUrl = extractLogoUrl($root, rootUrl)

    const priorityUrls = getPriorityLinks($root, rootUrl)

    const sections = []
    const rootText = extractText($root)
    const rootJsonLd = extractJsonLd($root)
    sections.push(`[Page: ${rootUrl}]\n${rootText}${rootJsonLd ? '\n\n' + rootJsonLd : ''}`)

    // First wave: priority pages in parallel
    const priorityPages = await Promise.allSettled(priorityUrls.map(u => fetchPage(u)))

    const productContainerPages = [] // track which fetched pages are product containers for second wave

    priorityPages.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value) {
        const $page = load(result.value)
        const text = extractText($page)
        const jsonLd = extractJsonLd($page)
        if (text.length > 100 || jsonLd.length > 0) {
          sections.push(`[Page: ${priorityUrls[i]}]\n${text}${jsonLd ? '\n\n' + jsonLd : ''}`)
        }
        // If this is a product container, queue for second-wave crawl
        const path = new URL(priorityUrls[i]).pathname.toLowerCase()
        if (PRODUCT_CONTAINER_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
          productContainerPages.push({ url: priorityUrls[i], $page })
        }
      }
    })

    // Second wave: individual product/item detail pages from container pages
    const detailUrlSet = new Set()
    for (const { url: containerUrl, $page } of productContainerPages) {
      for (const detailUrl of getDetailLinks($page, rootUrl, containerUrl)) {
        detailUrlSet.add(detailUrl)
        if (detailUrlSet.size >= MAX_PRODUCT_PAGES) break
      }
      if (detailUrlSet.size >= MAX_PRODUCT_PAGES) break
    }

    if (detailUrlSet.size > 0) {
      const detailUrls = [...detailUrlSet]
      const detailPages = await Promise.allSettled(detailUrls.map(u => fetchPage(u)))
      detailPages.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          const $page = load(result.value)
          const text = extractText($page)
          const jsonLd = extractJsonLd($page)
          if (text.length > 100 || jsonLd.length > 0) {
            sections.push(`[Page: ${detailUrls[i]}]\n${text}${jsonLd ? '\n\n' + jsonLd : ''}`)
          }
        }
      })
    }

    const rawContent = sections.join('\n\n---\n\n')
    const content = rawContent.slice(0, MAX_CHARS)

    return res.status(200).json({
      content,
      meta: { pageTitle, ogTitle, ogDesc, metaDesc, url: rootUrl, logoUrl },
    })
  } catch (err) {
    console.error('[crawl] Error:', err)
    return res.status(500).json({ error: 'Failed to crawl the page.' })
  }
}
