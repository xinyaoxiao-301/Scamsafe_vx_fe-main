import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type FeaturePageProps = {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
  supportNote: string
  onBackHome: () => void
}

export function FeaturePage({
  eyebrow,
  title,
  description,
  highlights,
  supportNote,
  onBackHome,
}: FeaturePageProps) {
  const { strings } = useI18n()

  return (
    <main className="feature-page" aria-label={title}>
      <section className="feature-page__hero">
        <p className="feature-page__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="feature-page__description">{description}</p>
      </section>

      <section className="feature-page__grid">
        <SectionCard
          className="feature-page__card"
          eyebrow={strings.featurePage.currentFocusEyebrow}
          title={strings.featurePage.currentFocusTitle}
          description={strings.featurePage.currentFocusDescription}
          footer={<Button onClick={onBackHome}>{strings.common.backToHome}</Button>}
        >
          <ul className="bullet-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          className="feature-page__card feature-page__card--support"
          eyebrow={strings.featurePage.nextStepEyebrow}
          title={strings.featurePage.nextStepTitle}
          description={supportNote}
        >
          <p className="feature-page__support-text">{strings.featurePage.supportText}</p>
        </SectionCard>
      </section>
    </main>
  )
}
