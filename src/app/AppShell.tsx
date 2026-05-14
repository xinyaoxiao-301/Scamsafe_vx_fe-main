import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PropsWithChildren } from 'react'
import { primaryNavItems, type AppRoute, appRoutes } from '@/app/routes'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n, type Language } from '@/lib/i18n'
import logo from '@/assets/scamsafe-logo.png'
import homeHeroBackground from '@/assets/home-hero-background.png'
import seniorsIcon from '@/assets/seniors.png'
import lossesIcon from '@/assets/losses.png'
import gdpIcon from '@/assets/gdp.png'
import exposureIcon from '@/assets/exposure.png'

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
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [heroAnimationCycle, setHeroAnimationCycle] = useState(0)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isDesktop = useMediaQuery('(min-width: 1200px)')
  const isHome = currentRoute === appRoutes.home
  const { language, setLanguage, strings } = useI18n()
  const lastHeroTriggerRef = useRef<string | null>(null)
  const langMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsMenuOpen(false)
    setIsLangMenuOpen(false)
  }, [currentRoute])

  useEffect(() => {
    if (!isLangMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (langMenuRef.current?.contains(target)) return
      setIsLangMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isLangMenuOpen])

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
        <header className="app-shell__brand" aria-label={strings.ui.brandLabel}>
          <div className="app-shell__brand-copy">
            <button className="app-shell__brand-home" type="button" onClick={() => onNavigate(appRoutes.home)}>
              <img className="app-shell__brand-logo" src={logo} alt="ScamSafe logo" />
              <span className="app-shell__brand-mark">ScamSafe</span>
            </button>
          </div>
          {isDesktop ? (
            <nav className="app-shell__nav app-shell__nav--desktop" id="app-navigation" aria-label={strings.ui.primaryNavigation}>
              {primaryNavItems.map((item) => (
                <button
                  key={item.route}
                  className={[
                    'app-shell__nav-link',
                    item.route === currentRoute ? 'app-shell__nav-link--active' : '',
                    language === 'ms' ? 'app-shell__nav-link--ms' : '',
                    item.route === appRoutes.detection && language === 'en'
                      ? 'app-shell__nav-link--scam-checker'
                      : '',
                    item.route === appRoutes.simulation && language === 'en'
                      ? 'app-shell__nav-link--ai-scam-chat'
                      : '',
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
                <nav className="app-shell__menu-panel" id="app-navigation" aria-label={strings.ui.primaryNavigation}>
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
              <div className="app-shell__lang-switch" ref={langMenuRef}>
                <button
                  type="button"
                  className="app-shell__lang-button"
                  aria-label={strings.ui.language}
                  aria-haspopup="menu"
                  aria-expanded={isLangMenuOpen}
                  onClick={() => setIsLangMenuOpen((open) => !open)}
                >
                  Language
                </button>
                {isLangMenuOpen ? (
                  <div className="app-shell__lang-menu" role="menu" aria-label={strings.ui.language}>
                    {[
                      {
                        value: 'en' as const,
                        label: language === 'ms' ? 'Inggeris' : language === 'zh' ? '英文' : 'English',
                      },
                      {
                        value: 'ms' as const,
                        label: language === 'ms' ? 'Melayu' : language === 'zh' ? '马来文' : 'Malay',
                      },
                      {
                        value: 'zh' as const,
                        label: language === 'ms' ? 'Cina' : language === 'zh' ? '中文' : 'Chinese',
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={language === item.value}
                        className={
                          language === item.value
                            ? 'app-shell__lang-option app-shell__lang-option--active'
                            : 'app-shell__lang-option'
                        }
                        onClick={() => {
                          setLanguage(item.value as Language)
                          setIsLangMenuOpen(false)
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>
        {isHome ? (
          <>
            <section
              key={heroAnimationCycle}
              className={enableHeroAnimations ? 'app-shell__hero app-shell__hero--animate' : 'app-shell__hero'}
              aria-label={strings.ui.heroIntroductionLabel}
            >
              <div className="app-shell__hero-bg" aria-hidden="true">
                <img src={homeHeroBackground} alt="" />
              </div>
              <div className="app-shell__hero-inner">
                <header className="app-shell__hero-header" aria-label={strings.ui.heroTaglineLabel}>
                  <h1
                    className={[
                      'app-shell__hero-title',
                      language === 'ms'
                        ? 'app-shell__hero-title--ms'
                        : language === 'zh'
                          ? 'app-shell__hero-title--zh'
                          : 'app-shell__hero-title--en',
                    ].join(' ')}
                    aria-label={titleTokensToText(strings.hero.titleTokens)}
                  >
                    <span className="sr-only">{titleTokensToText(strings.hero.titleTokens)}</span>
                    <span className="app-shell__hero-title-animated" aria-hidden="true">
                      {renderAnimatedTitle(strings.hero.titleTokens, enableHeroAnimations)}
                    </span>
                  </h1>
                </header>
                  <div className="app-shell__hero-body">
                    <div className="app-shell__hero-copy">
                      <p className="app-shell__hero-tagline">{strings.hero.subtitle}</p>
                      {strings.hero.keywords ? <p className="app-shell__hero-subtitle">{strings.hero.keywords}</p> : null}
                      <div className="app-shell__hero-video-button" aria-label={strings.ui.tutorialVideoLabel}>
                        <iframe
                          src="https://www.youtube.com/embed/SsRr9lfEkyc?si=jOoCa6DdoBcLHdLn&vq=hd1080"
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                </div>
            </section>
          </>
        ) : null}
        {isHome ? (
            <>
              <div className="app-shell__home-main" aria-label={strings.ui.homeMainLabel}>
                {children}

                <section className="app-shell__stats" aria-label={strings.ui.statsLabel}>
                  <header className="app-shell__stats-header">
                    <p className="app-shell__stats-eyebrow">{strings.homeStats.eyebrow}</p>
                    <h2 className="app-shell__stats-title">{strings.homeStats.title}</h2>
                  </header>

                  <div className="app-shell__stats-grid" role="list" aria-label={strings.ui.keyStatisticsLabel}>
                    <article className="app-shell__stats-card" role="listitem">
                      <div className="app-shell__stats-icon" aria-hidden="true">
                        <img src={seniorsIcon} alt="" />
                      </div>
                      <p className="app-shell__stats-label">{strings.homeStats.cards.seniorsAffected.label}</p>
                      <p className="app-shell__stats-value">{strings.homeStats.cards.seniorsAffected.value}</p>
                      <p className="app-shell__stats-hint">{strings.homeStats.cards.seniorsAffected.hint}</p>
                    </article>

                    <article className="app-shell__stats-card" role="listitem">
                      <div className="app-shell__stats-icon" aria-hidden="true">
                        <img src={lossesIcon} alt="" />
                      </div>
                      <p className="app-shell__stats-label">{strings.homeStats.cards.totalLosses.label}</p>
                      <p className="app-shell__stats-value">{strings.homeStats.cards.totalLosses.value}</p>
                      <p className="app-shell__stats-hint">{strings.homeStats.cards.totalLosses.hint}</p>
                    </article>

                    <article className="app-shell__stats-card" role="listitem">
                      <div className="app-shell__stats-icon" aria-hidden="true">
                        <img src={gdpIcon} alt="" />
                      </div>
                      <p className="app-shell__stats-label">{strings.homeStats.cards.gdpShare.label}</p>
                      <p className="app-shell__stats-value">{strings.homeStats.cards.gdpShare.value}</p>
                      <p className="app-shell__stats-hint">{strings.homeStats.cards.gdpShare.hint}</p>
                    </article>

                    <article className="app-shell__stats-card" role="listitem">
                      <div className="app-shell__stats-icon" aria-hidden="true">
                        <img src={exposureIcon} alt="" />
                      </div>
                      <p className="app-shell__stats-label">{strings.homeStats.cards.monthlyExposure.label}</p>
                      <p className="app-shell__stats-value">{strings.homeStats.cards.monthlyExposure.value}</p>
                      <p className="app-shell__stats-hint">{strings.homeStats.cards.monthlyExposure.hint}</p>
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
          <footer className="app-footer" aria-label={strings.ui.footerLabel}>
            <div className="app-footer__inner">
              <div className="app-footer__header">
                <h2 className="app-footer__title">{strings.footer.title}</h2>
              </div>
              <div className="app-footer__grid">
                <section className="app-footer__card" aria-label={strings.footer.sourcesTitle}>
                  <h3 className="app-footer__card-title">{strings.footer.sourcesTitle}</h3>
                  <p className="app-footer__card-text">{strings.footer.sourcesHint}</p>
                  <p className="app-footer__credit">
                    <span className="app-footer__credit-label">{strings.footer.imageCreditLabel}</span>{' '}
                    <a
                      className="app-footer__credit-link"
                      href="https://www.freepik.com/free-photo/elderly-senior-asian-male-freelancer-casual-clothes-typing-laptop-keyboard-while-talking-smartphone-standing-desk-busy-working-home-office_25117731.htm#fromView=search&page=1&position=2&uuid=ff5cca6a-b8fa-489a-ba36-8c4ab535e59c&query=Elderly+fraud+asian+technical"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {strings.footer.imageCreditText}
                    </a>
                  </p>
                </section>
                <section className="app-footer__card" aria-label={strings.footer.aboutTitle}>
                  <h3 className="app-footer__card-title">{strings.footer.aboutTitle}</h3>
                  <p className="app-footer__card-text">{strings.footer.aboutHint}</p>
                </section>
                <section className="app-footer__card" aria-label={strings.footer.riskTitle}>
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
