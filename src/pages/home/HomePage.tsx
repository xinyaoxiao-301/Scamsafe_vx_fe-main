import { Button } from '@/components/ui/Button'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { appRoutes, type AppRoute } from '@/app/routes'
import { useI18n } from '@/lib/i18n'

type HomePageProps = {
  onNavigate: (route: AppRoute) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { strings } = useI18n()

  // The home screen mainly composes shared primitives so feature-specific logic
  // can stay inside each dedicated page module.
  const features = [
    {
      id: 'scam-detection',
      icon: 'detection',
      subtitle: strings.homeFeatures.detection,
      route: appRoutes.detection,
      tooltip: strings.homeFeatures.tooltips.detection,
    },
    {
      id: 'scam-simulation',
      icon: 'simulation',
      subtitle: strings.homeFeatures.simulation,
      route: appRoutes.simulation,
      tooltip: strings.homeFeatures.tooltips.simulation,
    },
    {
      id: 'anti-scam-study-center',
      icon: 'study',
      subtitle: strings.homeFeatures.studyCenter,
      route: appRoutes.studyCenter,
      tooltip: strings.homeFeatures.tooltips.studyCenter,
    },
    {
      id: 'post-scam-support',
      icon: 'support',
      subtitle: strings.homeFeatures.support,
      route: appRoutes.support,
      tooltip: strings.homeFeatures.tooltips.support,
    },
    {
      id: 'knowledge-hub',
      icon: 'study',
      subtitle: strings.homeFeatures.knowledgeHub,
      route: appRoutes.knowledgeHub,
      tooltip: strings.homeFeatures.tooltips.knowledgeHub,
    },
  ] as const

  return (
    <main className="home-page" id="top" aria-label={strings.homeCard.pageLabel}>
      <section className="feature-launchpad-shell" aria-label={strings.homeCard.launchpadLabel}>
        <header className="feature-launchpad__lead" aria-label={strings.homeCard.title}>
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
