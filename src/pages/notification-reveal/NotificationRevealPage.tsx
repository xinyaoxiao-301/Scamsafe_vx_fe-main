// NotificationRevealPage explains a simulated push notification after the user
// opens it, turning the popup training hook into a guided learning screen.
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import { readStoredNotificationScenario } from '@/lib/notification-training/storage'
import type { NotificationReveal } from '@/lib/notification-training/types'
import { fetchNotificationReveal } from '@/services/notificationTraining'

type NotificationRevealPageProps = {
  onBackHome: () => void
}

function ReasonBadge({ tone }: { tone: 'danger' | 'safe' }) {
  return (
    <span
      className={
        tone === 'danger'
          ? 'notification-reveal-page__reason-icon notification-reveal-page__reason-icon--danger'
          : 'notification-reveal-page__reason-icon notification-reveal-page__reason-icon--safe'
      }
      aria-hidden="true"
    >
      {tone === 'danger' ? '!' : '✓'}
    </span>
  )
}

export function NotificationRevealPage({ onBackHome }: NotificationRevealPageProps) {
  const { language, strings } = useI18n()
  const s = strings.notificationReveal
  const [storedScenario] = useState(() => readStoredNotificationScenario())
  const [result, setResult] = useState<NotificationReveal | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(storedScenario))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storedScenario) {
      setIsLoading(false)
      return
    }

    let isCancelled = false

    void (async () => {
      try {
        const reveal = await fetchNotificationReveal(storedScenario.id, language)
        if (isCancelled) return
        setResult({
          ...reveal,
          triggeredAt: storedScenario.triggeredAt,
        })
      } catch {
        if (isCancelled) return
        setError(s.loadError)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [storedScenario, language, s.loadError])

  if (!storedScenario) {
    return (
      <main className="notification-reveal-page" aria-label={s.pageLabel}>
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow={s.eyebrow}
          title={s.noAlertTitle}
          description={s.noAlertDescription}
          footer={<Button onClick={onBackHome}>{strings.common.backToHome}</Button>}
        />
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="notification-reveal-page" aria-label={s.trainingResultLabel}>
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow={s.eyebrow}
          title={s.loadingTitle}
        />
      </main>
    )
  }

  if (!result || error) {
    return (
      <main className="notification-reveal-page" aria-label={s.trainingResultLabel}>
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow={s.eyebrow}
          title={s.unavailableTitle}
          description={error ?? s.unavailableDescription}
          footer={<Button onClick={onBackHome}>{strings.common.backToHome}</Button>}
        />
      </main>
    )
  }

  const copy = result.isScam ? s.scam : s.safe
  const tone = result.isScam ? 'danger' : 'safe'

  return (
    <main className="notification-reveal-page" aria-label={s.trainingResultLabel}>
      <section className="notification-reveal-page__hero">
        <p className="notification-reveal-page__eyebrow">{s.heroEyebrow}</p>
        <h1 className="notification-reveal-page__title">{copy.title}</h1>
        {copy.summary ? <p className="notification-reveal-page__lede">{copy.summary}</p> : null}
      </section>

      <section className="notification-reveal-page__grid">
        <SectionCard
          className="notification-reveal-page__card notification-reveal-page__card--observed"
          eyebrow={s.observedEyebrow}
          title={copy.cardDescription}
          footer={<Button onClick={onBackHome}>{strings.common.backToHome}</Button>}
        >
          <div className="notification-reveal-page__summary">
            <div className="notification-reveal-page__summary-row">
              <strong
                className={
                  result.isScam
                    ? 'notification-reveal-page__verdict-pill notification-reveal-page__verdict-pill--danger'
                    : 'notification-reveal-page__verdict-pill notification-reveal-page__verdict-pill--safe'
                }
              >
                {copy.verdictLabel}
              </strong>
            </div>
          </div>
          <div className="notification-reveal-page__body-preview">
            <div className="notification-reveal-page__body-topline">
              <span className="notification-reveal-page__body-badge">{s.messageBadge}</span>
            </div>
            <p className="notification-reveal-page__body-text">{result.message}</p>
            <span
              className={
                result.isScam
                  ? 'notification-reveal-page__body-action notification-reveal-page__body-action--danger'
                  : 'notification-reveal-page__body-action notification-reveal-page__body-action--safe'
              }
            >
              {copy.actionLabel}
            </span>
          </div>
        </SectionCard>

        <SectionCard
          className="notification-reveal-page__card notification-reveal-page__card--reasons"
          eyebrow={s.reasonsEyebrow}
          title={copy.reasonsTitle}
          description={copy.reasonsDescription}
        >
          <ul className="notification-reveal-page__reasons" aria-label={s.explanationsLabel}>
            {result.explanations.map((text, index) => (
              <li className="notification-reveal-page__reason" key={index}>
                <ReasonBadge tone={tone} />
                <div className="notification-reveal-page__reason-copy">
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </main>
  )
}
