import { useEffect, useState } from 'react'
import logo from '@/assets/scamsafe-logo.png'
import { AppShell } from '@/app/AppShell'
import { appRoutes, getRouteFromHash, type AppRoute } from '@/app/routes'
import { Button } from '@/components/ui/Button'
import { useNotificationTraining } from '@/hooks/useNotificationTraining'
import { I18nProvider, useI18n } from '@/lib/i18n'
import { HomePage } from '@/pages/home'
import { KnowledgeHubPage } from '@/pages/knowledge-hub'
import { NotificationRevealPage } from '@/pages/notification-reveal'
import { PostScamSupportPage } from '@/pages/post-scam-support'
import { ScamDetectionPage } from '@/pages/scam-detection'
import { ScamSimulationPage } from '@/pages/scam-simulation'
import { StudyCenterPage } from '@/pages/study-center'

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
  const [hasAcceptedSiteDisclaimer, setHasAcceptedSiteDisclaimer] = useState(false)
  const { activeScenario, dismissScenario, openScenario } = useNotificationTraining(hasAcceptedSiteDisclaimer)
  const siteDisclaimerStrings = strings.siteDisclaimer
  const notificationStrings = strings.notificationTraining
  const showDistinctNotificationBranding =
    activeScenario?.branding.trim().toLowerCase() !== activeScenario?.sender.trim().toLowerCase()

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
    setHasAcceptedSiteDisclaimer(true)
  }

  const handleExitWebsite = () => {
    window.location.replace('about:blank')
  }

  return (
    <>
      <AppShell currentRoute={currentRoute} onNavigate={handleNavigate}>
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
          <button
            type="button"
            className="notification-modal__backdrop"
            aria-label="Close simulated notification"
            onClick={dismissScenario}
          />
          <section
            className={
              activeScenario.kind === 'scam'
                ? 'notification-modal__panel notification-modal__panel--scam'
                : 'notification-modal__panel notification-modal__panel--safe'
            }
            aria-label="Simulated notification preview"
          >
            <div className="notification-modal__window-bar">
              <span className="notification-modal__window-label">{notificationStrings.browserAlertLabel}</span>
              <span className="notification-modal__window-time">{notificationStrings.justNow}</span>
            </div>
            <div className="notification-modal__source">
              <img className="notification-modal__logo" src={logo} alt="" />
              <div className="notification-modal__source-copy">
                {showDistinctNotificationBranding ? (
                  <p className="notification-modal__eyebrow">{activeScenario.branding}</p>
                ) : null}
                <p className="notification-modal__source-name">{activeScenario.sender}</p>
              </div>
            </div>
            <div className="notification-modal__header">
              <h2 className="notification-modal__title">{activeScenario.title}</h2>
              <span className="notification-modal__kind" aria-label="Scenario type">
                {activeScenario.kind === 'scam'
                  ? notificationStrings.suspiciousLabel
                  : notificationStrings.trustedLabel}
              </span>
            </div>
            <p className="notification-modal__body">{activeScenario.body}</p>
            <div className="notification-modal__meta">
              <div className="notification-modal__meta-row">
                <span className="notification-modal__meta-label">{notificationStrings.sourceLabel}</span>
                <span>{activeScenario.sender}</span>
              </div>
              <div className="notification-modal__meta-row">
                <span className="notification-modal__meta-label">{notificationStrings.linkLabel}</span>
                <span>{activeScenario.url}</span>
              </div>
            </div>
            <p className="notification-modal__hint">{notificationStrings.previewHint}</p>
            <div className="notification-modal__actions">
              <Button onClick={() => openScenario()}>{activeScenario.actionLabel}</Button>
              <Button variant="secondary" onClick={dismissScenario}>
                {notificationStrings.dismiss}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
