import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n } from '@/lib/i18n'

type PostScamSupportPageProps = {
  onBackHome: () => void
}

export function PostScamSupportPage({ onBackHome }: PostScamSupportPageProps) {
  const { strings } = useI18n()
  const s = strings.postScamSupport
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [selectedIncident, setSelectedIncident] = useState<'transferred-money' | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [isCurrentStepConfirmed, setIsCurrentStepConfirmed] = useState(false)
  const [reviewingStepIndex, setReviewingStepIndex] = useState<number | null>(null)
  const trackerRef = useRef<HTMLDivElement | null>(null)

  const bankHotlines: Array<{ name: string; number: string }> = [
    { name: 'Maybank Fraud Hotline', number: '03-5891 4744' },
    { name: 'CIMB Consumer Contact Centre', number: '03-6204 7788' },
    { name: 'RHB Contact Centre', number: '03-9206 8118' },
    { name: 'UOB Fraud Reporting Hotline', number: '03-2612 8100' },
    { name: 'AmBank Contact Centre', number: '03-2178 8888' },
    { name: 'Bank Islam Contact Centre', number: '03-2690 0900' },
    { name: 'Hong Leong Lost Card / Scam Reporting', number: '03-7626 8899' },
    { name: 'HSBC Fraud Operations', number: '03-8800 7420' },
    { name: 'OCBC Personal Banking', number: '03-8317 5000' },
    { name: 'BSN Contact Centre / Fraud & Scam Report', number: '03-2613 1900' },
    {
      name: s.otherBankName,
      number: s.otherBankInstruction,
    },
  ]

  const steps: Array<(typeof s.steps)[number] & { extraItems?: typeof bankHotlines }> = s.steps.map((step) =>
    step.key === 'stop-money' ? { ...step, extraItems: bankHotlines } : step,
  )

  const defaultStepIndex = Math.min(completedCount, steps.length - 1)
  const activeStepIndex =
    selectedIncident === null ? -1 : reviewingStepIndex ?? defaultStepIndex
  const isAllDone = selectedIncident !== null && completedCount >= steps.length
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : null
  const isReviewingPastStep = reviewingStepIndex !== null && reviewingStepIndex < completedCount

  const startTransferredMoneyFlow = () => {
    setSelectedIncident('transferred-money')
    setCompletedCount(0)
    setIsCurrentStepConfirmed(false)
    setReviewingStepIndex(null)

    requestAnimationFrame(() => {
      trackerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const completeCurrentStep = () => {
    if (!isCurrentStepConfirmed) return
    setCompletedCount((count) => Math.min(count + 1, steps.length))
    setIsCurrentStepConfirmed(false)
    setReviewingStepIndex(null)

    requestAnimationFrame(() => {
      trackerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const openStepFromTracker = (index: number) => {
    if (index > completedCount) return
    setReviewingStepIndex(index === completedCount ? null : index)
    setIsCurrentStepConfirmed(false)
  }

  return (
    <main className="support-recovery-page" aria-label={strings.postScamSupport.title}>
      <section className="support-recovery-page__hero">
        <h1>{strings.postScamSupport.title}</h1>
      </section>

      <section className="support-recovery-page__grid">
        <SectionCard
          className="support-recovery-page__card support-recovery-page__card--start"
          eyebrow={s.startCardEyebrow}
          title={s.startCardTitle}
          description={s.startCardDescription}
        >
          <div className="support-recovery-page__start-panel">
            <Button
              onClick={startTransferredMoneyFlow}
              className={
                selectedIncident === 'transferred-money'
                  ? 'support-recovery-page__start-button support-recovery-page__start-button--active'
                  : 'support-recovery-page__start-button'
              }
            >
              {s.startButton}
            </Button>
            <div className="support-recovery-page__quick-steps" aria-label={s.quickGuideLabel}>
              {s.quickSteps.map((step) => (
                <div className="support-recovery-page__quick-step" key={step.title}>
                  <p className="support-recovery-page__quick-step-title">{step.title}</p>
                  <p className="support-recovery-page__quick-step-text">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {selectedIncident ? (
          <div ref={trackerRef} className="support-recovery-page__tracker-anchor">
            <SectionCard
              className="support-recovery-page__card support-recovery-page__card--tracker"
              eyebrow={s.trackerEyebrow}
              title={s.trackerTitle}
              description={
                isMobile
                  ? `${s.trackerDescription} ${s.trackerMobileHint}`
                  : s.trackerDescription
              }
            >
              <ol className="support-recovery-page__tracker" aria-label={s.recoveryStepsLabel}>
                {steps.map((step, index) => {
                  const isDone = index < completedCount
                  const isActive = !isAllDone && index === completedCount
                  const isLocked = index > completedCount

                  return (
                    <li key={step.key}>
                      <button
                        type="button"
                        className={
                          [
                            'support-recovery-page__tracker-step',
                            isDone ? 'support-recovery-page__tracker-step--done' : '',
                            isActive ? 'support-recovery-page__tracker-step--active' : '',
                            isLocked ? 'support-recovery-page__tracker-step--locked' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')
                        }
                        onClick={() => openStepFromTracker(index)}
                        disabled={isLocked}
                      >
                        <span className="support-recovery-page__tracker-index">{index + 1}</span>
                        <div className="support-recovery-page__tracker-copy">
                          <p className="support-recovery-page__tracker-label">{step.label}</p>
                          <p className="support-recovery-page__tracker-status">
                            {isDone ? s.statusDone : isActive ? s.statusActive : s.statusLocked}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </SectionCard>
          </div>
        ) : null}

        {activeStep ? (
          <SectionCard
            className="support-recovery-page__card support-recovery-page__card--active-step"
            title={activeStep.title}
            description={activeStep.description}
            footer={
              !isAllDone ? (
                <div className="support-recovery-page__active-footer">
                  {isReviewingPastStep ? (
                    <p className="support-recovery-page__active-footer-text">
                      {s.reviewNote}
                    </p>
                  ) : (
                    <>
                      <label className="support-recovery-page__confirm-check">
                        <input
                          type="checkbox"
                          checked={isCurrentStepConfirmed}
                          onChange={(event) => setIsCurrentStepConfirmed(event.target.checked)}
                        />
                        <span>{s.confirmLabel}</span>
                      </label>
                      <Button
                        onClick={completeCurrentStep}
                        disabled={!isCurrentStepConfirmed}
                        className="support-recovery-page__active-button"
                      >
                        {s.nextStepButton}
                      </Button>
                    </>
                  )}
                </div>
              ) : undefined
            }
          >
            {'actionLabel' in activeStep ? (
              <div className="support-recovery-page__call-actions">
                <div className="support-recovery-page__call-actions-top">
                  <div className="support-recovery-page__emergency-side-list" aria-hidden="true">
                    <div className="support-recovery-page__emergency-item">
                      <span className="support-recovery-page__emergency-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M6 8.2 12 5l6 3.2-6 2.7L6 8.2Z" />
                          <path d="M9 9.7h6" />
                          <path d="M12 11.2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                          <path d="M7.9 21v-.7a4.1 4.1 0 0 1 4.1-4.1h0a4.1 4.1 0 0 1 4.1 4.1v.7" />
                        </svg>
                      </span>
                      <span className="support-recovery-page__emergency-item-copy">
                        <strong>{s.emergencySide.policeTitle}</strong>
                        <small>{s.emergencySide.policeText}</small>
                      </span>
                    </div>
                    <div className="support-recovery-page__emergency-item">
                      <span className="support-recovery-page__emergency-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M4 10h16" />
                          <path d="M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                          <path d="M8 14h3" />
                        </svg>
                      </span>
                      <span className="support-recovery-page__emergency-item-copy">
                        <strong>{s.emergencySide.bankTitle}</strong>
                        <small>{s.emergencySide.bankText}</small>
                      </span>
                    </div>
                    <div className="support-recovery-page__emergency-item">
                      <span className="support-recovery-page__emergency-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 3 3.8 18h16.4L12 3Z" />
                          <path d="M12 9v4.6" />
                          <path d="M12 17.2h.01" />
                        </svg>
                      </span>
                      <span className="support-recovery-page__emergency-item-copy">
                        <strong>{s.emergencySide.lossTitle}</strong>
                        <small>{s.emergencySide.lossText}</small>
                      </span>
                    </div>
                  </div>

                  <div className="support-recovery-page__emergency-panel">
                    <div className="support-recovery-page__emergency-main">
                      <div className="support-recovery-page__emergency-panel-header">
                        <span className="support-recovery-page__emergency-panel-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M6.6 4.8h2.7l1.3 3.4-1.7 1.7a13.3 13.3 0 0 0 5.2 5.2l1.7-1.7 3.4 1.3v2.7a1.5 1.5 0 0 1-1.5 1.5h-.8A12.9 12.9 0 0 1 4.8 7.1v-.8a1.5 1.5 0 0 1 1.8-1.5Z" />
                          </svg>
                        </span>
                        <p className="support-recovery-page__emergency-panel-title">
                          {s.emergencyPanelTitle}
                        </p>
                      </div>

                      <div className="support-recovery-page__emergency-call-card">
                        <div className="support-recovery-page__emergency-call-copy">
                          <p className="support-recovery-page__emergency-call-label">{s.emergencyCallLabel}</p>
                          <p className="support-recovery-page__emergency-call-number">997</p>
                        </div>

                        <a
                          className="support-recovery-page__urgent-link support-recovery-page__urgent-link--danger"
                          href={activeStep.actionHref}
                        >
                          <span className="support-recovery-page__urgent-link-copy">
                            <span>{s.tapCall997}</span>
                          </span>
                        </a>
                      </div>

                      <div className="support-recovery-page__emergency-service-card">
                        <p className="support-recovery-page__emergency-service-label">
                          {s.first997Label}
                        </p>
                        <p className="support-recovery-page__emergency-service-text">
                          {s.first997Text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="support-recovery-page__callout">
                  <p className="support-recovery-page__callout-title">{activeStep.emergencyTitle}</p>
                  <ul className="support-recovery-page__bullet-list">
                    {activeStep.emergencyLines!.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="support-recovery-page__callout">
                  <div className="support-recovery-page__callout-header">
                    <div className="support-recovery-page__callout-title-row">
                      <p className="support-recovery-page__callout-title">{activeStep.extraTitle}</p>
                      <span className="support-recovery-page__tap-hint">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 4.2v8.2" />
                          <path d="M9 13.6V12a1.6 1.6 0 1 1 3.2 0v1.2" />
                          <path d="M12.2 13.2v-2a1.6 1.6 0 1 1 3.2 0v2" />
                          <path d="M15.4 13.5v-1a1.6 1.6 0 1 1 3.2 0v4a4.3 4.3 0 0 1-4.3 4.3h-2.4a4.1 4.1 0 0 1-3.5-1.9L6.6 16a1.4 1.4 0 0 1 2.4-1.5l1 1.4" />
                        </svg>
                        <span>{s.tapToCallNow}</span>
                      </span>
                    </div>
                    {'extraDescription' in activeStep ? (
                      <p className="support-recovery-page__callout-text">{activeStep.extraDescription}</p>
                    ) : null}
                  </div>
                  <div className="support-recovery-page__hotline-list">
                    {activeStep.extraItems!.map((item) => (
                      item.name === s.otherBankName ? (
                        <div
                          key={item.name}
                          className="support-recovery-page__hotline support-recovery-page__hotline--other"
                        >
                          <span>{item.name}</span>
                          <strong>{item.number}</strong>
                        </div>
                      ) : (
                        <a
                          key={item.name}
                          className="support-recovery-page__hotline"
                          href={`tel:${item.number.replace(/[^+\d]/g, '')}`}
                        >
                          <span>{item.name}</span>
                          <strong>{item.number}</strong>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {'checklist' in activeStep ? (
              <div className="support-recovery-page__callout">
                <p className="support-recovery-page__callout-title">{activeStep.checklistTitle}</p>
                <ul className="support-recovery-page__bullet-list">
                  {activeStep.checklist!.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {'evidenceItems' in activeStep ? (
              <div className="support-recovery-page__step-grid">
                <div className="support-recovery-page__callout">
                  <p className="support-recovery-page__callout-title">{activeStep.evidenceTitle}</p>
                  <ol className="support-recovery-page__number-list">
                    {activeStep.evidenceItems!.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div className="support-recovery-page__callout support-recovery-page__callout--soft">
                  <p className="support-recovery-page__callout-title">{activeStep.semakMuleTitle}</p>
                  <p>{activeStep.semakMuleDescription}</p>
                  <a
                    className="support-recovery-page__urgent-link support-recovery-page__urgent-link--secondary"
                    href={activeStep.semakMuleHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {activeStep.semakMuleLabel}
                  </a>
                </div>
              </div>
            ) : null}
          </SectionCard>
        ) : null}

        {isAllDone ? (
          <SectionCard
            className="support-recovery-page__card support-recovery-page__card--complete"
            eyebrow={s.completedEyebrow}
            title={s.completedTitle}
            description={s.completedDescription}
            footer={
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            }
          >
            <p className="support-recovery-page__final-note">
              {s.finalNote}
            </p>
          </SectionCard>
        ) : null}
      </section>
    </main>
  )
}
