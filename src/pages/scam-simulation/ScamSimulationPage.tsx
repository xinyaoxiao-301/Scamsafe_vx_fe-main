import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import {
  SCENARIO_SLUGS,
  SCENARIO_LABELS,
  isGoodbye,
  getPerformance,
  recordPerformance,
  startSimulationSession,
  sendSimulationMessage,
  quitSimulationSession,
} from '@/services/scamSimulation'
import type { ScamScenarioType, SimulationMessage } from '@/types/scamSimulation'

type ScamSimulationPageProps = {
  onBackHome: () => void
}

export function ScamSimulationPage({ onBackHome }: ScamSimulationPageProps) {
  const { language, strings } = useI18n()
  const s = strings.scamSimulation

  const [scenarioType,  setScenarioType]  = useState<ScamScenarioType | null>(null)
  const [sessionId,     setSessionId]     = useState<string | null>(null)
  const [messages,      setMessages]      = useState<SimulationMessage[]>([])
  const [draft,         setDraft]         = useState('')
  const [isBotTyping,   setIsBotTyping]   = useState(false)
  const [isFinished,    setIsFinished]    = useState(false)
  const [aiFeedback,    setAiFeedback]    = useState<string | null>(null)
  const [lastOutcome,   setLastOutcome]   = useState<'safe' | 'risky' | null>(null)
  const [isListening,   setIsListening]   = useState(false)
  const [now,           setNow]           = useState(() => new Date())

  const listRef        = useRef<HTMLDivElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const performance = getPerformance()

  // English only — simulation is API-backed via Groq + RAG
  const isApiMode = language === 'en'

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isBotTyping])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const timeLocale = language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-Hans-MY' : 'en-MY'
  const timeLabel  = new Intl.DateTimeFormat(timeLocale, {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(now)

  // ── Voice input ─────────────────────────────────────────────────────────────
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null

    if (!SpeechRecognition) { window.alert(s.micUnsupported); return }

    if (recognitionRef.current) {
      recognitionRef.current.stop?.()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current  = recognition
    recognition.continuous      = false
    recognition.interimResults  = true
    recognition.lang            = language === 'zh' ? 'zh-CN' : language === 'ms' ? 'ms-MY' : 'en-MY'

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => { recognitionRef.current = null; setIsListening(false) }
    recognition.onerror  = () => { recognitionRef.current = null; setIsListening(false) }
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0]?.transcript ?? '')
        .join('')
        .trim()
      if (!transcript) return
      setDraft((current) => (current ? `${current} ${transcript}` : transcript))
    }
    recognition.start()
  }

  // ── Start scenario ──────────────────────────────────────────────────────────
  const startScenario = async (type: ScamScenarioType) => {
    setScenarioType(type)
    setIsFinished(false)
    setAiFeedback(null)
    setLastOutcome(null)
    setSessionId(null)
    setDraft('')
    setMessages([])
    setIsBotTyping(true)

    try {
      const result = await startSimulationSession(type)
      setSessionId(result.session_id)
      setMessages([{
        id:        `bot-0-${Date.now()}`,
        from:      'bot',
        text:      result.initial_message,
        timestamp: Date.now(),
      }])
    } catch {
      setMessages([{
        id:        `bot-err-${Date.now()}`,
        from:      'bot',
        text:      'Sorry, could not start the simulation. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsBotTyping(false)
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetScenario = () => {
    setScenarioType(null)
    setSessionId(null)
    setMessages([])
    setDraft('')
    setIsBotTyping(false)
    setIsFinished(false)
    setAiFeedback(null)
    setLastOutcome(null)
  }

  // ── Send message ────────────────────────────────────────────────────────────
  const sendUserMessage = async () => {
    if (!scenarioType || !sessionId || isBotTyping || isFinished) return
    const text = draft.trim()
    if (!text) return

    setDraft('')
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, from: 'user', text, timestamp: Date.now() },
    ])

    // Goodbye → quit path (success)
    if (isGoodbye(text)) {
      setIsBotTyping(true)
      try {
        const result = await quitSimulationSession(sessionId)
        setAiFeedback(result.feedback)
        setLastOutcome('safe')
        recordPerformance(scenarioType, 'safe')
      } catch {
        setAiFeedback('Well done! You ended the conversation safely.')
        setLastOutcome('safe')
        recordPerformance(scenarioType, 'safe')
      } finally {
        setIsFinished(true)
        setIsBotTyping(false)
      }
      return
    }

    // Normal message path
    setIsBotTyping(true)
    try {
      const result = await sendSimulationMessage(sessionId, text)

      if (result.fell_for_scam) {
        setAiFeedback(result.feedback)
        setLastOutcome('risky')
        recordPerformance(scenarioType, 'risky')
        setIsFinished(true)
      } else {
        setMessages((current) => [
          ...current,
          {
            id:        `bot-${Date.now()}`,
            from:      'bot',
            text:      result.bot_reply,
            timestamp: Date.now(),
          },
        ])
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id:        `bot-err-${Date.now()}`,
          from:      'bot',
          text:      'Something went wrong. Please try again.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsBotTyping(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="scam-simulation-page" aria-label={s.pageLabel}>
      <header className="scam-simulation-page__header">
        <p className="scam-simulation-page__eyebrow">{s.eyebrow}</p>
        <h1 className="scam-simulation-page__title">{s.title}</h1>
        <p className="scam-simulation-page__lede">{s.lede}</p>
      </header>

      <section className="scam-simulation-page__grid" aria-label={s.workspaceLabel}>

        {/* ── Scenario picker ─────────────────────────────────────────── */}
        <SectionCard
          className="scam-simulation-page__card"
          eyebrow={s.step1Eyebrow}
          title={s.step1Title}
          description={s.step1Description}
        >
          {!isApiMode ? (
            <p className="scam-simulation-page__unavailable">{s.scenarioUnavailable}</p>
          ) : (
            <div className="scam-simulation-page__types" role="list">
              {SCENARIO_SLUGS.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  className={
                    scenarioType === slug
                      ? 'scam-simulation-page__type scam-simulation-page__type--active'
                      : 'scam-simulation-page__type'
                  }
                  onClick={() => startScenario(slug)}
                  aria-label={s.startScenario(SCENARIO_LABELS[slug])}
                  disabled={isBotTyping}
                >
                  <p className="scam-simulation-page__type-title">{SCENARIO_LABELS[slug]}</p>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Chat phone UI ───────────────────────────────────────────── */}
        <SectionCard
          className="scam-simulation-page__card"
          eyebrow={s.step2Eyebrow}
          title={s.step2Title}
          description={s.step2Description}
          footer={
            <div className="scam-simulation-page__footer-actions">
              <Button variant="secondary" onClick={resetScenario} disabled={!scenarioType}>
                {s.reset}
              </Button>
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          <div className="scam-simulation-page__chat">
            <div className="scam-simulation-page__phone" aria-label={s.messagesLabel}>
              <header className="scam-simulation-page__phone-header">
                <div className="scam-simulation-page__phone-left" aria-hidden="true">
                  <div className="scam-simulation-page__bot-avatar">
                    <span className="scam-simulation-page__bot-face">AI</span>
                  </div>
                  <p className="scam-simulation-page__phone-title">
                    {scenarioType ? SCENARIO_LABELS[scenarioType] : s.phoneDefaultTitle}
                  </p>
                </div>
                <p className="scam-simulation-page__phone-time" aria-label={timeLabel}>
                  {timeLabel}
                </p>
              </header>

              <div className="scam-simulation-page__messages" ref={listRef} aria-label={s.messagesLabel}>
                {scenarioType ? (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={
                          message.from === 'user'
                            ? 'scam-simulation-page__msg scam-simulation-page__msg--user'
                            : 'scam-simulation-page__msg'
                        }
                      >
                        <div
                          className={
                            message.from === 'user'
                              ? 'scam-simulation-page__bubble scam-simulation-page__bubble--user'
                              : 'scam-simulation-page__bubble scam-simulation-page__bubble--bot'
                          }
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isBotTyping && (
                      <div className="scam-simulation-page__msg">
                        <div className="scam-simulation-page__bubble scam-simulation-page__bubble--bot">
                          <span className="scam-simulation-page__typing" aria-label={s.typingLabel}>
                            <span /><span /><span />
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="scam-simulation-page__empty">
                    <p>{s.emptyState}</p>
                  </div>
                )}
              </div>

              <div className="scam-simulation-page__composer" aria-label={s.composerLabel}>
                <input
                  className="scam-simulation-page__input"
                  type="text"
                  inputMode="text"
                  placeholder={scenarioType ? s.inputPlaceholderActive : s.inputPlaceholderInactive}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={!scenarioType || !sessionId || isBotTyping || isFinished}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendUserMessage() }}
                />
                <button
                  type="button"
                  className={
                    isListening
                      ? 'scam-simulation-page__icon-button scam-simulation-page__icon-button--mic scam-simulation-page__icon-button--active'
                      : 'scam-simulation-page__icon-button scam-simulation-page__icon-button--mic'
                  }
                  onClick={handleVoiceInput}
                  aria-label={s.mic}
                  disabled={!scenarioType || !sessionId || isBotTyping || isFinished}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 14.5c1.7 0 3-1.3 3-3V6.5c0-1.7-1.3-3-3-3s-3 1.3-3 3v5c0 1.7 1.3 3 3 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 11.5c0 3.9-3.1 7-7 7s-7-3.1-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 18.5v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="scam-simulation-page__icon-button scam-simulation-page__icon-button--send"
                  onClick={sendUserMessage}
                  aria-label={s.send}
                  disabled={!scenarioType || !sessionId || isBotTyping || isFinished}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.5 11.7 20.5 3.5 12.3 20.5l-1.7-6.1-7.1-2.7Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* AI feedback */}
          {aiFeedback && (
            <div className="scam-simulation-page__feedback" aria-label={s.feedbackLabel}>
              <div
                className={
                  lastOutcome === 'risky'
                    ? 'scam-simulation-page__feedback-banner scam-simulation-page__feedback-banner--risky'
                    : 'scam-simulation-page__feedback-banner'
                }
              >
                <p className="scam-simulation-page__feedback-title">
                  {lastOutcome === 'risky'
                    ? 'You fell for the scam — here is what happened'
                    : 'Well done — you avoided the scam!'}
                </p>
              </div>
              <div className="scam-simulation-page__ai-feedback">
                {aiFeedback.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </section>

      {/* ── Performance summary ─────────────────────────────────────────── */}
      <section className="scam-simulation-page__performance" aria-label={s.performanceLabel}>
        <SectionCard
          className="scam-simulation-page__performance-card"
          eyebrow={s.progressEyebrow}
          title={s.progressTitle}
          description={s.progressDescription}
        >
          <div className="scam-simulation-page__perf-grid">
            {performance.map((row) => (
              <div className="scam-simulation-page__perf" key={row.type}>
                <p className="scam-simulation-page__perf-title">{row.label}</p>
                <p className="scam-simulation-page__perf-meta">
                  {strings.common.completed}: <strong>{row.completed}</strong> · {strings.common.safe}:{' '}
                  <strong>{row.safe}</strong> · {strings.common.risky}: <strong>{row.risky}</strong>
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </main>
  )
}
