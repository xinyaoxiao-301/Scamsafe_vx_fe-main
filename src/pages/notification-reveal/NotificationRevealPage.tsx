import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { readStoredNotificationScenario } from '@/lib/notification-training/storage'
import type { NotificationReveal } from '@/lib/notification-training/types'
import { fetchNotificationReveal } from '@/services/notificationTraining'

type NotificationRevealPageProps = {
  onBackHome: () => void
}

type NotificationReason = {
  id: string
  tone: 'danger' | 'safe'
  title: string
  description: string
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

function buildReasons(isScam: boolean): NotificationReason[] {
  if (isScam) {
    return [
      {
        id: 'scam-verdict',
        tone: 'danger',
        title: 'The backend classified this as a scam',
        description: 'This notification was marked risky in the backend data source and should not be trusted at face value.',
      },
      {
        id: 'scam-verify',
        tone: 'danger',
        title: 'Verify outside the notification',
        description: 'If a message creates pressure or asks for quick action, confirm it through the official website or app instead.',
      },
      {
        id: 'scam-caution',
        tone: 'danger',
        title: 'Do not rely on the popup alone',
        description: 'Unexpected alerts can be spoofed. Treat links and prompts in notifications carefully before opening anything.',
      },
    ]
  }

  return [
    {
      id: 'safe-verdict',
      tone: 'safe',
      title: 'The backend classified this as genuine',
      description: 'This notification was stored as a non-scam example in the backend and was meant to look routine and trustworthy.',
    },
    {
      id: 'safe-tone',
      tone: 'safe',
      title: 'Safe notifications still deserve a quick check',
      description: 'Even when a message is genuine, it is still smart to pause and make sure it matches the product or service you expect.',
    },
    {
      id: 'safe-habit',
      tone: 'safe',
      title: 'Keep using the same verification habit',
      description: 'A calm double-check helps with both real notifications and fake ones, so the same habit keeps you safer over time.',
    },
  ]
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

function formatBackendLabel(label: string) {
  return label === 'scam' ? 'scam' : label === 'not_scam' ? 'not_scam' : label
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
  const reasons = buildReasons(result.isScam)

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
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Backend label</span>
              <strong>{formatBackendLabel(result.label)}</strong>
            </div>
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Notification ID</span>
              <strong>{result.id}</strong>
            </div>
          </div>
          <div className="notification-reveal-page__body-preview">
            <div className="notification-reveal-page__body-topline">
              <span className="notification-reveal-page__body-badge">Backend response</span>
              <span className="notification-reveal-page__body-caption">{copy.summary}</span>
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
            {reasons.map((reason) => (
              <li className="notification-reveal-page__reason" key={reason.id}>
                <ReasonBadge tone={reason.tone} />
                <div className="notification-reveal-page__reason-copy">
                  <strong>{reason.title}</strong>
                  <p>{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </main>
  )
}
