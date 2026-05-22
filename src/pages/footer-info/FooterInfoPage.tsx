// FooterInfoPage renders the three footer detail destinations: data sources,
// product background, and the risk-level reference. The content is assembled
// from i18n strings plus a small amount of route-specific structured metadata.
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type FooterInfoKind = 'sources' | 'about' | 'risk'

type FooterInfoPageProps = {
  kind: FooterInfoKind
  onBackHome: () => void
}

const imageCreditUrl =
  'https://www.freepik.com/free-photo/elderly-senior-asian-male-freelancer-casual-clothes-typing-laptop-keyboard-while-talking-smartphone-standing-desk-busy-working-home-office_25117731.htm#fromView=search&page=1&position=2&uuid=ff5cca6a-b8fa-489a-ba36-8c4ab535e59c&query=Elderly+fraud+asian+technical'

export function FooterInfoPage({ kind, onBackHome }: FooterInfoPageProps) {
  const { strings } = useI18n()
  const infoPages = [
    {
      key: 'sources' as const,
      title: strings.footer.sourcesTitle,
    },
    {
      key: 'about' as const,
      title: strings.footer.aboutTitle,
    },
    {
      key: 'risk' as const,
      title: strings.footer.riskTitle,
    },
  ]

  const pageTitle = (infoPages.find((page) => page.key === kind) ?? infoPages[0]).title
  // Each source section groups related links by purpose so the page reads more
  // naturally for non-technical users than a single long list would.
  const sourceSections = [
    {
      title: strings.footer.sourcesSections[0]?.title ?? '',
      text: strings.footer.sourcesSections[0]?.text ?? '',
      items: strings.footer.sourceGroupItems[0] ?? [],
    },
    {
      title: strings.footer.sourcesSections[1]?.title ?? '',
      text: strings.footer.sourcesSections[1]?.text ?? '',
      items: strings.footer.sourceGroupItems[1] ?? [],
    },
    {
      title: strings.footer.sourcesSections[2]?.title ?? '',
      text: strings.footer.sourcesSections[2]?.text ?? '',
      items: strings.footer.sourceGroupItems[2] ?? [],
    },
  ]
  // Credits are intentionally kept verbatim because they represent external
  // ownership statements and should not drift from the approved wording.
  const sourceCredits = [
    '© 2026 GROQ, Inc., All rights reserved.',
    '© 2024 - 2026 mealss (Kaggle author). All rights reserved to original contributors.',
    '© 2026 [FIT5120 Team08]. All rights reserved regarding compilation and creative expression.',
    '© 2020–2026 News API. All rights reserved to original contributors.',
    '© 2024–2026 uciml (Kaggle author). All rights reserved to original contributors.',
    '© Government of Malaysia, NFCC.',
    '© 2023–2026 Kucev Roman (Kaggle author). All rights reserved to original contributors.',
    '© 2026 New Straits Times Press (M) Bhd. All rights reserved.',
    '© 2026 Malay Mail. All rights reserved.',
    '© Star Media Group Berhad. All rights reserved.',
  ]
  // The About page reuses site-approved copy so the footer detail page stays in
  // sync with the rest of the product messaging across all languages.
  const aboutSections = [
    { title: strings.footer.aboutSections[0]?.title ?? '', text: strings.footer.aboutLead },
    { title: strings.footer.aboutSections[1]?.title ?? '', text: strings.footer.sourcesLead },
    { title: strings.footer.aboutSections[2]?.title ?? '', text: strings.footer.aboutPoints[0] ?? '' },
  ]
  const aboutSectionIcons = [
    (
      <svg viewBox="0 0 24 24">
        <rect x="4.5" y="5" width="15" height="14" rx="3" />
        <path d="M8 9.2h8" />
        <path d="M8 12h5.5" />
        <path d="M8 14.8h7" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24">
        <path d="M12 5.2 18.2 8v8L12 18.8 5.8 16V8L12 5.2Z" />
        <path d="M12 8.4v7.1" />
        <path d="M8.8 10.2 12 12l3.2-1.8" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24">
        <path d="M12 4.5 18 7v4.5c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V7l6-2.5Z" />
        <path d="m12 8.3.9 1.8 2 .3-1.45 1.42.35 2-1.8-.95-1.8.95.35-2-1.45-1.42 2-.3.9-1.8Z" />
      </svg>
    ),
  ]

  const mainContent = (() => {
    switch (kind) {
      case 'sources':
        return (
          <>
            <div className="footer-info-page__sources-hero-card">
              <div className="footer-info-page__sources-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 6.8h12" />
                  <path d="M6 12h12" />
                  <path d="M6 17.2h8" />
                </svg>
              </div>
              <div className="footer-info-page__sources-hero-copy">
                <p className="footer-info-page__sources-kicker">{strings.footer.sourcesKicker}</p>
                <p className="footer-info-page__sources-summary">{strings.footer.sourcesLead}</p>
                <div className="footer-info-page__sources-tag-row" role="list" aria-label={strings.footer.sourcesTitle}>
                  {strings.footer.sourcesTags.map((tag) => (
                    <span key={tag} className="footer-info-page__sources-tag" role="listitem">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer-info-page__sources-groups" aria-label={strings.footer.sourcesTitle}>
              {sourceSections.map((section, index) => (
                <section
                  key={section.title}
                  className={[
                    'footer-info-page__sources-group',
                    index === 1 ? 'footer-info-page__sources-group--reference' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="footer-info-page__sources-group-head">
                    <h3>{section.title}</h3>
                    <p>{section.text}</p>
                  </div>
                  <div className="footer-info-page__sources-links">
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        className="footer-info-page__source-link-card"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div className="footer-info-page__source-link-top">
                          <span className="footer-info-page__source-link-badge">{item.badge}</span>
                          <span className="footer-info-page__source-link-host">{item.host}</span>
                        </div>
                        <span className="footer-info-page__source-link-title">{item.title}</span>
                        <span className="footer-info-page__source-link-text">{item.text}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="footer-info-page__sources-credits" aria-label={strings.footer.sourcesCreditsTitle}>
              <div className="footer-info-page__sources-group-head">
                <h3>{strings.footer.sourcesCreditsTitle}</h3>
                <p>{strings.footer.sourcesCreditsNote}</p>
              </div>
              <ul className="footer-info-page__sources-credit-list">
                {sourceCredits.map((credit) => (
                  <li key={credit} className="footer-info-page__sources-credit-item">
                    {credit}
                  </li>
                ))}
              </ul>
              <p className="footer-info-page__credit">
                <span className="footer-info-page__credit-label">{strings.footer.imageCreditLabel}</span>{' '}
                <a className="footer-info-page__credit-link" href={imageCreditUrl} target="_blank" rel="noreferrer">
                  {strings.footer.imageCreditText}
                </a>
              </p>
            </section>
          </>
        )
      case 'risk':
        return (
          <div className="footer-info-page__risk-list" aria-label={strings.footer.riskTitle}>
            {strings.footer.riskItems.map((item) => (
              <div key={item.label} className="footer-info-page__risk-item">
                <span className="footer-info-page__risk-badge">{item.label}</span>
                <p className="footer-info-page__risk-text">{item.text}</p>
              </div>
            ))}
          </div>
        )
      case 'about':
      default:
        return (
          <>
            <div className="footer-info-page__about-hero-card">
              <div className="footer-info-page__about-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3.8 19 7.2v5.4c0 4.3-2.7 7.2-7 8.8-4.3-1.6-7-4.5-7-8.8V7.2L12 3.8Z" />
                  <path d="M8.1 11.8 10.4 14l5.5-5.6" />
                </svg>
              </div>
              <div className="footer-info-page__about-hero-copy">
                <p className="footer-info-page__about-kicker">ScamSafe</p>
                <div className="footer-info-page__tag-list" role="list" aria-label={strings.footer.aboutTitle}>
                  {strings.footer.aboutTags.map((tag) => (
                    <span key={tag} className="footer-info-page__tag" role="listitem">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="footer-info-page__about-sections" aria-label={strings.footer.aboutTitle}>
              {aboutSections.map((section, index) => (
                <article key={section.title} className="footer-info-page__about-section">
                  <span className="footer-info-page__about-section-icon" aria-hidden="true">
                    {aboutSectionIcons[index] ?? aboutSectionIcons[0]}
                  </span>
                  <div className="footer-info-page__about-section-copy">
                    <h3>{section.title}</h3>
                    <p>{section.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <ul className="footer-info-page__list" aria-label={strings.footer.aboutTitle}>
              {strings.footer.aboutPoints.map((item) => (
                <li key={item} className="footer-info-page__list-item">
                  {item}
                </li>
              ))}
            </ul>
          </>
        )
    }
  })()

  return (
    <main className="footer-info-page" aria-label={pageTitle}>
      <section className="footer-info-page__hero">
        <h1>{pageTitle}</h1>
      </section>

      <section className="footer-info-page__grid">
        <SectionCard
          className={
            [
              'footer-info-page__card',
              'footer-info-page__card--primary',
              'footer-info-page__card--compact-header',
              kind === 'about' ? 'footer-info-page__card--about-detail' : '',
              kind === 'sources' ? 'footer-info-page__card--sources-detail' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
          title={pageTitle}
          footer={
            <div className="footer-info-page__actions">
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          {mainContent}
        </SectionCard>
      </section>
    </main>
  )
}
