import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
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

function getVerdictCopy(isScam: boolean) {
  if (isScam) {
    return {
      title: 'This was a scam notification.',
      lede: 'The backend marked this alert as a scam example. Treat surprise notifications carefully and verify them through a trusted channel.',
      summary: 'This result came from the backend reveal endpoint after you opened the practice notification.',
      cardTitle: 'Scam verdict',
      cardDescription: 'Review the original message and the backend classification below.',
      reasonsTitle: 'Why it matters',
      reasonsDescription: 'These are the main safety lessons to take away from this backend verdict.',
      actionLabel: 'Scam example',
      verdictLabel: 'Scam',
    }
  }

  return {
    title: 'This was a genuine notification.',
    lede: 'The backend marked this alert as a non-scam example. It is still worth checking calmly, but this one was stored as safe.',
    summary: 'This result came from the backend reveal endpoint after you opened the practice notification.',
    cardTitle: 'Genuine verdict',
    cardDescription: 'Review the original message and the backend classification below.',
    reasonsTitle: 'Why it mattered',
    reasonsDescription: 'These are the main lessons to keep from a safe notification example.',
    actionLabel: 'Safe example',
    verdictLabel: 'Genuine',
  }
}

export function NotificationRevealPage({ onBackHome }: NotificationRevealPageProps) {
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
        const reveal = await fetchNotificationReveal(storedScenario.id)
        if (isCancelled) return
        setResult({
          ...reveal,
          triggeredAt: storedScenario.triggeredAt,
        })
      } catch {
        if (isCancelled) return
        setError('Could not load the notification result right now. Please try again after opening another practice alert.')
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [storedScenario])

  if (!storedScenario) {
    return (
      <main className="notification-reveal-page" aria-label="Notification training result">
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Notification Training"
          title="No practice alert is available yet"
          description="Allow notifications on the landing page and wait for the first training alert to appear."
          footer={<Button onClick={onBackHome}>Back to Home</Button>}
        />
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="notification-reveal-page" aria-label="Notification training result">
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Notification Training"
          title="Loading notification result"
          description="Fetching the backend verdict for this practice notification."
          footer={<Button onClick={onBackHome}>Back to Home</Button>}
        />
      </main>
    )
  }

  if (!result || error) {
    return (
      <main className="notification-reveal-page" aria-label="Notification training result">
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Notification Training"
          title="Notification result unavailable"
          description={error ?? 'We could not reveal this notification result right now.'}
          footer={<Button onClick={onBackHome}>Back to Home</Button>}
        />
      </main>
    )
  }

  const copy = getVerdictCopy(result.isScam)
  const tone = result.isScam ? 'danger' : 'safe'

  return (
    <main className="notification-reveal-page" aria-label="Notification training result">
      <section className="notification-reveal-page__hero">
        <p className="notification-reveal-page__eyebrow">Notification Training Result</p>
        <h1 className="notification-reveal-page__title">{copy.title}</h1>
        <p className="notification-reveal-page__lede">{copy.lede}</p>
      </section>

      <section className="notification-reveal-page__grid">
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Observed notification"
          title={copy.cardTitle}
          description={copy.cardDescription}
          footer={<Button onClick={onBackHome}>Back to Home</Button>}
        >
          <div className="notification-reveal-page__summary">
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Verdict</span>
              <strong>{copy.verdictLabel}</strong>
            </div>

          </div>
          <div className="notification-reveal-page__body-preview">
            <div className="notification-reveal-page__body-topline">
              <span className="notification-reveal-page__body-badge">Message</span>
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
          className="notification-reveal-page__card"
          eyebrow="Why it mattered"
          title={copy.reasonsTitle}
          description={copy.reasonsDescription}
        >
          <ul className="notification-reveal-page__reasons" aria-label="Notification explanations">
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
