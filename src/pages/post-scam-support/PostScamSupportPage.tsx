import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type PostScamSupportPageProps = {
  onBackHome: () => void
}

export function PostScamSupportPage({ onBackHome }: PostScamSupportPageProps) {
  const { strings } = useI18n()
  const [selectedIncident, setSelectedIncident] = useState<'transferred-money' | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [isCurrentStepConfirmed, setIsCurrentStepConfirmed] = useState(false)
  const [reviewingStepIndex, setReviewingStepIndex] = useState<number | null>(null)
  const trackerRef = useRef<HTMLDivElement | null>(null)

  const bankHotlines = [
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
      name: 'Other bank',
      number: 'Use the official number on your bank card or banking app immediately.',
    },
  ] as const

  const steps = [
    {
      key: 'stop-money',
      label: 'Stop Money',
      eyebrow: 'Step 1',
      title: 'Stop the transfer chain immediately',
      description:
        'Call the National Scam Response Centre first, then contact your bank kill-switch or fraud line without delay.',
      actionLabel: 'Call 997 Now',
      actionHref: 'tel:997',
      emergencyTitle: 'What to say on the call',
      emergencyLines: [
        'I transferred money to a stranger.',
        'My name and IC number are:',
        'My bank account number is:',
        'The transfer amount, time, and recipient account are:',
      ],
      extraTitle: 'After 997, call your bank immediately',
      extraDescription: 'Find your bank below and tap to call.',
      extraItems: bankHotlines,
    },
    {
      key: 'freeze-bank',
      label: 'Freeze Bank',
      eyebrow: 'Step 2',
      title: 'Freeze banking access and block risky channels',
      description:
        'Use your banking app kill switch if available. Ask the bank to freeze suspicious transactions, cards, and online banking access.',
      checklistTitle: 'Do these actions now',
      checklist: [
        'Block debit or credit cards linked to the transfer.',
        'Disable online banking or app access if you suspect compromise.',
        'Ask the bank to flag the recipient transfer as scam-related.',
      ],
    },
    {
      key: 'secure-accounts',
      label: 'Secure Accounts',
      eyebrow: 'Step 3',
      title: 'Secure every account that may be connected',
      description:
        'Reduce further harm by changing access, removing suspicious devices, and checking your email and messaging accounts.',
      checklistTitle: 'Secure these accounts',
      checklist: [
        'Change passwords for banking, email, and important messaging accounts.',
        'Sign out from unknown devices and review recent logins.',
        'Turn on two-factor authentication where possible.',
      ],
    },
    {
      key: 'file-report',
      label: 'File Report',
      eyebrow: 'Step 4',
      title: 'Prepare a strong report with valid evidence',
      description:
        'Collect your key records before heading to the police station so your report is clearer and easier to act on.',
      evidenceTitle: 'Bring these evidence items',
      evidenceItems: [
        'Bank transfer slips or transaction receipts.',
        'Scammer phone number, bank account number, or profile details.',
        'Chat history screenshots, emails, or SMS messages.',
      ],
      semakMuleTitle: 'Check the scammer details before you go',
      semakMuleDescription:
        'Use PDRM Semak Mule to verify the account number or phone number one more time before filing your report.',
      semakMuleHref: 'https://semakmule.rmp.gov.my/',
      semakMuleLabel: 'Open PDRM Semak Mule',
    },
  ] as const

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
        <p className="support-recovery-page__eyebrow">{strings.postScamSupport.eyebrow}</p>
        <h1>{strings.postScamSupport.title}</h1>
        <p className="support-recovery-page__description">{strings.postScamSupport.description}</p>
      </section>

      <section className="support-recovery-page__grid">
        <SectionCard
          className="support-recovery-page__card"
          eyebrow="Step 1"
          title="Transferred money recovery"
          description="Use this guided flow only if you have already sent money to a scammer or suspicious recipient."
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
              I transferred money, try to recovery now
            </Button>
            <p className="support-recovery-page__start-hint">
              This page is for one case only: money has already been sent. Follow it in order, and unlock the next step only after doing the current one in real life.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          className="support-recovery-page__card"
          eyebrow="How to use"
          title="A simple recovery roadmap"
          description="This page is made for high-stress moments. It keeps your attention on one urgent task at a time, starting with the most time-sensitive action."
          footer={<Button variant="secondary" onClick={onBackHome}>{strings.common.backToHome}</Button>}
        >
          <ul className="support-recovery-page__bullet-list">
            <li>Press the large start button once.</li>
            <li>Read only the current step on screen.</li>
            <li>Do the action first in real life.</li>
            <li>Then mark it done to unlock the next step.</li>
            <li>The next step will open automatically.</li>
          </ul>
        </SectionCard>

        {selectedIncident ? (
          <div ref={trackerRef} className="support-recovery-page__tracker-anchor">
            <SectionCard
              className="support-recovery-page__card support-recovery-page__card--tracker"
              eyebrow="Step 2"
              title="Follow these steps in order"
              description="You are on a guided recovery path. Future steps stay locked until the current step is done."
            >
              <div className="support-recovery-page__selected-case">
                <span className="support-recovery-page__selected-case-label">Selected case</span>
                <strong>I have transferred money</strong>
              </div>
              <ol className="support-recovery-page__tracker" aria-label="Recovery steps">
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
                            {isDone ? 'Done' : isActive ? 'Active' : 'Locked'}
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
            eyebrow={`Current action • ${activeStep.eyebrow}`}
            title={activeStep.title}
            description={activeStep.description}
            footer={
              !isAllDone ? (
                <div className="support-recovery-page__active-footer">
                  {isReviewingPastStep ? (
                    <p className="support-recovery-page__active-footer-text">
                      You are reviewing an earlier step. Return to the active step in the tracker when you are ready to continue.
                    </p>
                  ) : (
                    <>
                      <p className="support-recovery-page__active-footer-text">
                        Complete this action in real life before unlocking the next step.
                      </p>
                      <label className="support-recovery-page__confirm-check">
                        <input
                          type="checkbox"
                          checked={isCurrentStepConfirmed}
                          onChange={(event) => setIsCurrentStepConfirmed(event.target.checked)}
                        />
                        <span>I have completed this action and I am ready for the next step.</span>
                      </label>
                      <Button
                        onClick={completeCurrentStep}
                        disabled={!isCurrentStepConfirmed}
                        className="support-recovery-page__active-button"
                      >
                        Done, next step
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
                        <strong>Police</strong>
                        <small>Report fast</small>
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
                        <strong>Freeze bank</strong>
                        <small>Block transfers</small>
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
                        <strong>Stop loss</strong>
                        <small>Act now</small>
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
                          Call 997 now
                        </p>
                      </div>

                      <div className="support-recovery-page__emergency-call-card">
                        <div className="support-recovery-page__emergency-call-copy">
                          <p className="support-recovery-page__emergency-call-label">NSRC scam hotline</p>
                          <p className="support-recovery-page__emergency-call-number">997</p>
                        </div>

                        <a
                          className="support-recovery-page__urgent-link support-recovery-page__urgent-link--danger"
                          href={activeStep.actionHref}
                        >
                          <span className="support-recovery-page__urgent-link-copy">
                            <span>Tap here to call 997</span>
                          </span>
                        </a>
                      </div>

                      <div className="support-recovery-page__emergency-service-card">
                        <p className="support-recovery-page__emergency-service-label">
                          997 first
                        </p>
                        <p className="support-recovery-page__emergency-service-text">
                          Start with NSRC 997. Call your bank right after that.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="support-recovery-page__callout">
                  <p className="support-recovery-page__callout-title">{activeStep.emergencyTitle}</p>
                  <ul className="support-recovery-page__bullet-list">
                    {activeStep.emergencyLines.map((line) => (
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
                        <span>Tap to call now</span>
                      </span>
                    </div>
                    {'extraDescription' in activeStep ? (
                      <p className="support-recovery-page__callout-text">{activeStep.extraDescription}</p>
                    ) : null}
                  </div>
                  <div className="support-recovery-page__hotline-list">
                    {activeStep.extraItems.map((item) => (
                      item.name === 'Other bank' ? (
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
                  {activeStep.checklist.map((item) => (
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
                    {activeStep.evidenceItems.map((item) => (
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
            eyebrow="Completed"
            title="You have reviewed the emergency recovery checklist"
            description={
              'Keep your evidence together, keep following your bank and police instructions,\nand do not continue talking to the scammer.'
            }
            footer={
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            }
          >
            <p className="support-recovery-page__final-note">
              This checklist does not replace live follow-up. If new money movements appear,
              <br />
              call your bank and 997 again immediately.
            </p>
          </SectionCard>
        ) : null}
      </section>
    </main>
  )
}
