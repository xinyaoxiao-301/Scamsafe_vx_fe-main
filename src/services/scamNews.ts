// Service layer for scam news discovery and article detail retrieval. The page
// consumes these typed helpers so API response mapping stays outside the UI.
import { env } from '@/lib/env'

const API_BASE = env.apiBaseUrl

// Shapes returned by GET /api/scam/news
export type NewsListItem = {
  article_id: number
  rank: number
  title: string
  published: string
  source: string
  url: string
}

// Shape returned by GET /api/scam/news/{article_id}
export type NewsDetail = NewsListItem & {
  article_content: string
  tips: string[]
}

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}))
  return (body as { detail?: string }).detail ?? `Server error ${res.status}`
}

export async function fetchNewsList(limit = 10, language = 'en'): Promise<NewsListItem[]> {
  const res = await fetch(`${API_BASE}/api/scam/news?limit=${limit}&language=${language}`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<NewsListItem[]>
}

export async function fetchNewsDetail(articleId: number, language = 'en'): Promise<NewsDetail> {
  const res = await fetch(`${API_BASE}/api/scam/news/${articleId}?language=${language}`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<NewsDetail>
}
