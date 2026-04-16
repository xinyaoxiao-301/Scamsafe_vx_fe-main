import { useMemo, useState } from 'react'
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

function buildPolylinePoints(values: number[], width: number, height: number) {
  if (values.length === 0) return ''
  const max    = 100
  const min    = 0
  const stepX  = values.length === 1 ? 0 : width / (values.length - 1)
  return values
    .map((value, index) => {
      const x = index * stepX
      const y = height - ((value - min) / (max - min)) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function splitExplanation(text: string): string[] {
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
  const [sessions, setSessions] = useState<QuizSessionRecord[]>(() => getSessions())
  const [points,   setPoints]   = useState(() => getTotalPoints())

  const lastScores = useMemo(() => {
    const recent = sessions.slice(-10)
    return recent.map((session) =>
      session.totalQuestions ? (session.correctCount / session.totalQuestions) * 100 : 0,
    )
  }, [sessions])

  const topicStats = useMemo(() => buildSessionStats(sessions), [sessions])
  const current    = quizQuestions ? quizQuestions[index] : null

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
    setHasSubmitted(true)
    setIsCorrect(correct)

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
        <p className="study-center-page__lede">{strings.studyCenter.lede}</p>
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
          <div className="study-center-page__topics" role="list" aria-label={strings.studyCenter.chooseTopicLabel}>
            {topics.map((item) => (
              <button
                key={item.topic}
                type="button"
                className={
                  [
                    'study-center-page__topic',
                    item.topic === 'mixed' ? 'study-center-page__topic--wide' : '',
                    selectedTopic === item.topic ? 'study-center-page__topic--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                onClick={() => setSelectedTopic(item.topic)}
                aria-label={item.title}
              >
                <p className="study-center-page__topic-title">{item.title}</p>
                <p className="study-center-page__topic-desc">{item.description}</p>
              </button>
            ))}
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

              <p className="study-center-page__prompt">{current.prompt}</p>

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

      <section className="study-center-page__progress" aria-label={strings.studyCenter.progressTitle}>
        <SectionCard
          className="study-center-page__progress-card"
          eyebrow={strings.studyCenter.progressEyebrow}
          title={strings.studyCenter.progressTitle}
          description={strings.studyCenter.progressDescription}
        >
          {sessions.length ? (
            <>
              <div className="study-center-page__progress-top">
                <span className="study-center-page__pill">
                  {strings.studyCenter.pointsLabel}: <strong>{points}</strong>
                </span>
                <span className="study-center-page__pill">
                  {strings.common.completed}: <strong>{sessions.length}</strong>
                </span>
              </div>

              <div className="study-center-page__charts">
                <div className="study-center-page__chart" aria-label={strings.studyCenter.sessionsLabel}>
                  <h3 className="study-center-page__h3">{strings.studyCenter.sessionsLabel}</h3>
                  <svg viewBox="0 0 320 120" role="img" aria-label={strings.studyCenter.sessionsLabel}>
                    <defs>
                      <linearGradient id="sc-line" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="rgba(19, 108, 242, 1)" />
                        <stop offset="100%" stopColor="rgba(13, 79, 179, 1)"  />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#sc-line)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={buildPolylinePoints(lastScores, 320, 120)}
                    />
                  </svg>
                </div>

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
            </>
          ) : (
            <p className="study-center-page__empty-progress">{strings.studyCenter.emptyProgress}</p>
          )}
        </SectionCard>
      </section>
    </main>
  )
}
