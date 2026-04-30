import { useEffect, useState } from 'react'
import logo from '@/assets/scamsafe-logo.png'
import { AppShell } from '@/app/AppShell'
import { appRoutes, getRouteFromHash, type AppRoute } from '@/app/routes'
import { Button } from '@/components/ui/Button'
import { useNotificationTraining } from '@/hooks/useNotificationTraining'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { fetchNotificationReveal } from '@/services/notificationTraining'
import { HomePage } from '@/pages/home'
import { KnowledgeHubPage } from '@/pages/knowledge-hub'
import { NotificationRevealPage } from '@/pages/notification-reveal'
import { PostScamSupportPage } from '@/pages/post-scam-support'
import { ScamDetectionPage } from '@/pages/scam-detection'
import { ScamSimulationPage } from '@/pages/scam-simulation'
import { StudyCenterPage } from '@/pages/study-center'

type SiteEntryState = 'pending' | 'accepted' | 'declined'

function formatNotificationTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

function AppContent() {
  const { strings } = useI18n()
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash))
  const [siteEntryState, setSiteEntryState] = useState<SiteEntryState>('pending')
  const [notificationTime, setNotificationTime] = useState(() => formatNotificationTime(new Date()))
  const [isDismissingNotification, setIsDismissingNotification] = useState(false)
  const [showDismissedScamModal, setShowDismissedScamModal] = useState(false)
  const hasAcceptedSiteDisclaimer = siteEntryState === 'accepted'
  const hasDeclinedSiteDisclaimer = siteEntryState === 'declined'
  const { activeScenario, dismissScenario, openScenario } = useNotificationTraining(hasAcceptedSiteDisclaimer)
  const siteDisclaimerStrings = strings.siteDisclaimer
  const notificationStrings = strings.notificationTraining

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', handleHashChange)

    if (!window.location.hash) {
      window.location.hash = appRoutes.home
    } else {
      handleHashChange()
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    if (!activeScenario) {
      return
    }

    setNotificationTime(formatNotificationTime(new Date()))

    const intervalId = window.setInterval(() => {
      setNotificationTime(formatNotificationTime(new Date()))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeScenario])

  // Hash routing keeps the static build deployable without server-side rewrite
  // rules while still allowing direct feature navigation inside the app.
  const handleNavigate = (route: AppRoute) => {
    if (window.location.hash === route) {
      setCurrentRoute(route)
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    window.location.hash = route
  }

  const page = (() => {
    switch (currentRoute) {
      case appRoutes.detection:
        return <ScamDetectionPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.simulation:
        return <ScamSimulationPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.studyCenter:
        return <StudyCenterPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.support:
        return <PostScamSupportPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.knowledgeHub:
        return <KnowledgeHubPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.notificationReveal:
        return <NotificationRevealPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.home:
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  })()

  const handleEnterWebsite = () => {
    setSiteEntryState('accepted')
  }

  const handleExitWebsite = () => {
    const canGoBack = window.history.length > 1 || document.referrer.length > 0

    setSiteEntryState('declined')

    window.setTimeout(() => {
      window.close()

      if (canGoBack) {
        window.history.back()
      }
    }, 0)
  }

  const handleReturnToNotice = () => {
    setSiteEntryState('pending')
  }

  const handleDismissNotification = async () => {
    const scenario = activeScenario
    if (!scenario || isDismissingNotification) {
      return
    }

    setIsDismissingNotification(true)
    dismissScenario()

    try {
      const reveal = await fetchNotificationReveal(scenario.id)
      if (reveal.isScam) {
        setShowDismissedScamModal(true)
      }
    } catch {
      // If reveal data is unavailable, keep the dismiss behaviour silent so the
      // training flow still feels responsive.
    } finally {
      setIsDismissingNotification(false)
    }
  }

  return (
    <>
      {hasDeclinedSiteDisclaimer ? (
        <div className="entry-consent-modal" role="dialog" aria-modal="true" aria-labelledby="entry-consent-title">
          <div className="entry-consent-modal__backdrop" aria-hidden="true" />
          <section className="entry-consent-modal__card" aria-describedby="entry-consent-description">
            <p className="entry-consent-modal__eyebrow">{siteDisclaimerStrings.consentEyebrow}</p>
            <h2 id="entry-consent-title" className="entry-consent-modal__title">
              {siteDisclaimerStrings.exitTitle}
            </h2>
            <p id="entry-consent-description" className="entry-consent-modal__description">
              {siteDisclaimerStrings.exitDescription}
            </p>
            <div className="entry-consent-modal__actions">
              <Button variant="secondary" onClick={handleReturnToNotice}>
                {siteDisclaimerStrings.returnToNotice}
              </Button>
            </div>
          </section>
        </div>
      ) : (
        <>
          <AppShell
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            enableHeroAnimations={hasAcceptedSiteDisclaimer}
          >
            {page}
          </AppShell>
          {!hasAcceptedSiteDisclaimer ? (
            <div className="entry-consent-modal" role="dialog" aria-modal="true" aria-labelledby="entry-consent-title">
              <div className="entry-consent-modal__backdrop" aria-hidden="true" />
              <section className="entry-consent-modal__card" aria-describedby="entry-consent-description">
                <p className="entry-consent-modal__eyebrow">{siteDisclaimerStrings.consentEyebrow}</p>
                <h2 id="entry-consent-title" className="entry-consent-modal__title">
                  {siteDisclaimerStrings.consentTitle}
                </h2>
                <p id="entry-consent-description" className="entry-consent-modal__description">
                  {siteDisclaimerStrings.consentDescription}
                </p>
                <div className="entry-consent-modal__points">
                  <article className="entry-consent-modal__point">
                    <h3 className="entry-consent-modal__point-title">{siteDisclaimerStrings.privacyTitle}</h3>
                    <p className="entry-consent-modal__point-text">{siteDisclaimerStrings.privacyText}</p>
                  </article>
                  <article className="entry-consent-modal__point">
                    <h3 className="entry-consent-modal__point-title">{siteDisclaimerStrings.referenceTitle}</h3>
                    <p className="entry-consent-modal__point-text">{siteDisclaimerStrings.referenceText}</p>
                  </article>
                </div>
                <p className="entry-consent-modal__helper">{siteDisclaimerStrings.permissionText}</p>
                <div className="entry-consent-modal__actions">
                  <Button onClick={handleEnterWebsite}>{siteDisclaimerStrings.agree}</Button>
                  <Button variant="secondary" onClick={handleExitWebsite}>
                    {siteDisclaimerStrings.disagree}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
          {hasAcceptedSiteDisclaimer && currentRoute !== appRoutes.notificationReveal && activeScenario ? (
            <div className="notification-modal" role="dialog" aria-modal="true" aria-label="Simulated notification popup">
              <div className="notification-modal__backdrop" aria-hidden="true" />
              <section
                className="notification-modal__panel"
                aria-label="Simulated notification preview"
              >
                <div className="notification-modal__window-bar">
                  <span className="notification-modal__window-label">{notificationStrings.browserAlertLabel}</span>
                  <span className="notification-modal__window-time">{notificationStrings.justNow}</span>
                </div>
                <div className="notification-modal__source">
                  <img className="notification-modal__logo" src={logo} alt="" />
                  <div className="notification-modal__source-copy">
                    <p className="notification-modal__source-name">ScamSafe practice alert</p>
                  </div>
                </div>
                <div className="notification-modal__header">
                  <h2 className="notification-modal__title">Check this notification carefully</h2>
                </div>
                <p className="notification-modal__message-time">Today {notificationTime}</p>
                <div className="notification-modal__message-box">
                  <p className="notification-modal__message-label">{notificationStrings.messageLabel}</p>
                  <p className="notification-modal__body">{activeScenario.message}</p>
                </div>
                <p className="notification-modal__scope-note">{notificationStrings.scopeNote}</p>
                <div className="notification-modal__actions">
                  <Button onClick={() => openScenario()}>Open</Button>
                  <Button variant="secondary" onClick={() => void handleDismissNotification()} disabled={isDismissingNotification}>
                    {notificationStrings.dismiss}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
          {showDismissedScamModal ? (
            <div className="notification-modal notification-modal--center" role="dialog" aria-modal="true" aria-labelledby="notification-dismiss-success-title">
              <div className="notification-modal__backdrop" aria-hidden="true" />
              <section className="notification-modal__panel notification-modal__panel--safe notification-modal__panel--result">
                <div className="notification-modal__result-icon" aria-hidden="true">
                  ✓
                </div>
                <div className="notification-modal__header">
                  <h2 id="notification-dismiss-success-title" className="notification-modal__title">
                    {notificationStrings.dismissedScamTitle}
                  </h2>
                </div>
                <p className="notification-modal__result-text">{notificationStrings.dismissedScamDescription}</p>
                <div className="notification-modal__actions">
                  <Button onClick={() => setShowDismissedScamModal(false)}>
                    {notificationStrings.dismissedScamConfirm}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
