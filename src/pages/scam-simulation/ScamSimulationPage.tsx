// ScamSimulationPage drives the guided chat practice experience. It coordinates
// scenario picking, message flow, scoring, and post-chat feedback display.
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n, type Language } from '@/lib/i18n'
import {
  API_SCENARIO_SLUGS,
  type ApiScenarioType,
  isGoodbye,
  getPerformance,
  getScenarioDescriptions,
  getScenarioLabels,
  recordPerformance,
  startSimulationSession,
  sendSimulationMessage,
  quitSimulationSession,
} from '@/services/scamSimulation'
import type { ScamScenarioType, SimulationMessage } from '@/types/scamSimulationTypes'

type ScamSimulationPageProps = {
  onBackHome: () => void
}

type SpeechRecognitionResultLike = {
  0?: { transcript?: string }
  isFinal?: boolean
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionLike = {
  start: () => void
  stop?: () => void
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  onstart: null | (() => void)
  onend: null | (() => void)
  onerror: null | (() => void)
  onresult: null | ((event: SpeechRecognitionEventLike) => void)
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionLanguage(language: Language) {
  const fallbackLocale = language === 'zh' ? 'zh-CN' : language === 'ms' ? 'ms-MY' : 'en-MY'
  if (typeof navigator === 'undefined') return fallbackLocale

  const browserLocales = Array.from(
    new Set([navigator.language, ...(navigator.languages ?? [])].filter(Boolean)),
  )

  const localeMatcher =
    language === 'zh'
      ? (locale: string) => /^zh(?:-|$)/i.test(locale)
      : language === 'ms'
        ? (locale: string) => /^ms(?:-|$)/i.test(locale)
        : (locale: string) => /^en(?:-|$)/i.test(locale)

  return browserLocales.find(localeMatcher) ?? fallbackLocale
}

function normalizeWordForSpeechComparison(word: string) {
  const normalized = word
    .toLowerCase()
    .replace(/(^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$)/gu, '')

  return normalized || word.toLowerCase()
}

function collapseRepeatedWords(transcript: string) {
  const words = transcript.split(' ').filter(Boolean)
  const deduped: string[] = []

  for (const word of words) {
    const previousWord = deduped[deduped.length - 1]
    if (previousWord && normalizeWordForSpeechComparison(previousWord) === normalizeWordForSpeechComparison(word)) {
      continue
    }

    deduped.push(word)
  }

  return deduped.join(' ')
}

function normalizeSpeechTranscript(transcript: string, language: Language) {
  const compactTranscript =
    language === 'zh'
      ? transcript.replace(/\s+/g, '').trim()
      : transcript.replace(/\s+/g, ' ').trim()

  if (!compactTranscript) return ''

  return language === 'zh' ? compactTranscript : collapseRepeatedWords(compactTranscript)
}

function mergeSpeechTranscript(baseDraft: string, transcript: string, language: Language) {
  const normalizedBase =
    language === 'zh'
      ? baseDraft.trim()
      : baseDraft.replace(/\s+/g, ' ').trim()

  if (!normalizedBase) return transcript

  if (language === 'zh') {
    let overlapSize = 0

    for (let size = Math.min(normalizedBase.length, transcript.length); size > 0; size -= 1) {
      if (normalizedBase.slice(-size) === transcript.slice(0, size)) {
        overlapSize = size
        break
      }
    }

    return `${normalizedBase}${transcript.slice(overlapSize)}`
  }

  const baseWords = normalizedBase.split(' ')
  const transcriptWords = transcript.split(' ')
  let overlapSize = 0

  for (let size = Math.min(baseWords.length, transcriptWords.length); size > 0; size -= 1) {
    const baseTail = baseWords.slice(-size).map(normalizeWordForSpeechComparison)
    const transcriptHead = transcriptWords.slice(0, size).map(normalizeWordForSpeechComparison)

    if (baseTail.join(' ') === transcriptHead.join(' ')) {
      overlapSize = size
      break
    }
  }

  return [...baseWords, ...transcriptWords.slice(overlapSize)].join(' ').trim()
}

export function ScamSimulationPage({ onBackHome }: ScamSimulationPageProps) {
  const { language, strings } = useI18n()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const s = strings.scamSimulation
  const specificScenarioToggleLabel = s.showSpecificScenarios
  const hideSpecificScenarioToggleLabel = s.hideSpecificScenarios
  const scenarioLabels = getScenarioLabels(language)
  const scenarioDescriptions = getScenarioDescriptions(language)

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
  const [showSpecificScenarios, setShowSpecificScenarios] = useState(false)
  const [isCategoryBreakdownOpen, setIsCategoryBreakdownOpen] = useState(false)
  const [isChatPopping, setIsChatPopping] = useState(false)

  const listRef        = useRef<HTMLDivElement | null>(null)
  const feedbackRef    = useRef<HTMLElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const speechDraftBeforeListenRef = useRef('')
  const lastSpeechTranscriptRef = useRef('')
  const inputRef       = useRef<HTMLInputElement | null>(null)
  const chatCardRef    = useRef<HTMLDivElement | null>(null)

  const performance = getPerformance(language)
  // Mixed practice acts as the summary card while per-category results stay in
  // the collapsible breakdown below to keep the mobile view compact first.
  const featuredPerformance = performance.find((row) => row.type === 'mixed-scams') ?? performance[0]
  const categoryPerformance = performance.filter((row) => row.type !== 'mixed-scams')

  // The backend returns a prose feedback report. Normalizing it here keeps the
  // display clean without requiring a stricter response shape from the API.
  const feedbackLines = aiFeedback
    ? aiFeedback
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.toLowerCase() !== "here's your feedback report:")
    : []

  // All three languages are now supported end-to-end via the backend.
  const isApiMode = true

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isBotTyping])

  useEffect(() => {
    if (!aiFeedback) return
    window.setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [aiFeedback])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!scenarioType || !sessionId || isFinished || isListening) return
    focusComposerInput()
  }, [scenarioType, sessionId, isBotTyping, isFinished, isListening])

  useEffect(() => {
    if (scenarioType && scenarioType !== 'mixed-scams') {
      setShowSpecificScenarios(true)
    }
  }, [scenarioType])

  const timeLocale = language === 'ms' ? 'ms-MY' : language === 'zh' ? 'zh-Hans-MY' : 'en-MY'
  const timeLabel  = new Intl.DateTimeFormat(timeLocale, {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(now)

  const focusComposerInput = () => {
    const input = inputRef.current
    if (!input) return

    input.focus()
    const valueLength = input.value.length
    input.setSelectionRange?.(valueLength, valueLength)
  }

  const clearSpeechRecognitionState = () => {
    speechDraftBeforeListenRef.current = ''
    lastSpeechTranscriptRef.current = ''
    recognitionRef.current = null
    setIsListening(false)
  }

  const stopSpeechRecognition = () => {
    const recognition = recognitionRef.current

    if (recognition) {
      recognition.onstart = null
      recognition.onend = null
      recognition.onerror = null
      recognition.onresult = null
      recognition.stop?.()
    }

    clearSpeechRecognitionState()
  }

  const scrollElementToViewportCenter = (element: HTMLElement | null) => {
    if (!element) return

    const rect = element.getBoundingClientRect()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetTop = isMobile
      ? window.scrollY + rect.top - 16
      : window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const renderPerformanceRow = (row: (typeof performance)[number], className?: string) => (
    <div className={className ? `scam-simulation-page__perf ${className}` : 'scam-simulation-page__perf'} key={row.type}>
      <p className="scam-simulation-page__perf-title">{row.label}</p>
      <p className="scam-simulation-page__perf-meta">
        {strings.common.completed}: <strong>{row.completed}</strong> · {strings.common.safe}:{' '}
        <strong>{row.safe}</strong> · {strings.common.risky}: <strong>{row.risky}</strong>
      </p>
    </div>
  )

  // ── Voice input ─────────────────────────────────────────────────────────────
  const handleVoiceInput = () => {
    // Browser speech recognition is optional and vendor-prefixed in Chromium,
    // so the UI treats it as a progressive enhancement.
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const SpeechRecognitionCtor = SpeechRecognition ?? webkitSpeechRecognition ?? null

    if (!SpeechRecognitionCtor) { window.alert(s.micUnsupported); return }

    if (recognitionRef.current) {
      stopSpeechRecognition()
      if (isMobile) {
        window.requestAnimationFrame(() => focusComposerInput())
      }
      return
    }

    const recognition = new SpeechRecognitionCtor()
    speechDraftBeforeListenRef.current = draft
    lastSpeechTranscriptRef.current = ''
    recognitionRef.current  = recognition
    recognition.continuous      = false
    recognition.interimResults  = false
    recognition.lang            = getSpeechRecognitionLanguage(language)
    recognition.maxAlternatives = 1

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => {
      clearSpeechRecognitionState()
      if (isMobile && scenarioType && sessionId && !isFinished) {
        window.requestAnimationFrame(() => focusComposerInput())
      }
    }
    recognition.onerror  = () => {
      clearSpeechRecognitionState()
      if (isMobile && scenarioType && sessionId && !isFinished) {
        window.requestAnimationFrame(() => focusComposerInput())
      }
    }
    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1]
      if (latestResult && latestResult.isFinal === false) return

      const transcript = normalizeSpeechTranscript(latestResult?.[0]?.transcript ?? '', language)
      if (!transcript) return
      if (transcript === lastSpeechTranscriptRef.current) return

      lastSpeechTranscriptRef.current = transcript
      setDraft(mergeSpeechTranscript(speechDraftBeforeListenRef.current, transcript, language))
    }
    recognition.start()
  }

  // ── Start scenario ──────────────────────────────────────────────────────────
  const startScenario = async (type: ScamScenarioType) => {
    const chosenApiType: ApiScenarioType =
      type === 'mixed-scams'
        ? API_SCENARIO_SLUGS[Math.floor(Math.random() * API_SCENARIO_SLUGS.length)]
        : type

    setScenarioType(type)
    setIsFinished(false)
    setAiFeedback(null)
    setLastOutcome(null)
    setSessionId(null)
    setDraft('')
    setMessages([])
    setIsBotTyping(true)
    setIsChatPopping(false)

    window.requestAnimationFrame(() => {
      scrollElementToViewportCenter(chatCardRef.current)

      if (!isMobile) {
        window.setTimeout(() => setIsChatPopping(true), 120)
      }
    })

    try {
      // The first bot message is generated by the backend so each scenario starts
      // from the same session state that later messages use.
      const result = await startSimulationSession(chosenApiType, language)
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
    stopSpeechRecognition()
    setScenarioType(null)
    setSessionId(null)
    setMessages([])
    setDraft('')
    setIsBotTyping(false)
    setIsFinished(false)
    setAiFeedback(null)
    setLastOutcome(null)
    setIsChatPopping(false)
  }

  useEffect(() => {
    return () => {
      stopSpeechRecognition()

      if (!sessionId) return

      void quitSimulationSession(sessionId).catch(() => {
        // Best-effort cleanup only; the next mount will start a fresh localized session.
      })
    }
  }, [sessionId])

  useEffect(() => {
    if (!isChatPopping) return

    const timeoutId = window.setTimeout(() => {
      setIsChatPopping(false)
    }, 620)

    return () => window.clearTimeout(timeoutId)
  }, [isChatPopping])

  // ── Send message ────────────────────────────────────────────────────────────
  const sendUserMessage = async () => {
    if (!scenarioType || !sessionId || isBotTyping || isFinished) return
    const text = draft.trim()
    if (!text) return

    stopSpeechRecognition()
    setDraft('')
    if (isMobile) {
      focusComposerInput()
    }
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
        setAiFeedback(s.safeQuitFeedback)
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

      // The backend is the source of truth for whether the learner stayed safe,
      // fell for the scam, or simply continues the conversation.
      if (result.fell_for_scam) {
        setAiFeedback(result.feedback)
        setLastOutcome('risky')
        recordPerformance(scenarioType, 'risky')
        setIsFinished(true)
      } else if (result.session_ended) {
        setAiFeedback(result.feedback)
        setLastOutcome('safe')
        recordPerformance(scenarioType, 'safe')
        setIsFinished(true)
      } else if (result.bot_reply) {
        setMessages((current) => [
          ...current,
          {
            id:        `bot-${Date.now()}`,
            from:      'bot',
            text:      result.bot_reply ?? '',
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
        <h1 className="scam-simulation-page__title">{s.title}</h1>
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
            <div className="scam-simulation-page__picker-stack">
              <div className="scam-simulation-page__types scam-simulation-page__types--primary" role="list">
                {(() => {
                  const slug: ScamScenarioType = 'mixed-scams'
                  const tooltipId = `sim-scenario-tip-${slug}`
                  return (
                    <button
                      key={slug}
                      type="button"
                      className={
                        [
                          'scam-simulation-page__type',
                          scenarioType === slug ? 'scam-simulation-page__type--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')
                      }
                      onClick={() => startScenario(slug)}
                      aria-label={s.startScenario(scenarioLabels[slug])}
                      aria-describedby={tooltipId}
                      disabled={isBotTyping}
                    >
                      <p className="scam-simulation-page__type-title">{scenarioLabels[slug]}</p>
                      <span id={tooltipId} className="scam-simulation-page__type-tooltip" role="tooltip">
                        {scenarioDescriptions[slug]}
                      </span>
                    </button>
                  )
                })()}
              </div>

              <div className="scam-simulation-page__specific-picker">
                <button
                  type="button"
                  className={
                    [
                      'scam-simulation-page__specific-toggle',
                      showSpecificScenarios ? 'scam-simulation-page__specific-toggle--open' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                  aria-expanded={showSpecificScenarios}
                  aria-controls="sim-specific-scenarios"
                  onClick={() => setShowSpecificScenarios((value) => !value)}
                >
                  <span>
                    {showSpecificScenarios ? hideSpecificScenarioToggleLabel : specificScenarioToggleLabel}
                  </span>
                  <span className="scam-simulation-page__specific-toggle-icon" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {showSpecificScenarios ? (
                  <div
                    id="sim-specific-scenarios"
                    className="scam-simulation-page__types scam-simulation-page__types--specific"
                    role="list"
                    aria-label={specificScenarioToggleLabel}
                  >
                    {API_SCENARIO_SLUGS.map((slug) => {
                      const tooltipId = `sim-scenario-tip-${slug}`
                      return (
                        <button
                          key={slug}
                          type="button"
                          className={
                            [
                              'scam-simulation-page__type',
                              scenarioType === slug ? 'scam-simulation-page__type--active' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')
                          }
                          onClick={() => startScenario(slug)}
                          aria-label={s.startScenario(scenarioLabels[slug])}
                          aria-describedby={tooltipId}
                          disabled={isBotTyping}
                        >
                          <p className="scam-simulation-page__type-title">{scenarioLabels[slug]}</p>
                          <span id={tooltipId} className="scam-simulation-page__type-tooltip" role="tooltip">
                            {scenarioDescriptions[slug]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Chat phone UI ───────────────────────────────────────────── */}
        <SectionCard
          className={
            [
              'scam-simulation-page__card',
              'scam-simulation-page__card--chat',
              showSpecificScenarios ? 'scam-simulation-page__card--chat-condensed' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
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
          <div className="scam-simulation-page__chat" ref={chatCardRef}>
              <div
                className={
                  isChatPopping
                    ? 'scam-simulation-page__phone scam-simulation-page__phone--pop'
                    : 'scam-simulation-page__phone'
                }
                aria-label={s.messagesLabel}
              >
                <header className="scam-simulation-page__phone-header">
                  <div className="scam-simulation-page__phone-left" aria-hidden="true">
                    <div className="scam-simulation-page__bot-avatar">
                      <svg className="scam-simulation-page__bot-icon" viewBox="0 0 48 48">
                        <path d="M24 8v5" />
                        <path d="M14 18a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v9a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6v-9Z" />
                        <circle cx="20" cy="22" r="1.8" />
                        <circle cx="28" cy="22" r="1.8" />
                        <path d="M19.2 28c1.4 1.2 3 1.8 4.8 1.8 1.8 0 3.4-.6 4.8-1.8" />
                        <path d="M14 21h-3" />
                        <path d="M37 21h-3" />
                      </svg>
                    </div>
                    <p className="scam-simulation-page__phone-title">
                      {scenarioType ? scenarioLabels[scenarioType] : s.phoneDefaultTitle}
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
                              : 'scam-simulation-page__msg scam-simulation-page__msg--bot'
                          }
                        >
                          {message.from === 'bot' ? (
                            <span className="scam-simulation-page__msg-avatar" aria-hidden="true">
                              <svg className="scam-simulation-page__msg-bot-icon" viewBox="0 0 48 48">
                                <path d="M24 8v5" />
                                <path d="M14 18a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v9a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6v-9Z" />
                                <circle cx="20" cy="22" r="1.8" />
                                <circle cx="28" cy="22" r="1.8" />
                                <path d="M19.2 28c1.4 1.2 3 1.8 4.8 1.8 1.8 0 3.4-.6 4.8-1.8" />
                                <path d="M14 21h-3" />
                                <path d="M37 21h-3" />
                              </svg>
                            </span>
                          ) : null}
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
                        <div className="scam-simulation-page__msg scam-simulation-page__msg--bot">
                          <span className="scam-simulation-page__msg-avatar" aria-hidden="true">
                            <svg className="scam-simulation-page__msg-bot-icon" viewBox="0 0 48 48">
                              <path d="M24 8v5" />
                              <path d="M14 18a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v9a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6v-9Z" />
                              <circle cx="20" cy="22" r="1.8" />
                              <circle cx="28" cy="22" r="1.8" />
                              <path d="M19.2 28c1.4 1.2 3 1.8 4.8 1.8 1.8 0 3.4-.6 4.8-1.8" />
                              <path d="M14 21h-3" />
                              <path d="M37 21h-3" />
                            </svg>
                          </span>
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
                      <div className="scam-simulation-page__empty-avatar" aria-hidden="true">
                        <svg className="scam-simulation-page__empty-bot-icon" viewBox="0 0 64 64">
                          <path d="M32 11v8" />
                          <path d="M18 24a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V24Z" />
                          <circle cx="27" cy="29.5" r="2.6" />
                          <circle cx="37" cy="29.5" r="2.6" />
                          <path d="M26 37c1.8 1.6 3.8 2.4 6 2.4 2.2 0 4.2-.8 6-2.4" />
                          <path d="M18 28h-5" />
                          <path d="M51 28h-5" />
                        </svg>
                      </div>
                      <p>{s.emptyState}</p>
                    </div>
                  )}
                </div>

                <div className="scam-simulation-page__composer" aria-label={s.composerLabel}>
                  <input
                    ref={inputRef}
                    className="scam-simulation-page__input"
                    type="text"
                    inputMode="text"
                    placeholder={scenarioType ? s.inputPlaceholderActive : s.inputPlaceholderInactive}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!scenarioType || !sessionId || isFinished}
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
        </SectionCard>
      </section>

      {/* Feedback report (shared under Step 1 + Step 2) */}
      {aiFeedback && (
        <section
          className="scam-simulation-page__feedback"
          aria-label={s.feedbackLabel}
          ref={(node) => { feedbackRef.current = node }}
        >
          <div
            className={
              lastOutcome === 'risky'
                ? 'scam-simulation-page__feedback-banner scam-simulation-page__feedback-banner--risky'
                : 'scam-simulation-page__feedback-banner'
            }
          >
            <p
              className={
                lastOutcome === 'risky'
                  ? 'scam-simulation-page__feedback-title'
                  : 'scam-simulation-page__feedback-title scam-simulation-page__feedback-title--safe'
              }
            >
              {lastOutcome === 'risky'
                ? s.riskyOutcomeTitle
                : s.safeOutcomeTitle}
            </p>
          </div>

          <div className="scam-simulation-page__report-box">
            <p className="scam-simulation-page__report-heading">{s.reportHeading}</p>
            {feedbackLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {/* Keep the return action inside the report card so the feedback
                reads as one self-contained block on smaller screens. */}
            <div className="scam-simulation-page__report-actions">
              <Button
                variant="secondary"
                onClick={onBackHome}
              >
                {strings.common.backToHome}
              </Button>
              <Button
                variant="primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {s.returnToTop}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Performance summary ─────────────────────────────────────────── */}
      <section className="scam-simulation-page__performance" aria-label={s.performanceLabel}>
        <SectionCard
          className="scam-simulation-page__performance-card"
          eyebrow={s.progressEyebrow}
          title={s.progressTitle}
        >
          <div className="scam-simulation-page__perf-stack">
            {featuredPerformance ? renderPerformanceRow(featuredPerformance, 'scam-simulation-page__perf--featured') : null}

            <div className="scam-simulation-page__perf-breakdown">
              <button
                type="button"
                className="scam-simulation-page__perf-toggle"
                aria-expanded={isCategoryBreakdownOpen}
                aria-controls="simulation-category-breakdown"
                onClick={() => setIsCategoryBreakdownOpen((open) => !open)}
              >
                <span className="scam-simulation-page__perf-toggle-label">
                  {isCategoryBreakdownOpen ? s.progressHideCategories : s.progressShowCategories}
                </span>
                <span
                  className={
                    isCategoryBreakdownOpen
                      ? 'scam-simulation-page__perf-toggle-icon scam-simulation-page__perf-toggle-icon--open'
                      : 'scam-simulation-page__perf-toggle-icon'
                  }
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      d="m6.5 9.5 5.5 5 5.5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isCategoryBreakdownOpen ? (
                <div className="scam-simulation-page__perf-grid" id="simulation-category-breakdown">
                  {categoryPerformance.map((row) => renderPerformanceRow(row))}
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  )
}
