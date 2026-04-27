import { Button } from '@/components/ui/Button'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { appRoutes, type AppRoute } from '@/app/routes'
import { useI18n } from '@/lib/i18n'

type HomePageProps = {
  onNavigate: (route: AppRoute) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { strings } = useI18n()

  const features = [
    {
      id: 'scam-detection',
      icon: 'detection',
      title: strings.homeFeatures.scam,
      subtitle: strings.homeFeatures.detection,
      route: appRoutes.detection,
      tooltip: strings.homeFeatures.tooltips.detection,
    },
    {
      id: 'scam-simulation',
      icon: 'simulation',
      title: strings.homeFeatures.scam,
      subtitle: strings.homeFeatures.simulation,
      route: appRoutes.simulation,
      tooltip: strings.homeFeatures.tooltips.simulation,
    },
    {
      id: 'anti-scam-study-center',
      icon: 'study',
      title: strings.homeFeatures.scam,
      subtitle: strings.homeFeatures.studyCenter,
      route: appRoutes.studyCenter,
      tooltip: strings.homeFeatures.tooltips.studyCenter,
    },
    {
      id: 'post-scam-support',
      icon: 'support',
      title: strings.homeFeatures.scam,
      subtitle: strings.homeFeatures.support,
      route: appRoutes.support,
      tooltip: strings.homeFeatures.tooltips.support,
    },
    {
      id: 'knowledge-hub',
      icon: 'study',
      title: strings.homeFeatures.scam,
      subtitle: strings.homeFeatures.knowledgeHub,
      route: appRoutes.knowledgeHub,
      tooltip: strings.homeFeatures.tooltips.knowledgeHub,
    },
  ] as const

  return (
    <main className="home-page" id="top" aria-label="Homepage">
      <section className="feature-launchpad-shell" aria-label="Main feature launch buttons">
        <header className="feature-launchpad__lead" aria-label="Choose a service">
          <p className="feature-launchpad__lead-eyebrow">{strings.homeCard.eyebrow}</p>
          <p className="feature-launchpad__lead-title">{strings.homeCard.title}</p>
          <p className="feature-launchpad__lead-helper">
            <span className="feature-launchpad__lead-helper-before">{strings.homeCard.helperBefore}</span>{' '}
            <span className="feature-launchpad__lead-helper-action">{strings.homeCard.helperAction}</span>
            {strings.homeCard.helperAfter ? (
              <span className="feature-launchpad__lead-helper-after"> {strings.homeCard.helperAfter}</span>
            ) : null}
          </p>
        </header>
        <div className="feature-launchpad" role="list">
          {features.map((feature) => {
            const tooltipId = `feature-tip-${feature.id}`

            return (
              <article
                className={`feature-launchpad__item feature-launchpad__item--${feature.id}`}
                key={feature.id}
                role="listitem"
              >
                <div className="feature-launchpad__icon">
                  <FeatureIcon name={feature.icon} />
                </div>
                <div className="feature-launchpad__heading">
                  <p className="feature-launchpad__title">{feature.title}</p>
                  <p
                    className={
                      feature.id === 'anti-scam-study-center'
                        ? 'feature-launchpad__subtitle feature-launchpad__subtitle--wide'
                        : 'feature-launchpad__subtitle'
                    }
                  >
                    {feature.subtitle}
                  </p>
                </div>
                <Button
                  fullWidth
                  onClick={() => onNavigate(feature.route)}
                  className="feature-launchpad__button"
                  aria-describedby={tooltipId}
                >
                  {strings.homeFeatures.open}
                </Button>
                <span id={tooltipId} className="feature-launchpad__tooltip" role="tooltip">
                  {feature.tooltip}
                </span>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
