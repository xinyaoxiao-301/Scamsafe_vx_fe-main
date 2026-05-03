import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import {
  TOPIC_ORDER,
  buildSessionStats,
  fetchQuizQuestions,
  getSessions,
  getTopics,
  getTotalPoints,
  recordSession,
} from '@/services/studyCenterQuiz'
import type { QuizQuestion, QuizSessionRecord, QuizTopic } from '@/types/studyCenterQuiz'

type StudyCenterPageProps = {
  onBackHome: () => void
}

const DEFAULT_QUESTION_COUNT = 6

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

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
  const specificTopicToggleLabel = 'Choose a scam type'
  const hideSpecificTopicToggleLabel = 'Hide scam types'
  const { language, strings } = useI18n()
  const [showSpecificTopics, setShowSpecificTopics] = useState(false)
  const progressLockedNote =
    language === 'ms'
      ? 'Selesaikan satu kuiz untuk buka progress.'
      : language === 'zh'
        ? '完成一次测验后，这里会显示进度。'
        : 'Finish one quiz to unlock progress.'

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

  const topics    = useMemo(() => getTopics(language), [language])
  const featuredTopic = topics.find((item) => item.topic === 'mixed') ?? topics[0]
  const specificTopics = topics.filter((item) => item.topic !== 'mixed')
  const [sessions, setSessions] = useState<QuizSessionRecord[]>(() => getSessions())
  const [points,   setPoints]   = useState(() => getTotalPoints())
  const questionRef = useRef<HTMLParagraphElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement | null>(null)
  const pendingScrollTargetRef = useRef<'feedback' | 'question' | null>(null)

  const topicStats = useMemo(() => buildSessionStats(sessions), [sessions])
  const current    = quizQuestions ? quizQuestions[index] : null

  const scrollElementToViewportCenter = (element: HTMLElement | null) => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    const targetTop = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  }

  useEffect(() => {
    if (selectedTopic !== 'mixed') {
      setShowSpecificTopics(true)
    }
  }, [selectedTopic])

  useEffect(() => {
    if (pendingScrollTargetRef.current !== 'feedback' || !hasSubmitted) return
    const frame = window.requestAnimationFrame(() => {
      scrollElementToViewportCenter(feedbackRef.current)
      pendingScrollTargetRef.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hasSubmitted])

  useEffect(() => {
    if (pendingScrollTargetRef.current !== 'question') return
    const frame = window.requestAnimationFrame(() => {
      scrollElementToViewportCenter(questionRef.current)
      pendingScrollTargetRef.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [index])

  // ── Quiz lifecycle ────────────────────────────────────────────────────────────
  const startQuiz = async () => {
    // Quiz is only available in English
    if (language !== 'en') {
      const unavailable = language === 'ms' ? 'tidak tersedia' : '无法使用'
      setError(unavailable)
      setQuizQuestions(null)
      return
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

    try {
      const questions = await fetchQuizQuestions(selectedTopic, questionCount)
      if (!questions || questions.length === 0) {
        setError('No questions available for this topic. Please try another.')
        return
      }
      setQuizQuestions(questions)
    } catch {
      setError('Could not load questions. Please check your connection and try again.')
    } finally {
      setIsLoadingQuiz(false)
    }
  }

  const reset = () => {
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
  }

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
    setPoints(getTotalPoints())
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main className="study-center-page" aria-label={strings.studyCenter.pageLabel}>
      <header className="study-center-page__header">
        <p className="study-center-page__eyebrow">{strings.studyCenter.eyebrow}</p>
        <h1 className="study-center-page__title">{strings.studyCenter.title}</h1>
      </header>

      <section className="study-center-page__grid" aria-label={strings.studyCenter.pageLabel}>
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
                onClick={startQuiz}
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
                  onClick={() => setSelectedTopic(featuredTopic.topic)}
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

        <SectionCard
          className="study-center-page__card"
          eyebrow={strings.studyCenter.step2Eyebrow}
          title={strings.studyCenter.step2Title}
          description={strings.studyCenter.step2Description}
          footer={step2Footer}
        >
          {/* Loading state */}
          {isLoadingQuiz ? (
            <div className="study-center-page__loading" role="status" aria-live="polite">
              <div className="study-center-page__spinner" aria-hidden="true" />
              <p>{strings.studyCenter.loadingLabel}</p>
            </div>
          ) : quizQuestions && current ? (
            <>
              <div className="study-center-page__question-meta" aria-label="Question progress">
                <span>
                  {strings.studyCenter.questionCountLabel}: {index + 1}/{quizQuestions.length}
                </span>
                <span>
                  {strings.studyCenter.correct}: {correctCount}
                </span>
              </div>

              <p className="study-center-page__prompt" ref={questionRef}>{current.prompt}</p>

              <div className="study-center-page__options" role="list" aria-label="Answer options">
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
                aria-label="Feedback"
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
        </SectionCard>
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
            <div className="study-center-page__progress-top">
              <span className="study-center-page__pill">
                {strings.studyCenter.pointsLabel}: <strong>{points}</strong>
              </span>
              <span className="study-center-page__pill">
                {strings.common.completed}: <strong>{sessions.length}</strong>
              </span>
            </div>

            <div className="study-center-page__charts">
              <div className="study-center-page__chart" aria-label={strings.studyCenter.breakdownLabel}>
                <h3 className="study-center-page__h3">{strings.studyCenter.breakdownLabel}</h3>
                <div className="study-center-page__bars">
                  {TOPIC_ORDER.map((topic) => {
                    const stat  = topicStats[topic]
                    const rate  = stat.total ? (stat.correct / stat.total) * 100 : 0
                    const label = topics.find((t) => t.topic === topic)?.title ?? topic
                    return (
                      <div className="study-center-page__bar" key={topic}>
                        <div className="study-center-page__bar-top">
                          <span>{label}</span>
                          <span>{stat.total ? formatPercent(rate) : '—'}</span>
                        </div>
                        <div className="study-center-page__bar-track" aria-hidden="true">
                          <div
                            className="study-center-page__bar-fill"
                            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        </section>
      ) : null}
    </main>
  )
}
