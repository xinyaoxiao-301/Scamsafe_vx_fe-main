import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PropsWithChildren } from 'react'
import { primaryNavItems, type AppRoute, appRoutes } from '@/app/routes'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n, type Language } from '@/lib/i18n'
import logo from '@/assets/scamsafe-logo.png'
import homeHeroBackground from '@/assets/home-hero-background.png'

type AppShellProps = PropsWithChildren<{
  currentRoute: AppRoute
  onNavigate: (route: AppRoute) => void
  enableHeroAnimations?: boolean
}>

type HeroTitleToken = {
  id: string
  tone: 'plain' | 'highlight'
  text: string
  spaceAfter: boolean
}

// Split the hero title into letters so CSS can stagger the animation while the
// hidden full title remains available to screen readers.
function renderAnimatedTitle(tokens: HeroTitleToken[], shouldAnimate: boolean) {
  let globalIndex = 0

  return tokens.flatMap((token) => {
    if (token.text === '\n') {
      return [<br key={token.id} />]
    }

    const letters = token.text.split('').map((char, letterIndex) => {
      const style = { ['--i' as const]: globalIndex++ } as CSSProperties
      const className =
        token.tone === 'highlight'
          ? [
              'app-shell__hero-title-letter',
              'app-shell__hero-title-letter--highlight',
              shouldAnimate ? 'app-shell__hero-title-letter--animate' : '',
            ]
              .filter(Boolean)
              .join(' ')
          : ['app-shell__hero-title-letter', shouldAnimate ? 'app-shell__hero-title-letter--animate' : '']
              .filter(Boolean)
              .join(' ')

      return (
        <span className={className} style={style} key={`${token.id}-${letterIndex}`}>
          {char}
        </span>
      )
    })

    const word = (
      <span className="app-shell__hero-title-word" key={token.id}>
        {letters}
      </span>
    )

    if (!token.spaceAfter) return [word]

    return [
      word,
      <span className="app-shell__hero-title-space" aria-hidden="true" key={`${token.id}-space`}>
        {' '}
      </span>,
    ]
  })
}

function titleTokensToText(tokens: HeroTitleToken[]) {
  return tokens
    .map((token) => (token.text === '\n' ? ' ' : token.text) + (token.spaceAfter ? ' ' : ''))
    .join('')
    .trim()
}

export function AppShell({ children, currentRoute, onNavigate, enableHeroAnimations = false }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [heroAnimationCycle, setHeroAnimationCycle] = useState(0)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isDesktop = useMediaQuery('(min-width: 1200px)')
  const isHome = currentRoute === appRoutes.home
  const { language, setLanguage, strings } = useI18n()
  const lastHeroTriggerRef = useRef<string | null>(null)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentRoute])

  useEffect(() => {
    if (!enableHeroAnimations) {
      lastHeroTriggerRef.current = null
      return
    }

    if (!isHome) {
      lastHeroTriggerRef.current = null
      return
    }

    const triggerKey = `${currentRoute}-${language}`
    if (lastHeroTriggerRef.current === triggerKey) {
      return
    }

    lastHeroTriggerRef.current = triggerKey
    setHeroAnimationCycle((current) => current + 1)
  }, [currentRoute, enableHeroAnimations, isHome, language])

  const languageLabel = (value: Language) => {
    if (!isMobile) return strings.ui.languageOption[value]
    if (value === 'en') return 'EN'
    if (value === 'ms') return 'BM'
    return '中文'
  }

  return (
    <div className="app-shell">
      <div className="app-shell__ambient" aria-hidden="true" />
      <div className="app-shell__ambient app-shell__ambient--secondary" aria-hidden="true" />
      <div className={isHome ? 'app-shell__frame app-shell__frame--home' : 'app-shell__frame'}>
        <header className="app-shell__brand" aria-label="ScamSafe brand">
          <div className="app-shell__brand-copy">
            <button className="app-shell__brand-home" type="button" onClick={() => onNavigate(appRoutes.home)}>
              <img className="app-shell__brand-logo" src={logo} alt="ScamSafe logo" />
              <span className="app-shell__brand-mark">ScamSafe</span>
            </button>
          </div>
          {isDesktop ? (
            <nav className="app-shell__nav app-shell__nav--desktop" id="app-navigation" aria-label="Primary navigation">
              {primaryNavItems.map((item) => (
                <button
                  key={item.route}
                  className={[
                    'app-shell__nav-link',
                    item.route === currentRoute ? 'app-shell__nav-link--active' : '',
                    item.route === appRoutes.studyCenter && language === 'en'
                      ? 'app-shell__nav-link--study-center'
                      : '',
                    item.route === appRoutes.knowledgeHub && language === 'en'
                      ? 'app-shell__nav-link--knowledge-hub'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                >
                  {strings.nav[item.route]}
                </button>
              ))}
            </nav>
          ) : (
            <div className="app-shell__nav">
              <div className="app-shell__nav-controls">
                <button
                  type="button"
                  className="app-shell__menu-button"
                  aria-label={strings.ui.openMenu}
                  aria-expanded={isMenuOpen}
                  aria-controls="app-navigation"
                  onClick={() => setIsMenuOpen((current) => !current)}
                >
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </button>
                <label className="app-shell__lang" aria-label={strings.ui.language}>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as Language)}
                    aria-label={strings.ui.language}
                  >
                    <option value="en">{languageLabel('en')}</option>
                    <option value="ms">{languageLabel('ms')}</option>
                    <option value="zh">{languageLabel('zh')}</option>
                  </select>
                </label>
              </div>
              {isMenuOpen ? (
                <nav className="app-shell__menu-panel" id="app-navigation" aria-label="Primary navigation">
                  {primaryNavItems.map((item) => (
                    <button
                      key={item.route}
                      className={
                        item.route === currentRoute
                          ? 'app-shell__menu-link app-shell__menu-link--active'
                          : 'app-shell__menu-link'
                      }
                      type="button"
                      onClick={() => onNavigate(item.route)}
                    >
                      {strings.nav[item.route]}
                    </button>
                  ))}
                </nav>
              ) : null}
            </div>
          )}
          <div className={isDesktop ? 'app-shell__nav-controls app-shell__nav-controls--desktop' : 'app-shell__nav-controls'}>
            {isDesktop ? (
              <label className="app-shell__lang" aria-label={strings.ui.language}>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language)}
                  aria-label={strings.ui.language}
                >
                  <option value="en">{languageLabel('en')}</option>
                  <option value="ms">{languageLabel('ms')}</option>
                  <option value="zh">{languageLabel('zh')}</option>
                </select>
              </label>
            ) : null}
          </div>
        </header>
        {isHome ? (
          <>
            <section
              key={heroAnimationCycle}
              className={enableHeroAnimations ? 'app-shell__hero app-shell__hero--animate' : 'app-shell__hero'}
              aria-label="ScamSafe hero introduction"
            >
              <div className="app-shell__hero-bg" aria-hidden="true">
                <img src={homeHeroBackground} alt="" />
              </div>
              <div className="app-shell__hero-inner">
                <header className="app-shell__hero-header" aria-label="ScamSafe tagline">
                  <h1 className="app-shell__hero-title" aria-label={titleTokensToText(strings.hero.titleTokens)}>
                    <span className="sr-only">{titleTokensToText(strings.hero.titleTokens)}</span>
                    <span className="app-shell__hero-title-animated" aria-hidden="true">
                      {renderAnimatedTitle(strings.hero.titleTokens, enableHeroAnimations)}
                    </span>
                  </h1>
                </header>
                <div className="app-shell__hero-body">
                  <div className="app-shell__hero-copy">
                    <p className="app-shell__hero-subtitle">{strings.hero.subtitle}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
        {isHome ? (
          <>
            <div className="app-shell__home-main" aria-label="Homepage main content">
              <section className="app-shell__hero-video-section" aria-label="ScamSafe tutorial video">
                <div className="app-shell__hero-video-wrap">
                  <div className="app-shell__hero-video-frame">
                    <div className="app-shell__hero-video-play">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9.2 7.6v8.8L16.8 12 9.2 7.6Z" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="app-shell__hero-video-label">{strings.hero.video.label}</p>
                    <p className="app-shell__hero-video-hint">{strings.hero.video.hint}</p>
                  </div>
                </div>
              </section>
              {children}

              <section className="app-shell__stats" aria-label="Malaysia scam statistics">
                <header className="app-shell__stats-header">
                  <p className="app-shell__stats-eyebrow">{strings.homeStats.eyebrow}</p>
                  <h2 className="app-shell__stats-title">{strings.homeStats.title}</h2>
                </header>

                <div className="app-shell__stats-grid" role="list" aria-label="Key statistics">
                  <article className="app-shell__stats-card" role="listitem">
                    <div className="app-shell__stats-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M8 3h8" />
                        <path d="M7 7h10a4 4 0 0 1 4 4v2a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7v-2a4 4 0 0 1 4-4Z" />
                        <path d="M12 10v4" />
                        <path d="M10 12h4" />
                      </svg>
                    </div>
                    <p className="app-shell__stats-label">{strings.homeStats.cards.monthlyExposure.label}</p>
                    <p className="app-shell__stats-value">{strings.homeStats.cards.monthlyExposure.value}</p>
                    <p className="app-shell__stats-hint">{strings.homeStats.cards.monthlyExposure.hint}</p>
                  </article>

                  <article className="app-shell__stats-card" role="listitem">
                    <div className="app-shell__stats-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M4.5 18.5V6.8a2.3 2.3 0 0 1 2.3-2.3h10.4a2.3 2.3 0 0 1 2.3 2.3v11.7" />
                        <path d="M6.8 18.5h10.4" />
                        <path d="M8.2 9.2h7.6" />
                        <path d="M8.2 12.2h7.6" />
                        <path d="M8.2 15.2h4.6" />
                      </svg>
                    </div>
                    <p className="app-shell__stats-label">{strings.homeStats.cards.totalLosses.label}</p>
                    <p className="app-shell__stats-value">{strings.homeStats.cards.totalLosses.value}</p>
                    <p className="app-shell__stats-hint">{strings.homeStats.cards.totalLosses.hint}</p>
                  </article>

                  <article className="app-shell__stats-card" role="listitem">
                    <div className="app-shell__stats-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 18.5V6.5" />
                        <path d="M5 18.5h14" />
                        <path d="M8 16v-4" />
                        <path d="M12 16V9" />
                        <path d="M16 16v-6" />
                      </svg>
                    </div>
                    <p className="app-shell__stats-label">{strings.homeStats.cards.gdpShare.label}</p>
                    <p className="app-shell__stats-value">{strings.homeStats.cards.gdpShare.value}</p>
                    <p className="app-shell__stats-hint">{strings.homeStats.cards.gdpShare.hint}</p>
                  </article>

                  <article className="app-shell__stats-card" role="listitem">
                    <div className="app-shell__stats-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M8.5 10.3a3.2 3.2 0 1 1 6.4 0" />
                        <path d="M6.5 20v-1.1a5.5 5.5 0 0 1 11 0V20" />
                        <path d="M9.1 13.1h5.8" />
                      </svg>
                    </div>
                    <p className="app-shell__stats-label">{strings.homeStats.cards.seniorsAffected.label}</p>
                    <p className="app-shell__stats-value">{strings.homeStats.cards.seniorsAffected.value}</p>
                    <p className="app-shell__stats-hint">{strings.homeStats.cards.seniorsAffected.hint}</p>
                  </article>
                </div>

                <p className="app-shell__stats-sources">{strings.homeStats.sources}</p>
              </section>
            </div>
          </>
        ) : (
          children
        )}
        <div className="app-shell__footer-wrap">
          <footer className="app-footer" aria-label="Footer">
            <div className="app-footer__inner">
              <div className="app-footer__header">
                <h2 className="app-footer__title">{strings.footer.title}</h2>
              </div>
              <div className="app-footer__grid">
                <section className="app-footer__card" aria-label="Data sources">
                  <h3 className="app-footer__card-title">{strings.footer.sourcesTitle}</h3>
                  <p className="app-footer__card-text">{strings.footer.sourcesHint}</p>
                  <p className="app-footer__credit">
                    <span className="app-footer__credit-label">Image credit:</span>{' '}
                    <a
                      className="app-footer__credit-link"
                      href="https://www.freepik.com/free-photo/elderly-senior-asian-male-freelancer-casual-clothes-typing-laptop-keyboard-while-talking-smartphone-standing-desk-busy-working-home-office_25117731.htm#fromView=search&page=1&position=2&uuid=ff5cca6a-b8fa-489a-ba36-8c4ab535e59c&query=Elderly+fraud+asian+technical"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Image by Lifestylememory on Freepik
                    </a>
                  </p>
                </section>
                <section className="app-footer__card" aria-label="About ScamSafe">
                  <h3 className="app-footer__card-title">{strings.footer.aboutTitle}</h3>
                  <p className="app-footer__card-text">{strings.footer.aboutHint}</p>
                </section>
                <section className="app-footer__card" aria-label="Risk level guide">
                  <h3 className="app-footer__card-title">{strings.footer.riskTitle}</h3>
                  <p className="app-footer__card-text">{strings.footer.riskHint}</p>
                </section>
              </div>
              <p className="app-footer__copyright">© {new Date().getFullYear()} ScamSafe</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
