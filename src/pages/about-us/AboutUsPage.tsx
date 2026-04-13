import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type AboutUsPageProps = {
  onBackHome: () => void
}

export function AboutUsPage({ onBackHome }: AboutUsPageProps) {
  const { strings } = useI18n()

  return (
    <main className="feature-page" aria-label={strings.aboutUs.eyebrow}>
      <section className="feature-page__hero">
        <p className="feature-page__eyebrow">{strings.aboutUs.eyebrow}</p>
        <h1>{strings.aboutUs.title}</h1>
        <p className="feature-page__description">{strings.aboutUs.description}</p>
      </section>

      <section className="feature-page__grid">
        <SectionCard
          className="feature-page__card"
          eyebrow={strings.aboutUs.missionEyebrow}
          title={strings.aboutUs.missionTitle}
          description={strings.aboutUs.missionDescription}
          footer={<Button onClick={onBackHome}>{strings.common.backToHome}</Button>}
        >
          <ul className="bullet-list">
            {strings.aboutUs.missionPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          className="feature-page__card feature-page__card--support"
          eyebrow={strings.aboutUs.teamEyebrow}
          title={strings.aboutUs.teamTitle}
          description={strings.aboutUs.teamDescription}
        >
          <p className="feature-page__support-text">{strings.aboutUs.teamSupport}</p>
        </SectionCard>
      </section>
    </main>
  )
}
