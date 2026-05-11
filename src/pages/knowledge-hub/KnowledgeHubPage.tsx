import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import { fetchNewsList, fetchNewsDetail } from '@/services/scamNews'
import type { NewsListItem, NewsDetail } from '@/services/scamNews'

type KnowledgeHubPageProps = {
  onBackHome: () => void
}

const htmlEntityMap: Record<string, string> = {
  amp: '&',
  apos: '\'',
  bull: '•',
  copy: '©',
  emsp: ' ',
  ensp: ' ',
  gt: '>',
  hellip: '...',
  ldquo: '"',
  lsquo: '\'',
  lt: '<',
  mdash: '-',
  middot: '·',
  nbsp: ' ',
  ndash: '-',
  quot: '"',
  rdquo: '"',
  reg: '®',
  rsquo: '\'',
  trade: '™',
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const normalizedEntity = entity.toLowerCase()
    if (normalizedEntity.startsWith('#x')) {
      const codePoint = Number.parseInt(normalizedEntity.slice(2), 16)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    if (normalizedEntity.startsWith('#')) {
      const codePoint = Number.parseInt(normalizedEntity.slice(1), 10)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    return htmlEntityMap[normalizedEntity] ?? match
  })
}

function formatArticleContent(value: string): string[] {
  const normalizedText = value
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(li)\b[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<\/?(p|div|section|article|blockquote|ul|ol|h[1-6])>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\t/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')

  return decodeHtmlEntities(normalizedText)
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export function KnowledgeHubPage({ onBackHome }: KnowledgeHubPageProps) {
  const { language, strings } = useI18n()
  const s = strings.knowledgeHub
  const newsSectionRef = useRef<HTMLElement | null>(null)
  const [newsItems, setNewsItems] = useState<NewsListItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null)
  const [newsDetailLoading, setNewsDetailLoading] = useState(false)
  const [isReadingArticle, setIsReadingArticle] = useState(false)

  const returnToArticleList = () => {
    setIsReadingArticle(false)
    // Wait for the list to re-render, then scroll the Live feed card into view.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  useEffect(() => {
    let cancelled = false
    fetchNewsList(10)
      .then((items) => {
        if (cancelled) return
        setNewsItems(items)
        if (items.length > 0) setSelectedNewsId(items[0].article_id)
      })
      .catch((err: unknown) => {
        if (!cancelled) setNewsError(err instanceof Error ? err.message : s.newsErrorPrefix)
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false)
      })
    return () => { cancelled = true }
  }, [s.newsErrorPrefix])

  useEffect(() => {
    if (selectedNewsId === null) return
    let cancelled = false
    setNewsDetailLoading(true)
    setNewsDetail(null)
    fetchNewsDetail(selectedNewsId)
      .then((detail) => { if (!cancelled) setNewsDetail(detail) })
      .catch(() => { /* detail errors are non-critical; list still visible */ })
      .finally(() => { if (!cancelled) setNewsDetailLoading(false) })
    return () => { cancelled = true }
  }, [selectedNewsId])

  const formatShortDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString(language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-Hans-MY' : 'en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : ''

  const formatLongDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString(language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-Hans-MY' : 'en-MY', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : ''

  return (
    <main className="knowledge-hub-page" aria-label={s.title}>
      <section className="knowledge-hub-page__hero">
        <h1>{s.title}</h1>
      </section>

      <section
        ref={newsSectionRef}
        className="knowledge-hub-page__news-section"
        aria-label={s.newsSectionLabel}
      >
        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--news"
          eyebrow={s.liveFeedEyebrow}
          eyebrowClassName="knowledge-hub-page__section-eyebrow"
          title={s.latestReportsTitle}
          description={s.latestReportsDescription}
          footer={
            <div className="knowledge-hub-page__overview-footer">
              {!newsLoading && !newsError && newsItems.length > 0 ? (
                <p className="knowledge-hub-page__overview-note">
                  {isReadingArticle
                    ? s.readingNote
                    : s.chooseNote}
                </p>
              ) : null}
            </div>
          }
        >
          {newsLoading && (
            <p className="knowledge-hub-page__news-status">{s.loadingNews}</p>
          )}
          {newsError && (
            <p className="knowledge-hub-page__news-status knowledge-hub-page__news-status--error">
              {s.newsErrorPrefix}: {newsError}
            </p>
          )}
          {!newsLoading && !newsError && newsItems.length === 0 && (
            <p className="knowledge-hub-page__news-status">{s.noNews}</p>
          )}
          {!newsLoading && !newsError && newsItems.length > 0 && (
            <div
              className={
                isReadingArticle
                  ? 'knowledge-hub-page__workspace knowledge-hub-page__workspace--reading'
                  : 'knowledge-hub-page__workspace'
              }
            >
              {!isReadingArticle ? (
                <div
                  className="knowledge-hub-page__article-list"
                  role="list"
                  aria-label={s.newsArticlesLabel}
                >
                  {newsItems.map((item) => {
                    const isActive = item.article_id === selectedNewsId
                    return (
                      <button
                        key={item.article_id}
                        type="button"
                        role="listitem"
                        aria-pressed={isActive}
                        className={
                          isActive
                            ? 'knowledge-hub-page__article-card knowledge-hub-page__article-card--active'
                            : 'knowledge-hub-page__article-card'
                        }
                        onClick={() => {
                          setSelectedNewsId(item.article_id)
                          setIsReadingArticle(true)
                        }}
                      >
                        <span className="knowledge-hub-page__article-date">{formatShortDate(item.published)}</span>
                        <strong className="knowledge-hub-page__article-title">{item.title}</strong>
                        <span className="knowledge-hub-page__article-source">{item.source}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              <article
                className={
                  isReadingArticle
                    ? 'knowledge-hub-page__reader knowledge-hub-page__reader--expanded'
                    : 'knowledge-hub-page__reader knowledge-hub-page__reader--placeholder'
                }
                aria-label={s.selectedArticleLabel}
              >
                {!isReadingArticle ? (
                  <div className="knowledge-hub-page__reader-empty">
                    <p className="knowledge-hub-page__section-eyebrow">{s.step1Eyebrow}</p>
                    <h2 className="knowledge-hub-page__reader-title">{s.chooseArticleTitle}</h2>
                    <p className="knowledge-hub-page__reader-empty-copy">
                      {s.chooseArticleDescription}
                    </p>
                    <div className="knowledge-hub-page__reader-footer knowledge-hub-page__reader-footer--single">
                      <Button variant="secondary" onClick={onBackHome}>
                        {strings.common.backToHome}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {isReadingArticle && newsDetailLoading ? (
                  <p className="knowledge-hub-page__news-status">{s.loadingArticle}</p>
                ) : null}

                {isReadingArticle && !newsDetailLoading && newsDetail ? (
                  <>
                    <div className="knowledge-hub-page__reader-top">
                      <p className="knowledge-hub-page__reader-eyebrow">{s.articleDetailEyebrow}</p>
                      <h2 className="knowledge-hub-page__reader-title">{newsDetail.title}</h2>
                      <div className="knowledge-hub-page__reader-meta">
                        <span>{formatLongDate(newsDetail.published)}</span>
                        <span className="knowledge-hub-page__reader-source">{newsDetail.source}</span>
                        <a
                          className="knowledge-hub-page__source-link"
                          href={newsDetail.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.readSource}
                        </a>
                      </div>
                    </div>

                    <div className="knowledge-hub-page__reader-body">
                      {formatArticleContent(newsDetail.article_content).map((paragraph, index) => (
                        <p key={`${newsDetail.article_id}-${index}`}>{paragraph}</p>
                      ))}
                    </div>

                    {newsDetail.tips.length > 0 ? (
                      <div className="knowledge-hub-page__reader-grid">
                        <section className="knowledge-hub-page__reader-panel">
                          <p className="knowledge-hub-page__panel-title">{s.tipsTitle}</p>
                          <ul className="knowledge-hub-page__panel-list">
                            {newsDetail.tips.map((tip) => (
                              <li key={tip}>{tip}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    ) : null}

                    <div className="knowledge-hub-page__reader-footer">
                      <Button variant="primary" onClick={returnToArticleList}>
                        {s.chooseAnotherArticle}
                      </Button>
                      <Button variant="secondary" onClick={onBackHome}>
                        {strings.common.backToHome}
                      </Button>
                    </div>
                  </>
                ) : null}
              </article>
            </div>
          )}
        </SectionCard>
      </section>
    </main>
  )
}
