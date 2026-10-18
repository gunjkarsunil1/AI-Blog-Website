import 'dotenv/config'
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

app.use(express.json({ limit: '20kb' }))
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

app.get('/api/news', async (request, response) => {
  const key = process.env.NEWS_API_KEY
  if (!key) {
    response.set('Cache-Control', 'no-store')
    response.json({
      mode: 'demo',
      articles: [],
      message: 'No live-news provider is configured. Showing clearly labeled editorial demo stories.',
    })
    return
  }

  const limit = Math.min(Math.max(Number(request.query.limit) || 12, 1), 50)
  try {
    const newsUrl = new URL('https://newsapi.org/v2/everything')
    newsUrl.searchParams.set('q', '"artificial intelligence" OR "generative AI"')
    newsUrl.searchParams.set('language', 'en')
    newsUrl.searchParams.set('sortBy', 'publishedAt')
    newsUrl.searchParams.set('pageSize', String(limit))
    const result = await fetch(newsUrl, {
      headers: { 'X-Api-Key': key },
      signal: AbortSignal.timeout(9000),
    })
    if (!result.ok) {
      const detail = await result.text()
      console.error(`NewsAPI returned ${result.status}: ${detail.slice(0, 500)}`)
      response.status(result.status === 401 || result.status === 426 ? 502 : result.status)
        .json({ error: 'The live news provider could not complete this request.' })
      return
    }
    const payload: unknown = await result.json()
    if (!payload || typeof payload !== 'object' || !('articles' in payload) || !Array.isArray(payload.articles)) {
      response.status(502).json({ error: 'The live news provider returned an unexpected response.' })
      return
    }
    const normalized = payload.articles.flatMap((raw: unknown, index: number) => {
      if (!raw || typeof raw !== 'object') return []
      const item = raw as Record<string, unknown>
      if (typeof item.title !== 'string' || typeof item.url !== 'string' || typeof item.publishedAt !== 'string') return []
      const title = item.title.trim()
      const url = item.url
      let urlIsSafe = false
      try { urlIsSafe = new URL(url).protocol === 'https:' } catch { urlIsSafe = false }
      if (!title || title === '[Removed]' || !urlIsSafe) return []
      const source = item.source && typeof item.source === 'object' && 'name' in item.source
        ? (item.source as { name: unknown }).name : undefined
      const parsedDate = new Date(item.publishedAt)
      return [{
        slug: `live-${index}-${encodeURIComponent(new URL(url).hostname)}`,
        category: 'Live coverage',
        title,
        excerpt: typeof item.description === 'string' ? item.description : 'Read the original coverage for reporting details.',
        author: typeof item.author === 'string' && item.author.length <= 120 ? item.author : (typeof source === 'string' ? source : 'News source'),
        date: Number.isNaN(parsedDate.valueOf()) ? item.publishedAt : parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
        readTime: 'Source article',
        gradient: ['art-hero', 'art-model', 'art-society', 'art-work'][index % 4],
        art: typeof source === 'string' ? `Reporting from ${source}` : 'Independent coverage',
        trending: index < 3,
        sourceUrl: url,
        sourceName: typeof source === 'string' ? source : 'Original publisher',
        body: typeof item.description === 'string' && item.description ? [item.description] : [],
      }]
    })
    response.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    response.json({ mode: 'live', articles: normalized })
  } catch (error) {
    console.error('Could not reach the configured news provider:', error)
    response.status(502).json({ error: 'The live news provider is temporarily unavailable.' })
  }
})

if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*splat', (_request, response) => response.sendFile(path.join(dist, 'index.html')))
}

app.listen(port, () => {
  console.log(`Signal API listening on http://localhost:${port}${process.env.NEWS_API_KEY ? ' (live news configured)' : ' (editorial demo mode)'}`)
})
