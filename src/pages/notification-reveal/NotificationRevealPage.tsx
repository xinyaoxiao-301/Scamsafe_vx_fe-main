import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { readStoredNotificationScenario } from '@/lib/notification-training/storage'

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
  const scenario = readStoredNotificationScenario()

  if (!scenario) {
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

  return (
    <main className="notification-reveal-page" aria-label="Notification training result">
      <section className="notification-reveal-page__hero">
        <p className="notification-reveal-page__eyebrow">Notification Training Result</p>
        <h1 className="notification-reveal-page__title">{scenario.revealTitle}</h1>
        <p className="notification-reveal-page__lede">{scenario.revealMessage}</p>
      </section>

      <section className="notification-reveal-page__grid">
        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Observed notification"
          title={scenario.title}
          description={scenario.revealSummary}
          footer={<Button onClick={onBackHome}>Back to Home</Button>}
        >
          <div className="notification-reveal-page__summary">
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Sender</span>
              <strong>{scenario.sender}</strong>
            </div>
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Link</span>
              <strong>{scenario.url}</strong>
            </div>
            <div className="notification-reveal-page__summary-row">
              <span className="notification-reveal-page__summary-label">Tone</span>
              <strong>{scenario.kind === 'scam' ? 'Urgent / incentive-driven' : 'Neutral / informative'}</strong>
            </div>
          </div>
          <div className="notification-reveal-page__body-preview">
            <div className="notification-reveal-page__body-topline">
              <span className="notification-reveal-page__body-badge">Preview only</span>
              <span className="notification-reveal-page__body-caption">Shown action in the original alert</span>
            </div>
            <p className="notification-reveal-page__body-text">{scenario.body}</p>
            <span
              className={
                scenario.kind === 'scam'
                  ? 'notification-reveal-page__body-action notification-reveal-page__body-action--danger'
                  : 'notification-reveal-page__body-action notification-reveal-page__body-action--safe'
              }
            >
              {scenario.actionLabel}
            </span>
          </div>
        </SectionCard>

        <SectionCard
          className="notification-reveal-page__card"
          eyebrow="Why it mattered"
          title={scenario.kind === 'scam' ? 'Threat signals' : 'Safe signals'}
          description="Use these clues to explain why this alert was risky or trustworthy."
        >
          <ul className="notification-reveal-page__reasons" aria-label="Notification explanations">
            {scenario.reasons.map((reason) => (
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
