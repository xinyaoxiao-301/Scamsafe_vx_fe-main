import { useEffect, useState } from 'react'
import type { CSSProperties, PropsWithChildren } from 'react'
import { primaryNavItems, type AppRoute, appRoutes } from '@/app/routes'
import { InfoPill } from '@/components/ui/InfoPill'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { useI18n, type Language } from '@/lib/i18n'
import logo from '@/assets/scamsafe-logo.png'

type AppShellProps = PropsWithChildren<{
  currentRoute: AppRoute
  onNavigate: (route: AppRoute) => void
}>

type HeroTitleToken = {
  id: string
  tone: 'plain' | 'highlight'
  text: string
  spaceAfter: boolean
}

function renderAnimatedTitle(tokens: HeroTitleToken[]) {
  let globalIndex = 0

  return tokens.flatMap((token) => {
    const letters = token.text.split('').map((char, letterIndex) => {
      const style = { ['--i' as const]: globalIndex++ } as CSSProperties
      const className =
        token.tone === 'highlight'
          ? 'app-shell__hero-title-letter app-shell__hero-title-letter--highlight'
          : 'app-shell__hero-title-letter'

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
  return tokens.map((token) => token.text + (token.spaceAfter ? ' ' : '')).join('').trim()
}

export function AppShell({ children, currentRoute, onNavigate }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const isHome = currentRoute === appRoutes.home
  const { language, setLanguage, strings } = useI18n()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentRoute])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsMobile(mediaQuery.matches)

    handleChange()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

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
      <div className="app-shell__frame">
        <header className="app-shell__brand" aria-label="ScamSafe brand">
          <div className="app-shell__brand-copy">
            <button className="app-shell__brand-home" type="button" onClick={() => onNavigate(appRoutes.home)}>
              <img className="app-shell__brand-logo" src={logo} alt="ScamSafe logo" />
              <span className="app-shell__brand-mark">ScamSafe</span>
            </button>
          </div>
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
        </header>
        {isHome ? (
          <section className="app-shell__hero" aria-label="ScamSafe hero introduction">
            <header className="app-shell__hero-header" aria-label="ScamSafe tagline">
              <h1 className="app-shell__hero-title" aria-label={titleTokensToText(strings.hero.titleTokens)}>
                <span className="sr-only">{titleTokensToText(strings.hero.titleTokens)}</span>
                <span className="app-shell__hero-title-animated" aria-hidden="true">
                  {renderAnimatedTitle(strings.hero.titleTokens)}
                </span>
              </h1>
            </header>
            <div className="app-shell__hero-body">
              <div className="app-shell__hero-copy">
                <p className="app-shell__hero-subtitle">
                  {strings.hero.subtitle}
                </p>
                <div className="app-shell__hero-pills" aria-label="Product highlights">
                  <InfoPill tone="accent" label={strings.hero.pills.detection} />
                  <InfoPill label={strings.hero.pills.chat} />
                  <InfoPill label={strings.hero.pills.senior} />
                  <InfoPill label={strings.hero.pills.steps} />
                </div>
                <div className="app-shell__hero-mini-grid" aria-label="Core modules">
                  <div className="app-shell__hero-mini">
                    <div className="app-shell__hero-mini-icon">
                      <FeatureIcon name="detection" />
                    </div>
                    <div className="app-shell__hero-mini-copy">
                      <p className="app-shell__hero-mini-title">{strings.hero.modules.detectionTitle}</p>
                      <p className="app-shell__hero-mini-subtitle">{strings.hero.modules.detectionSubtitle}</p>
                    </div>
                  </div>
                  <div className="app-shell__hero-mini">
                    <div className="app-shell__hero-mini-icon">
                      <FeatureIcon name="simulation" />
                    </div>
                    <div className="app-shell__hero-mini-copy">
                      <p className="app-shell__hero-mini-title">{strings.hero.modules.practiceTitle}</p>
                      <p className="app-shell__hero-mini-subtitle">{strings.hero.modules.practiceSubtitle}</p>
                    </div>
                  </div>
                  <div className="app-shell__hero-mini">
                    <div className="app-shell__hero-mini-icon">
                      <FeatureIcon name="support" />
                    </div>
                    <div className="app-shell__hero-mini-copy">
                      <p className="app-shell__hero-mini-title">{strings.hero.modules.supportTitle}</p>
                      <p className="app-shell__hero-mini-subtitle">{strings.hero.modules.supportSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="app-shell__hero-media" aria-label="ScamSafe tutorial video">
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
              </div>
            </div>
          </section>
        ) : null}
        {children}
        <footer className="app-footer" aria-label="Footer">
          <div className="app-footer__header">
            <h2 className="app-footer__title">{strings.footer.title}</h2>
          </div>
          <div className="app-footer__grid">
            <section className="app-footer__card" aria-label="Data sources">
              <h3 className="app-footer__card-title">{strings.footer.sourcesTitle}</h3>
              <p className="app-footer__card-text">{strings.footer.sourcesHint}</p>
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
        </footer>
      </div>
    </div>
  )
}
