import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import { fetchNewsList, fetchNewsDetail } from '@/services/scamNews'
import type { NewsListItem, NewsDetail } from '@/services/scamNews'

type KnowledgeHubPageProps = {
  onBackHome: () => void
}

export function KnowledgeHubPage({ onBackHome }: KnowledgeHubPageProps) {
  const { strings } = useI18n()
  const [newsItems, setNewsItems] = useState<NewsListItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null)
  const [newsDetailLoading, setNewsDetailLoading] = useState(false)
  const [isReadingArticle, setIsReadingArticle] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchNewsList(10)
      .then((items) => {
        if (cancelled) return
        setNewsItems(items)
        if (items.length > 0) setSelectedNewsId(items[0].article_id)
      })
      .catch((err: unknown) => {
        if (!cancelled) setNewsError(err instanceof Error ? err.message : 'Failed to load news')
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

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
      ? new Date(value).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : ''

  const formatLongDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : ''

  return (
    <main className="knowledge-hub-page" aria-label={strings.knowledgeHub.title}>
      <section className="knowledge-hub-page__hero">
        <p className="knowledge-hub-page__eyebrow">{strings.knowledgeHub.eyebrow}</p>
        <h1>{strings.knowledgeHub.title}</h1>
        <p className="knowledge-hub-page__description">
          {strings.knowledgeHub.description}
        </p>
        <div className="knowledge-hub-page__hero-note">
          <span>Recent scam reports include source links, full article text, and prevention tips.</span>
        </div>
      </section>

      <section className="knowledge-hub-page__news-section" aria-label="Latest scam news">
        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--news"
          eyebrow="Live feed"
          title="Read the latest scam reports"
          description="Open a recent article to review its title, source, full text, and linked prevention tips."
          footer={
            <div className="knowledge-hub-page__overview-footer">
              <p className="knowledge-hub-page__overview-note">
                {isReadingArticle ? 'You are now reading one selected article.' : 'Choose one article to open the reading view.'}
              </p>
            </div>
          }
        >
          {newsLoading && (
            <p className="knowledge-hub-page__news-status">Loading latest news…</p>
          )}
          {newsError && (
            <p className="knowledge-hub-page__news-status knowledge-hub-page__news-status--error">
              Could not load news: {newsError}
            </p>
          )}
          {!newsLoading && !newsError && newsItems.length === 0 && (
            <p className="knowledge-hub-page__news-status">No news articles available yet.</p>
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
                  aria-label="News articles"
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
                aria-label="Selected news article"
              >
                {!isReadingArticle ? (
                  <div className="knowledge-hub-page__reader-empty">
                    <p className="knowledge-hub-page__reader-eyebrow">Step 1</p>
                    <h2 className="knowledge-hub-page__reader-title">Choose one article to open the reading view</h2>
                    <p className="knowledge-hub-page__reader-empty-copy">
                      Pick any report on the left and the selected article will expand across this card.
                    </p>
                    <div className="knowledge-hub-page__reader-footer">
                      <span />
                      <Button variant="secondary" onClick={onBackHome}>
                        {strings.common.backToHome}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {isReadingArticle && newsDetailLoading ? (
                  <p className="knowledge-hub-page__news-status">Loading article…</p>
                ) : null}

                {isReadingArticle && !newsDetailLoading && newsDetail ? (
                  <>
                    <div className="knowledge-hub-page__reader-top">
                      <p className="knowledge-hub-page__reader-eyebrow">Article detail</p>
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
                          Read source
                        </a>
                      </div>
                    </div>

                    <div className="knowledge-hub-page__reader-body">
                      <p>{newsDetail.article_content}</p>
                    </div>

                    {newsDetail.tips.length > 0 ? (
                      <div className="knowledge-hub-page__reader-grid">
                        <section className="knowledge-hub-page__reader-panel">
                          <p className="knowledge-hub-page__panel-title">Analysis and prevention tips</p>
                          <ul className="knowledge-hub-page__panel-list">
                            {newsDetail.tips.map((tip) => (
                              <li key={tip}>{tip}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    ) : null}

                    <div className="knowledge-hub-page__reader-footer">
                      <Button variant="ghost" onClick={() => setIsReadingArticle(false)}>
                        Choose another article
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
