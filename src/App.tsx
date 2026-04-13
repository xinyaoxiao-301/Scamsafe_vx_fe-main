import { useEffect, useState } from 'react'
import { AppShell } from '@/app/AppShell'
import { appRoutes, getRouteFromHash, type AppRoute } from '@/app/routes'
import { I18nProvider } from '@/lib/i18n'
import { HomePage } from '@/pages/home'
import { ScamDetectionPage } from '@/pages/scam-detection'
import { ScamSimulationPage } from '@/pages/scam-simulation'
import { StudyCenterPage } from '@/pages/study-center'
import { PostScamSupportPage } from '@/pages/post-scam-support'
import { AboutUsPage } from '@/pages/about-us'

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash))

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
      case appRoutes.aboutUs:
        return <AboutUsPage onBackHome={() => handleNavigate(appRoutes.home)} />
      case appRoutes.home:
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  })()

  return (
    <I18nProvider>
      <AppShell currentRoute={currentRoute} onNavigate={handleNavigate}>
        {page}
      </AppShell>
    </I18nProvider>
  )
}
