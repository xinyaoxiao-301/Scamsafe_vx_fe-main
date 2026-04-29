import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import { CategoryIcon } from '@/pages/knowledge-hub/components/CategoryIcon'
import { ExampleMockup } from '@/pages/knowledge-hub/components/ExampleMockup'
import { knowledgeHubCategories } from '@/pages/knowledge-hub/data'
import type { KnowledgeHubCategory } from '@/pages/knowledge-hub/types'
import { fetchNewsList, fetchNewsDetail } from '@/services/scamNews'
import type { NewsListItem, NewsDetail } from '@/services/scamNews'

type KnowledgeHubPageProps = {
  onBackHome: () => void
}

export function KnowledgeHubPage({ onBackHome }: KnowledgeHubPageProps) {
  const { strings } = useI18n()
  const [selectedCategoryId, setSelectedCategoryId] = useState(knowledgeHubCategories[0].id)
  const [selectedArticleId, setSelectedArticleId] = useState(knowledgeHubCategories[0].articles[0].id)
  const [openExampleId, setOpenExampleId] = useState<string | null>(null)

  // Live news feed state
  const [newsItems, setNewsItems] = useState<NewsListItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null)
  const [newsDetailLoading, setNewsDetailLoading] = useState(false)

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

  const selectedCategory =
    knowledgeHubCategories.find((category) => category.id === selectedCategoryId) ??
    knowledgeHubCategories[0]

  const selectedArticle =
    selectedCategory.articles.find((article) => article.id === selectedArticleId) ??
    selectedCategory.articles[0]

  const openExample =
    selectedCategory.examples.find((example) => example.id === openExampleId) ?? null

  // Reset the dependent article/example state whenever the user changes the
  // active scam category so the right panel always stays in sync.
  const handleCategorySelect = (category: KnowledgeHubCategory) => {
    setSelectedCategoryId(category.id)
    setSelectedArticleId(category.articles[0].id)
    setOpenExampleId(null)
  }

  return (
    <main className="knowledge-hub-page" aria-label={strings.knowledgeHub.title}>
      <section className="knowledge-hub-page__hero">
        <p className="knowledge-hub-page__eyebrow">{strings.knowledgeHub.eyebrow}</p>
        <h1>{strings.knowledgeHub.title}</h1>
        <p className="knowledge-hub-page__description">
          A calm, readable scam library with category buttons, short explainers, and tap-to-zoom examples for older eyes.
        </p>
        <div className="knowledge-hub-page__hero-note">
          <span>Latest references in this hub were published between 10 Feb 2026 and 27 Apr 2026.</span>
        </div>
      </section>

      <section className="knowledge-hub-page__grid">
        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--categories"
          eyebrow="Step 1"
          title="Choose a scam category"
          description="Large buttons with clear icons help you open one scam pattern at a time."
          footer={
            <div className="knowledge-hub-page__overview-footer">
              <p className="knowledge-hub-page__overview-note">
                Read one topic slowly, then compare it with the screenshots below.
              </p>
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          <div className="knowledge-hub-page__category-grid" role="list" aria-label="Scam categories">
            {knowledgeHubCategories.map((category) => {
              const isActive = category.id === selectedCategory.id

              return (
                <button
                  key={category.id}
                  type="button"
                  role="listitem"
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? 'knowledge-hub-page__category-button knowledge-hub-page__category-button--active'
                      : 'knowledge-hub-page__category-button'
                  }
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="knowledge-hub-page__category-icon">
                    <CategoryIcon icon={category.icon} />
                  </span>
                  <span className="knowledge-hub-page__category-copy">
                    <strong>{category.label}</strong>
                    <small>{category.helper}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--library"
          eyebrow="Step 2"
          title={selectedCategory.label}
          description={selectedCategory.helper}
        >
          <div className="knowledge-hub-page__workspace">
            <div className="knowledge-hub-page__article-list" role="list" aria-label={`${selectedCategory.label} articles`}>
              {selectedCategory.articles.map((article) => {
                const isActive = article.id === selectedArticle.id

                return (
                  <button
                    key={article.id}
                    type="button"
                    role="listitem"
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? 'knowledge-hub-page__article-card knowledge-hub-page__article-card--active'
                        : 'knowledge-hub-page__article-card'
                    }
                    onClick={() => setSelectedArticleId(article.id)}
                  >
                    <span className="knowledge-hub-page__article-date">{article.publishedOn}</span>
                    <strong className="knowledge-hub-page__article-title">{article.title}</strong>
                    <span className="knowledge-hub-page__article-summary">{article.summary}</span>
                    <span className="knowledge-hub-page__article-source">{article.source}</span>
                  </button>
                )
              })}
            </div>

            <article className="knowledge-hub-page__reader" aria-label="Selected article">
              <div className="knowledge-hub-page__reader-top">
                <p className="knowledge-hub-page__reader-eyebrow">Latest article</p>
                <h2 className="knowledge-hub-page__reader-title">{selectedArticle.title}</h2>
                <div className="knowledge-hub-page__reader-meta">
                  <span>{selectedArticle.publishedOn}</span>
                  <a
                    className="knowledge-hub-page__source-link"
                    href={selectedArticle.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read source
                  </a>
                </div>
              </div>

              <div className="knowledge-hub-page__reader-body">
                <p>{selectedArticle.summary}</p>
                <p>{selectedArticle.detail}</p>
              </div>

              <div className="knowledge-hub-page__reader-grid">
                <section className="knowledge-hub-page__reader-panel">
                  <p className="knowledge-hub-page__panel-title">Warning signs</p>
                  <ul className="knowledge-hub-page__panel-list">
                    {selectedArticle.warningSigns.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="knowledge-hub-page__reader-panel">
                  <p className="knowledge-hub-page__panel-title">Simple prevention tips</p>
                  <ul className="knowledge-hub-page__panel-list">
                    {selectedArticle.tips.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="knowledge-hub-page__examples" aria-label="Examples">
                <div className="knowledge-hub-page__examples-head">
                  <div>
                    <p className="knowledge-hub-page__examples-eyebrow">Examples</p>
                    <h3 className="knowledge-hub-page__examples-title">Real-world screenshot gallery</h3>
                  </div>
                  <p className="knowledge-hub-page__examples-note">
                    Tap any image to expand it for easier reading.
                  </p>
                </div>

                <div className="knowledge-hub-page__examples-grid" role="list">
                  {selectedCategory.examples.map((example) => (
                    <button
                      key={example.id}
                      type="button"
                      role="listitem"
                      className="knowledge-hub-page__example-button"
                      onClick={() => setOpenExampleId(example.id)}
                    >
                      <ExampleMockup example={example} />
                    </button>
                  ))}
                </div>
              </section>
            </article>
          </div>
        </SectionCard>
      </section>

      <section className="knowledge-hub-page__news-section" aria-label="Latest scam news">
        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--news"
          eyebrow="Live feed"
          title="Latest scam news"
          description="Recent scam alerts fetched directly from our database — updated as new reports come in."
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
            <div className="knowledge-hub-page__workspace">
              <div
                className="knowledge-hub-page__article-list"
                role="list"
                aria-label="News articles"
              >
                {newsItems.map((item) => {
                  const isActive = item.article_id === selectedNewsId
                  const dateLabel = item.published
                    ? new Date(item.published).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''
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
                      onClick={() => setSelectedNewsId(item.article_id)}
                    >
                      <span className="knowledge-hub-page__article-date">{dateLabel}</span>
                      <strong className="knowledge-hub-page__article-title">{item.title}</strong>
                      <span className="knowledge-hub-page__article-source">{item.source}</span>
                    </button>
                  )
                })}
              </div>

              <article className="knowledge-hub-page__reader" aria-label="Selected news article">
                {newsDetailLoading && (
                  <p className="knowledge-hub-page__news-status">Loading article…</p>
                )}
                {!newsDetailLoading && newsDetail && (
                  <>
                    <div className="knowledge-hub-page__reader-top">
                      <p className="knowledge-hub-page__reader-eyebrow">Live article</p>
                      <h2 className="knowledge-hub-page__reader-title">{newsDetail.title}</h2>
                      <div className="knowledge-hub-page__reader-meta">
                        <span>
                          {newsDetail.published
                            ? new Date(newsDetail.published).toLocaleDateString('en-MY', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : ''}
                        </span>
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

                    {newsDetail.tips.length > 0 && (
                      <div className="knowledge-hub-page__reader-grid">
                        <section className="knowledge-hub-page__reader-panel">
                          <p className="knowledge-hub-page__panel-title">Simple prevention tips</p>
                          <ul className="knowledge-hub-page__panel-list">
                            {newsDetail.tips.map((tip) => (
                              <li key={tip}>{tip}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    )}
                  </>
                )}
              </article>
            </div>
          )}
        </SectionCard>
      </section>

      {openExample ? (
        <div className="knowledge-hub-page__modal" role="dialog" aria-modal="true" aria-label={openExample.title}>
          <button
            type="button"
            className="knowledge-hub-page__modal-backdrop"
            aria-label="Close example"
            onClick={() => setOpenExampleId(null)}
          />
          <div className="knowledge-hub-page__modal-card">
            <div className="knowledge-hub-page__modal-head">
              <div>
                <p className="knowledge-hub-page__modal-eyebrow">Expanded example</p>
                <h3 className="knowledge-hub-page__modal-title">{openExample.title}</h3>
              </div>
              <button
                type="button"
                className="knowledge-hub-page__modal-close"
                onClick={() => setOpenExampleId(null)}
              >
                Close
              </button>
            </div>
            <ExampleMockup example={openExample} expanded />
          </div>
        </div>
      ) : null}
    </main>
  )
}
