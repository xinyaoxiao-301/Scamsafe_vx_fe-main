// App.tsx is the single composition root for the frontend. It keeps hash-based
// routing, notification prefetching, disclaimer gating, and page selection in
// one place so feature pages can stay focused on their own UI logic.
import { useEffect, useState } from 'react'
import logo from '@/assets/scamsafe-logo.png'
import { AppShell } from '@/app/AppShell'
import { appRoutes, getRouteFromHash, type AppRoute } from '@/app/routes'
import { Button } from '@/components/ui/Button'
import { useNotificationTraining } from '@/hooks/useNotificationTraining'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { fetchNotificationReveal } from '@/services/notificationTraining'
import { HomePage } from '@/pages/home'
import { FooterInfoPage } from '@/pages/footer-info'
import { KnowledgeHubPage } from '@/pages/knowledge-hub'
import { NotificationRevealPage } from '@/pages/notification-reveal'
import { PostScamSupportPage } from '@/pages/post-scam-support'
import { ScamDetectionPage } from '@/pages/scam-detection'
import { ScamSimulationPage } from '@/pages/scam-simulation'
import { StudyCenterPage } from '@/pages/study-center'

type SiteEntryState = 'pending' | 'accepted' | 'declined'

function formatNotificationTime(date: Date, language: string) {
  const locale = language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-Hans-MY' : 'en-MY'
  return new Intl.DateTimeFormat(locale, {
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
  const { language, strings } = useI18n()
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash))
  const [siteEntryState, setSiteEntryState] = useState<SiteEntryState>('pending')
  const [notificationTime, setNotificationTime] = useState(() => formatNotificationTime(new Date(), language))
  const [prefetchedNotificationReveal, setPrefetchedNotificationReveal] = useState<Record<number, { isScam: boolean }>>({})
  const [showDismissedScamToast, setShowDismissedScamToast] = useState(false)
  const hasAcceptedSiteDisclaimer = siteEntryState === 'accepted'
  const hasDeclinedSiteDisclaimer = siteEntryState === 'declined'

  // Pass the active language so the hook fetches a localised notification message.
  const { activeScenario, dismissScenario, openScenario } = useNotificationTraining(
    hasAcceptedSiteDisclaimer,
    language,
  )

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

    setNotificationTime(formatNotificationTime(new Date(), language))

    const intervalId = window.setInterval(() => {
      setNotificationTime(formatNotificationTime(new Date(), language))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeScenario, language])

  useEffect(() => {
    if (!activeScenario || prefetchedNotificationReveal[activeScenario.id]) {
      return
    }

    let isCancelled = false

    void (async () => {
      try {
        // Prefetch the reveal in the correct language so the result page is
        // already localised when the user clicks "Open".
        const reveal = await fetchNotificationReveal(activeScenario.id, language)
        if (isCancelled) return

        setPrefetchedNotificationReveal((current) => ({
          ...current,
          [activeScenario.id]: { isScam: reveal.isScam },
        }))
      } catch {
        // Keep the preview visible even if the background reveal request fails.
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [activeScenario, language, prefetchedNotificationReveal])

  useEffect(() => {
    if (!showDismissedScamToast) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowDismissedScamToast(false)
    }, 6000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [showDismissedScamToast])

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
        return <ScamSimulationPage key={`${currentRoute}:${language}`} onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.studyCenter:
        return <StudyCenterPage key={`${currentRoute}:${language}`} onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.support:
        return <PostScamSupportPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.knowledgeHub:
        return <KnowledgeHubPage key={`${currentRoute}:${language}`} onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.notificationReveal:
        return <NotificationRevealPage key={`${currentRoute}:${language}`} onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.dataSources:
        return <FooterInfoPage kind="sources" onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.aboutUs:
        return <FooterInfoPage kind="about" onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.riskGuide:
        return <FooterInfoPage kind="risk" onBackHome={() => handleNavigate(appRoutes.home)} />
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
    if (!scenario) {
      return
    }

    dismissScenario()

    const cachedReveal = prefetchedNotificationReveal[scenario.id]
    if (cachedReveal) {
      if (cachedReveal.isScam) {
        setShowDismissedScamToast(true)
      }
      return
    }

    try {
      // Fetch reveal in the current language so even the dismiss-path gets
      // localised data if the prefetch hadn't completed yet.
      const reveal = await fetchNotificationReveal(scenario.id, language)
      setPrefetchedNotificationReveal((current) => ({
        ...current,
        [scenario.id]: { isScam: reveal.isScam },
      }))

      if (reveal.isScam) {
        setShowDismissedScamToast(true)
      }
    } catch {
      // If reveal data is unavailable, keep the dismiss behaviour silent.
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
            <div className="notification-modal" role="dialog" aria-modal="true" aria-label={notificationStrings.popupLabel}>
              <div className="notification-modal__backdrop" aria-hidden="true" />
              <section
                className="notification-modal__panel"
                aria-label={notificationStrings.previewLabel}
              >
                <button
                  type="button"
                  className="notification-close-button notification-close-button--modal"
                  aria-label={notificationStrings.dismiss}
                  onClick={() => void handleDismissNotification()}
                >
                  ×
                </button>
                <div className="notification-modal__window-bar">
                  <span className="notification-modal__window-label">{notificationStrings.justNow}</span>
                </div>
                <div className="notification-modal__source">
                  <img className="notification-modal__logo" src={logo} alt="" />
                  <div className="notification-modal__source-copy">
                    <p className="notification-modal__source-name">{notificationStrings.practiceAlertName}</p>
                  </div>
                </div>
                <div className="notification-modal__header">
                  <h2 className="notification-modal__title">{notificationStrings.checkCarefullyTitle}</h2>
                </div>
                <p className="notification-modal__message-time">
                  {notificationStrings.todayLabel} {notificationTime}
                </p>
                <div className="notification-modal__message-box">
                  <p className="notification-modal__message-label">{notificationStrings.messageLabel}</p>
                  <p className="notification-modal__body">{activeScenario.message}</p>
                </div>
                <p className="notification-modal__scope-note">{notificationStrings.scopeNote}</p>
                <div className="notification-modal__actions">
                  <Button onClick={() => openScenario()}>{notificationStrings.open}</Button>
                  <Button variant="secondary" onClick={() => void handleDismissNotification()}>
                    {notificationStrings.dismiss}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
          {showDismissedScamToast ? (
            <div className="notification-toast" role="status" aria-live="polite" aria-atomic="true">
              <section className="notification-toast__panel notification-toast__panel--safe">
                <div className="notification-toast__icon" aria-hidden="true">
                  ✓
                </div>
                <div className="notification-toast__copy">
                  <h2 className="notification-toast__title">{notificationStrings.dismissedScamTitle}</h2>
                  <p className="notification-toast__text">{notificationStrings.dismissedScamDescription}</p>
                </div>
                <button
                  type="button"
                  className="notification-close-button notification-close-button--toast"
                  aria-label={notificationStrings.dismissedScamConfirm}
                  onClick={() => setShowDismissedScamToast(false)}
                >
                  ×
                </button>
              </section>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}
