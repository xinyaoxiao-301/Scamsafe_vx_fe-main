import { appRoutes, type AppRoute } from '@/app/routes'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type FooterInfoKind = 'sources' | 'about' | 'risk'

type FooterInfoPageProps = {
  kind: FooterInfoKind
  onBackHome: () => void
  onNavigate: (route: AppRoute) => void
}

const imageCreditUrl =
  'https://www.freepik.com/free-photo/elderly-senior-asian-male-freelancer-casual-clothes-typing-laptop-keyboard-while-talking-smartphone-standing-desk-busy-working-home-office_25117731.htm#fromView=search&page=1&position=2&uuid=ff5cca6a-b8fa-489a-ba36-8c4ab535e59c&query=Elderly+fraud+asian+technical'

export function FooterInfoPage({ kind, onBackHome, onNavigate }: FooterInfoPageProps) {
  const { strings } = useI18n()
  const infoPages = [
    {
      key: 'sources' as const,
      route: appRoutes.dataSources,
      title: strings.footer.sourcesTitle,
      lead: strings.footer.sourcesLead,
    },
    {
      key: 'about' as const,
      route: appRoutes.aboutUs,
      title: strings.footer.aboutTitle,
      lead: strings.footer.aboutLead,
    },
    {
      key: 'risk' as const,
      route: appRoutes.riskGuide,
      title: strings.footer.riskTitle,
      lead: strings.footer.riskLead,
    },
  ]

  const currentPage = infoPages.find((page) => page.key === kind) ?? infoPages[0]
  const relatedPages = infoPages.filter((page) => page.key !== kind)

  const mainContent = (() => {
    switch (kind) {
      case 'sources':
        return (
          <>
            <ul className="footer-info-page__list" aria-label={strings.footer.sourcesTitle}>
              {strings.footer.sourcesItems.map((item) => (
                <li key={item} className="footer-info-page__list-item">
                  {item}
                </li>
              ))}
            </ul>
            <p className="footer-info-page__credit">
              <span className="footer-info-page__credit-label">{strings.footer.imageCreditLabel}</span>{' '}
              <a className="footer-info-page__credit-link" href={imageCreditUrl} target="_blank" rel="noreferrer">
                {strings.footer.imageCreditText}
              </a>
            </p>
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
            <div className="footer-info-page__tag-list" role="list" aria-label={strings.footer.aboutTitle}>
              {strings.footer.aboutTags.map((tag) => (
                <span key={tag} className="footer-info-page__tag" role="listitem">
                  {tag}
                </span>
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
    <main className="footer-info-page" aria-label={currentPage.title}>
      <section className="footer-info-page__hero">
        <h1>{currentPage.title}</h1>
      </section>

      <section className="footer-info-page__grid">
        <SectionCard
          className="footer-info-page__card footer-info-page__card--primary"
          eyebrow={strings.footer.title}
          title={currentPage.title}
          description={currentPage.lead}
        >
          {mainContent}
        </SectionCard>

        <SectionCard
          className="footer-info-page__card footer-info-page__card--related"
          eyebrow={strings.ui.footerLabel}
          title={strings.footer.title}
          footer={
            <div className="footer-info-page__actions">
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          <div className="footer-info-page__link-list" aria-label={strings.footer.title}>
            {relatedPages.map((page) => (
              <button
                key={page.route}
                type="button"
                className="footer-info-page__link-card"
                onClick={() => onNavigate(page.route)}
              >
                <span className="footer-info-page__link-title">{page.title}</span>
                <span className="footer-info-page__link-text">{page.lead}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </section>
    </main>
  )
}
