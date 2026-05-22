// StudyCenterPage presents bite-sized quizzes while tracking local progress,
// points, and category-based review state for repeat practice.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n } from '@/lib/i18n'
import {
  TOPIC_ORDER,
  buildSessionStats,
  fetchQuizQuestions,
  getSessions,
  getTopics,
  recordSession,
} from '@/services/studyCenterQuiz'
import type { QuizQuestion, QuizSessionRecord, QuizTopic } from '@/types/studyCenterQuiz'

type StudyCenterPageProps = {
  onBackHome: () => void
}

const DEFAULT_QUESTION_COUNT = 6

function splitExplanation(text: string): string[] {
  // Backend explanations may arrive as newline text or bullet text; normalize
  // both formats into a short list for the feedback panel.
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap((line) => line.split('•'))
    .map((line) => line.trim())
    .filter(Boolean)
  if (cleaned.length <= 1) return [text.trim()]
  return cleaned
}

export function StudyCenterPage({ onBackHome }: StudyCenterPageProps) {
  const { language, strings } = useI18n()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const specificTopicToggleLabel = strings.studyCenter.showSpecificTopics
  const hideSpecificTopicToggleLabel = strings.studyCenter.hideSpecificTopics
  const [showSpecificTopics, setShowSpecificTopics] = useState(false)
  const progressLockedNote = strings.studyCenter.progressLockedNote

  const [selectedTopic,   setSelectedTopic]   = useState<QuizTopic>('mixed')
  const [questionCount]                        = useState(DEFAULT_QUESTION_COUNT)
  const [quizQuestions,   setQuizQuestions]   = useState<QuizQuestion[] | null>(null)
  const [index,           setIndex]           = useState(0)
  const [selectedOptionId,setSelectedOptionId] = useState<string | null>(null)
  const [hasSubmitted,    setHasSubmitted]    = useState(false)
  const [isCorrect,       setIsCorrect]       = useState<boolean | null>(null)
  const [correctCount,    setCorrectCount]    = useState(0)
  const [sessionByTopic,  setSessionByTopic]  = useState<Record<string, { total: number; correct: number }>>({})
  const [error,           setError]           = useState<string | null>(null)
  const [isFinished,      setIsFinished]      = useState(false)
  const [isLoadingQuiz,   setIsLoadingQuiz]   = useState(false)
  const [isTopicBreakdownOpen, setIsTopicBreakdownOpen] = useState(false)
  const [isStep2Popping,  setIsStep2Popping]  = useState(false)

  const topics    = useMemo(() => getTopics(language), [language])
  const featuredTopic = topics.find((item) => item.topic === 'mixed') ?? topics[0]
  const specificTopics = topics.filter((item) => item.topic !== 'mixed')
  const [sessions, setSessions] = useState<QuizSessionRecord[]>(() => getSessions())
  const step1CardRef = useRef<HTMLDivElement | null>(null)
  const questionRef = useRef<HTMLParagraphElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement | null>(null)
  const pendingScrollTargetRef = useRef<'feedback' | 'question' | null>(null)
  const step2CardRef = useRef<HTMLDivElement | null>(null)

  const topicStats = useMemo(() => buildSessionStats(sessions), [sessions])
  // "Mix scams" mirrors the simulation page by acting as the featured summary,
  // while the specific quiz categories stay inside a collapsible breakdown.
  const featuredProgress = useMemo(() => ({
    label: featuredTopic.title,
    attempts: sessions.length,
    total: sessions.reduce((sum, session) => sum + session.totalQuestions, 0),
    correct: sessions.reduce((sum, session) => sum + session.correctCount, 0),
  }), [featuredTopic.title, sessions])
  const categoryProgress = useMemo(
    () =>
      TOPIC_ORDER.map((topic) => ({
        topic,
        label: topics.find((item) => item.topic === topic)?.title ?? topic,
        attempts: topicStats[topic]?.attempts ?? 0,
        total: topicStats[topic]?.total ?? 0,
        correct: topicStats[topic]?.correct ?? 0,
      })),
    [topicStats, topics],
  )
  // The breakdown is split into two columns only after expansion so the base
  // mobile layout can stay short and readable.
  const leftColumnProgress = categoryProgress.slice(0, 4)
  const rightColumnProgress = categoryProgress.slice(4)
  const current    = quizQuestions ? quizQuestions[index] : null

  const scrollElementToViewportCenter = (element: HTMLElement | null) => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetTop = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const scrollElementToViewportTop = (element: HTMLElement | null) => {
    if (!element) return

    const rect = element.getBoundingClientRect()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: Math.max(0, window.scrollY + rect.top),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  useEffect(() => {
    if (selectedTopic !== 'mixed') {
      setShowSpecificTopics(true)
    }
  }, [selectedTopic])

  useEffect(() => {
    if (pendingScrollTargetRef.current !== 'feedback' || !hasSubmitted) return
    let frame = 0
    let settleFrame = 0
    const timeoutId = window.setTimeout(() => {
      frame = window.requestAnimationFrame(() => {
        if (isMobile) {
          scrollElementToViewportTop(step2CardRef.current)
          settleFrame = window.requestAnimationFrame(() => {
            scrollElementToViewportTop(step2CardRef.current)
          })
        } else {
          scrollElementToViewportCenter(feedbackRef.current)
        }
        pendingScrollTargetRef.current = null
      })
    }, isMobile ? 180 : 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(settleFrame)
    }
  }, [hasSubmitted, isMobile])

  useEffect(() => {
    if (pendingScrollTargetRef.current !== 'question') return
    const frame = window.requestAnimationFrame(() => {
      scrollElementToViewportCenter(questionRef.current)
      pendingScrollTargetRef.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [index])

  // ── Quiz lifecycle ────────────────────────────────────────────────────────────
  const startQuiz = async (topicOverride?: QuizTopic) => {
    const topicToUse = topicOverride ?? selectedTopic
    if (topicToUse !== selectedTopic) {
      setSelectedTopic(topicToUse)
    }

    setError(null)
    setIsLoadingQuiz(true)
    setQuizQuestions(null)
    setIndex(0)
    setSelectedOptionId(null)
    setHasSubmitted(false)
    setIsCorrect(null)
    setCorrectCount(0)
    setSessionByTopic({})
    setIsFinished(false)
    setIsStep2Popping(false)

    window.requestAnimationFrame(() => {
      if (isMobile) {
        scrollElementToViewportTop(step2CardRef.current)
      } else {
        scrollElementToViewportCenter(step2CardRef.current)
      }
      window.setTimeout(() => setIsStep2Popping(true), 120)
    })

    try {
      const questions = await fetchQuizQuestions(topicToUse, questionCount, language)
      if (!questions || questions.length === 0) {
        setError(strings.studyCenter.errorNoQuestions)
        return
      }
      setQuizQuestions(questions)
    } catch {
      setError(strings.studyCenter.errorLoadQuestions)
    } finally {
      setIsLoadingQuiz(false)
    }
  }

  const reset = () => {
    pendingScrollTargetRef.current = null
    setQuizQuestions(null)
    setIndex(0)
    setSelectedOptionId(null)
    setHasSubmitted(false)
    setIsCorrect(null)
    setCorrectCount(0)
    setSessionByTopic({})
    setError(null)
    setIsFinished(false)
    setIsLoadingQuiz(false)
    setIsStep2Popping(false)

    // Restarting should always return the viewport to the Step 1 picker.
    window.requestAnimationFrame(() => {
      scrollElementToViewportTop(step1CardRef.current)
    })
  }

  useEffect(() => {
    if (!isStep2Popping) return

    const timeoutId = window.setTimeout(() => {
      setIsStep2Popping(false)
    }, 620)

    return () => window.clearTimeout(timeoutId)
  }, [isStep2Popping])

  const submitAnswer = () => {
    if (!current || hasSubmitted) return
    if (!selectedOptionId) {
      setError(strings.studyCenter.errorPickAnswer)
      return
    }

    setError(null)
    const correct = selectedOptionId === current.correctOptionId
    pendingScrollTargetRef.current = 'feedback'
    setHasSubmitted(true)
    setIsCorrect(correct)

    // Track per-topic results inside a mixed quiz so the progress breakdown can
    // still show category-level learning history.
    const topic = current.topic
    setSessionByTopic((previous) => {
      const row = previous[topic] ?? { total: 0, correct: 0 }
      return { ...previous, [topic]: { total: row.total + 1, correct: row.correct + (correct ? 1 : 0) } }
    })

    if (correct) setCorrectCount((value) => value + 1)
  }

  const next = () => {
    if (!quizQuestions) return
    if (index >= quizQuestions.length - 1) return
    pendingScrollTargetRef.current = 'question'
    setIndex((value) => value + 1)
    setSelectedOptionId(null)
    setHasSubmitted(false)
    setIsCorrect(null)
    setError(null)
  }

  const finish = () => {
    if (!quizQuestions) return
    const total        = quizQuestions.length
    const pointsEarned = correctCount * 10

    // Persist only the completed quiz summary; in-progress answers are kept in
    // component state and are discarded when the user restarts.
    const record: QuizSessionRecord = {
      id:             `sc-${Date.now()}`,
      topic:          selectedTopic,
      totalQuestions: total,
      correctCount,
      pointsEarned,
      completedAt:    Date.now(),
      byTopic:        sessionByTopic,
    }

    recordSession(record)
    setSessions(getSessions())
    setIsFinished(true)
  }

  // ── Derived feedback values ───────────────────────────────────────────────────
  const tips             = current && hasSubmitted ? current.explanation.tips : []
  const selectedExplanation = current && hasSubmitted && selectedOptionId
    ? current.choiceExplanations?.[selectedOptionId] ?? null
    : null
  const correctExplanation  = current && hasSubmitted
    ? current.choiceExplanations?.[current.correctOptionId] ?? null
    : null
  const hasBackendStyleExplanation = Boolean(selectedExplanation || correctExplanation)

  const reasons = current
    ? hasSubmitted
      ? isCorrect
        ? current.explanation.correctReasons
        : current.explanation.incorrectReasons
      : []
    : []

  // ── Footer for step 2 ─────────────────────────────────────────────────────────
  const step2Footer = quizQuestions ? (
    <div className="study-center-page__actions">
      <Button variant="secondary" onClick={reset}>
        {strings.studyCenter.restart}
      </Button>
      {isFinished ? null : index >= quizQuestions.length - 1 && hasSubmitted ? (
        <Button className="study-center-page__action-primary" onClick={finish}>
          {strings.studyCenter.finishQuiz}
        </Button>
      ) : hasSubmitted ? (
        <Button className="study-center-page__action-primary" onClick={next}>
          {strings.studyCenter.nextQuestion}
        </Button>
      ) : (
        <Button className="study-center-page__action-primary" onClick={submitAnswer}>
          {strings.studyCenter.submitAnswer}
        </Button>
      )}
    </div>
  ) : undefined

  const renderProgressRow = (
    row: { label: string; attempts: number; total: number; correct: number },
    className?: string,
  ) => (
    <div className={className ? `study-center-page__progress-item ${className}` : 'study-center-page__progress-item'}>
      <p className="study-center-page__progress-item-title">{row.label}</p>
      <p className="study-center-page__progress-item-meta">
        {strings.common.completed}: <strong>{row.attempts}</strong> · {strings.studyCenter.correct}:{' '}
        <strong>{row.correct}</strong> · {strings.studyCenter.questionCountLabel}: <strong>{row.total}</strong>
      </p>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main className="study-center-page" aria-label={strings.studyCenter.pageLabel}>
      <header className="study-center-page__header">
        <h1 className="study-center-page__title">{strings.studyCenter.title}</h1>
      </header>

      <section className="study-center-page__grid" aria-label={strings.studyCenter.pageLabel}>
        <div ref={step1CardRef}>
          <SectionCard
            className="study-center-page__card"
            eyebrow={strings.studyCenter.step1Eyebrow}
            title={strings.studyCenter.step1Title}
            description={strings.studyCenter.step1Description}
            footer={
              <div className="study-center-page__actions">
                <Button variant="secondary" onClick={onBackHome}>
                  {strings.common.backToHome}
                </Button>
                <Button
                  className="study-center-page__action-primary"
                  onClick={() => void startQuiz()}
                  disabled={isLoadingQuiz}
                >
                  {isLoadingQuiz ? strings.studyCenter.loadingLabel : strings.studyCenter.startQuiz}
                </Button>
              </div>
            }
          >
            <div className="study-center-page__picker-stack">
              <div className="study-center-page__topics study-center-page__topics--primary" role="list" aria-label={strings.studyCenter.chooseTopicLabel}>
                {featuredTopic ? (
                  <button
                    key={featuredTopic.topic}
                    type="button"
                    className={
                      [
                        'study-center-page__topic',
                        selectedTopic === featuredTopic.topic ? 'study-center-page__topic--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                    onClick={() => {
                      if (isMobile) {
                        void startQuiz(featuredTopic.topic)
                        return
                      }
                      setSelectedTopic(featuredTopic.topic)
                    }}
                    aria-label={featuredTopic.title}
                    aria-describedby={`sc-topic-tip-${featuredTopic.topic}`}
                  >
                    <p className="study-center-page__topic-title">{featuredTopic.title}</p>
                    <span
                      id={`sc-topic-tip-${featuredTopic.topic}`}
                      className="study-center-page__topic-tooltip"
                      role="tooltip"
                    >
                      {featuredTopic.description}
                    </span>
                  </button>
                ) : null}
              </div>

              <div className="study-center-page__specific-picker">
                <button
                  type="button"
                  className={
                    [
                      'study-center-page__specific-toggle',
                      showSpecificTopics ? 'study-center-page__specific-toggle--open' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                  aria-expanded={showSpecificTopics}
                  aria-controls="study-specific-topics"
                  onClick={() => setShowSpecificTopics((value) => !value)}
                >
                  <span>{showSpecificTopics ? hideSpecificTopicToggleLabel : specificTopicToggleLabel}</span>
                  <span className="study-center-page__specific-toggle-icon" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {showSpecificTopics ? (
                  <div
                    id="study-specific-topics"
                    className="study-center-page__topics study-center-page__topics--specific"
                    role="list"
                    aria-label={specificTopicToggleLabel}
                  >
                    {specificTopics.map((item) => {
                      const tooltipId = `sc-topic-tip-${item.topic}`
                      return (
                        <button
                          key={item.topic}
                          type="button"
                          className={
                            [
                              'study-center-page__topic',
                              selectedTopic === item.topic ? 'study-center-page__topic--active' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')
                          }
                          onClick={() => {
                            if (isMobile) {
                              setShowSpecificTopics(true)
                              void startQuiz(item.topic)
                              return
                            }
                            setSelectedTopic(item.topic)
                            setShowSpecificTopics(true)
                          }}
                          aria-label={item.title}
                          aria-describedby={tooltipId}
                        >
                          <p className="study-center-page__topic-title">{item.title}</p>
                          <span
                            id={tooltipId}
                            className="study-center-page__topic-tooltip"
                            role="tooltip"
                          >
                            {item.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </div>

        <div ref={step2CardRef}>
          <SectionCard
            className="study-center-page__card"
            eyebrow={strings.studyCenter.step2Eyebrow}
            title={strings.studyCenter.step2Title}
            description={strings.studyCenter.step2Description}
            footer={step2Footer}
          >
          <div
            className={
              isStep2Popping
                ? 'study-center-page__workspace study-center-page__workspace--pop'
                : 'study-center-page__workspace'
            }
          >
            {/* Loading state */}
            {isLoadingQuiz ? (
              <div className="study-center-page__loading" role="status" aria-live="polite">
                <div className="study-center-page__spinner" aria-hidden="true" />
                <p className="study-center-page__loading-label">{strings.studyCenter.loadingStateLabel}</p>
              </div>
            ) : quizQuestions && current ? (
              <>
              <div className="study-center-page__question-meta" aria-label={strings.studyCenter.questionProgressLabel}>
                <span>
                  {strings.studyCenter.questionCountLabel}: {index + 1}/{quizQuestions.length}
                </span>
                <span>
                  {strings.studyCenter.correct}: {correctCount}
                </span>
              </div>

              <p className="study-center-page__prompt" ref={questionRef}>{current.prompt}</p>

              <div className="study-center-page__options" role="list" aria-label={strings.studyCenter.answerOptionsLabel}>
                {current.options.map((opt, optIndex) => (
                  <button
                    type="button"
                    key={opt.id}
                    className={[
                      'study-center-page__option',
                      selectedOptionId === opt.id ? 'study-center-page__option--selected' : '',
                      hasSubmitted && opt.id === current.correctOptionId
                        ? 'study-center-page__option--correct'
                        : '',
                      hasSubmitted && !isCorrect && selectedOptionId === opt.id
                        ? 'study-center-page__option--wrong'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => { if (hasSubmitted) return; setSelectedOptionId(opt.id); setError(null) }}
                    aria-pressed={selectedOptionId === opt.id}
                    aria-label={
                      hasSubmitted && opt.id === current.correctOptionId
                        ? `${opt.text}. ${strings.studyCenter.correctAnswerLabel}`
                        : opt.text
                    }
                    disabled={hasSubmitted}
                  >
                    <div className="study-center-page__option-badge">{String.fromCharCode(65 + optIndex)}</div>
                    <div className="study-center-page__option-text">{opt.text}</div>
                  </button>
                ))}
              </div>

              {error ? (
                <p className="study-center-page__error" role="alert">{error}</p>
              ) : null}

              <div
                ref={feedbackRef}
                className={
                  hasSubmitted
                    ? 'study-center-page__feedback study-center-page__feedback--visible'
                    : 'study-center-page__feedback'
                }
                aria-label={strings.studyCenter.feedbackAriaLabel}
                aria-live="polite"
              >
                {hasSubmitted ? (
                  <>
                    <p className="sr-only">{isCorrect ? strings.studyCenter.correct : strings.studyCenter.incorrect}</p>

                    <div className="study-center-page__lists">
                      <div>
                        <h3 className="study-center-page__h3">{strings.studyCenter.explanationTitle}</h3>
                        {hasBackendStyleExplanation ? (
                          <div className="study-center-page__explain">
                            {selectedExplanation ? (
                              <div
                                className={[
                                  'study-center-page__explain-block',
                                  isCorrect
                                    ? 'study-center-page__explain-block--correct'
                                    : 'study-center-page__explain-block--wrong',
                                ].join(' ')}
                              >
                                <p className="study-center-page__explain-label">{strings.studyCenter.yourAnswerLabel}</p>
                                <ul className="study-center-page__list">
                                  {splitExplanation(selectedExplanation).slice(0, 3).map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {!isCorrect && correctExplanation ? (
                              <div className="study-center-page__explain-block study-center-page__explain-block--correct">
                                <p className="study-center-page__explain-label">{strings.studyCenter.correctAnswerLabel}</p>
                                <ul className="study-center-page__list">
                                  {splitExplanation(correctExplanation).slice(0, 3).map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <ul className="study-center-page__list">
                            {reasons.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        )}
                      </div>

                      {tips.length ? (
                        <div>
                          <h3 className="study-center-page__h3">{strings.studyCenter.tipsTitle}</h3>
                          <ul className="study-center-page__list">
                            {tips.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
              </>
            ) : (
              /* Empty / error state */
              error ? (
                <p className="study-center-page__error" role="alert">{error}</p>
              ) : null
            )}
          </div>
          </SectionCard>
        </div>
      </section>

      {!sessions.length ? (
        <p className="study-center-page__progress-note">{progressLockedNote}</p>
      ) : null}

      {sessions.length ? (
        <section className="study-center-page__progress" aria-label={strings.studyCenter.progressTitle}>
          <SectionCard
            className="study-center-page__progress-card"
            eyebrow={strings.studyCenter.progressEyebrow}
            title={strings.studyCenter.progressTitle}
          >
            <div className="study-center-page__progress-stack">
              {renderProgressRow(featuredProgress, 'study-center-page__progress-item--featured')}

              <div className="study-center-page__progress-breakdown">
                <button
                  type="button"
                  className="study-center-page__progress-toggle"
                  aria-expanded={isTopicBreakdownOpen}
                  aria-controls="study-center-category-breakdown"
                  onClick={() => setIsTopicBreakdownOpen((open) => !open)}
                >
                  <span className="study-center-page__progress-toggle-label">
                    {isTopicBreakdownOpen
                      ? strings.studyCenter.progressHideCategories
                      : strings.studyCenter.progressShowCategories}
                  </span>
                  <span
                    className={
                      isTopicBreakdownOpen
                        ? 'study-center-page__progress-toggle-icon study-center-page__progress-toggle-icon--open'
                        : 'study-center-page__progress-toggle-icon'
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

                {isTopicBreakdownOpen ? (
                  <div className="study-center-page__progress-grid" id="study-center-category-breakdown">
                    <div className="study-center-page__progress-column">
                      {leftColumnProgress.map((row) => (
                        <div key={row.topic}>{renderProgressRow(row)}</div>
                      ))}
                    </div>
                    <div className="study-center-page__progress-column">
                      {rightColumnProgress.map((row) => (
                        <div key={row.topic}>{renderProgressRow(row)}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </SectionCard>
        </section>
      ) : null}
    </main>
  )
}
