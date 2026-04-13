import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'
import { analyzeScamText, countWords } from '@/services/scamDetection'
import type { ScamAnalysis } from '@/types/scamDetection'

type ScamDetectionPageProps = {
  onBackHome: () => void
}

const WORD_LIMIT = 500

export function ScamDetectionPage({ onBackHome }: ScamDetectionPageProps) {
  const { language, strings } = useI18n()
  const s = strings.scamDetection

  const [text,        setText]        = useState('')
  const [isLoading,   setIsLoading]   = useState(false)
  const [result,      setResult]      = useState<ScamAnalysis | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [showModal,   setShowModal]   = useState(false)

  const resultsRef = useRef<HTMLDivElement | null>(null)

  const wordCount   = countWords(text)
  const isOverLimit = wordCount > WORD_LIMIT
  const canAnalyze  = text.trim().length > 0 && !isOverLimit && !isLoading

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    if (text.trim().length === 0) { setError(s.errorEmpty); return }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const analysis = await analyzeScamText(text, language)
      setResult(analysis)
      if (analysis.riskLevel === 'High' || analysis.riskLevel === 'Very High') {
        setShowModal(true)
      }
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : s.errorEmpty)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaste = async () => {
    try {
      const pasted = await navigator.clipboard.readText()
      if (!pasted) { setError(s.errorPasteEmpty); return }
      setText(pasted)
      setError(null)
    } catch {
      setError(s.errorPasteUnavailable)
    }
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setError(null)
    setShowModal(false)
  }

  return (
    <main className="scam-detection-page" aria-label={s.pageLabel}>

      <header className="scam-detection-page__header">
        <p className="scam-detection-page__eyebrow">{s.headerEyebrow}</p>
        <h1 className="scam-detection-page__title">{s.title}</h1>
        <p className="scam-detection-page__lede">{s.lede}</p>
      </header>

      {/* ── High-risk modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="scam-detection-page__modal" role="alertdialog" aria-modal="true">
          <div
            className="scam-detection-page__modal-backdrop"
            onClick={() => setShowModal(false)}
          />
          <div className="scam-detection-page__modal-card">
            <div className="scam-detection-page__modal-icon" aria-hidden="true">⚠</div>
            <p className="scam-detection-page__modal-title">{s.modalTitle}</p>
            <p className="scam-detection-page__modal-text">{s.modalText}</p>
            <div className="scam-detection-page__modal-actions">
              <Button
                className="scam-detection-page__modal-primary"
                variant="primary"
                onClick={() => setShowModal(false)}
              >
                {s.modalConfirm}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step cards ────────────────────────────────────────────────── */}
      <section className="scam-detection-page__steps">
        <SectionCard eyebrow={s.step1Eyebrow} title={s.step1Title}>
          <p>{s.step1Description}</p>
        </SectionCard>
        <SectionCard eyebrow={s.step2Eyebrow} title={s.step2Title}>
          <p>{s.step2Description}</p>
        </SectionCard>
      </section>

      {/* ── Input workspace ───────────────────────────────────────────── */}
      <section
        className="scam-detection-page__workspace"
        aria-label={s.workspaceLabel}
      >
        <SectionCard
          eyebrow={s.headerEyebrow}
          title={s.title}
          description={s.lede}
          footer={
            <div className="scam-detection-page__actions">
              <Button
                variant="primary"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                aria-busy={isLoading}
                className="scam-detection-page__analyze"
              >
                {isLoading ? s.analyzing : s.analyze}
              </Button>
              <Button variant="secondary" onClick={handlePaste}>
                {s.paste}
              </Button>
              {(text || result) && (
                <Button variant="secondary" onClick={handleClear}>
                  {s.clear}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onBackHome}
                className="scam-detection-page__back"
              >
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          <div className="scam-detection-page__textarea-wrap">
            <label className="scam-detection-page__label" htmlFor="scam-input">
              {s.messageLabel}
            </label>
            <textarea
              id="scam-input"
              className={`scam-detection-page__textarea${isOverLimit ? ' scam-detection-page__textarea--error' : ''}`}
              rows={7}
              placeholder={s.messagePlaceholder}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null) }}
              disabled={isLoading}
              aria-describedby="scam-input-meta"
            />
            <p
              id="scam-input-meta"
              className={`scam-detection-page__counter${isOverLimit ? ' scam-detection-page__counter--bad' : ''}`}
            >
              {isOverLimit
                ? s.wordLimitExceeded(WORD_LIMIT, wordCount)
                : `${wordCount} ${s.wordsLabel}`}
            </p>
          </div>

          {error && (
            <p className="scam-detection-page__error" role="alert">{error}</p>
          )}
        </SectionCard>
      </section>

      {/* ── Loading ───────────────────────────────────────────────────── */}
      {isLoading && (
        <section className="scam-detection-page__loading" aria-live="polite" aria-label={s.loadingLabel}>
          <div className="scam-detection-page__spinner" aria-hidden="true" />
          <p>{s.loadingLabel}</p>
        </section>
      )}

      {/* ── Empty state (no result yet, not loading) ──────────────────── */}
      {!result && !isLoading && (
        <section className="scam-detection-page__empty" aria-label={s.emptyState}>
          <p>{s.emptyState}</p>
        </section>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {result && (
        <section
          ref={resultsRef}
          className="scam-detection-page__results"
          aria-live="polite"
        >
          <SectionCard
            eyebrow={s.resultRiskLabel}
            title={result.isScam ? s.resultVerdictScam : s.resultVerdictNotScam}
          >
            {/* Risk level + type row */}
            <div className="scam-detection-page__verdict-row">
              <span className={`scam-detection-page__risk-badge scam-detection-page__risk-badge--${result.riskLevel.toLowerCase().replace(' ', '-')}`}>
                {s.riskLabels[result.riskLevel]}
              </span>
              {result.isScam && (
                <span className="scam-detection-page__type-badge">
                  {s.resultTypeLabel}: {s.typeLabels[result.scamType]}
                </span>
              )}
            </div>

            {/* Confidence bar */}
            <div className="scam-detection-page__confidence">
              <div
                className="scam-detection-page__confidence-fill"
                style={{ width: `${Math.round(result.confidencePct)}%` }}
                aria-label={`${Math.round(result.confidencePct)}%`}
              />
            </div>

            {/* Summary */}
            <p className="scam-detection-page__summary">{result.summary}</p>

            {/* Warning indicators */}
            {result.indicators.length > 0 ? (
              <div className="scam-detection-page__indicators">
                <h3 className="scam-detection-page__section-title">{s.indicatorsTitle}</h3>
                <ul className="scam-detection-page__list">
                  {result.indicators.map((ind, i) => (
                    <li key={i}>
                      <strong>{ind.title}</strong>
                      {ind.description ? ` — ${ind.description}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="scam-detection-page__indicators-empty">{s.indicatorsEmpty}</p>
            )}
          </SectionCard>

          {/* Guidance card */}
          {result.guidance.length > 0 && (
            <SectionCard
              eyebrow={s.guidanceEyebrow}
              title={s.guidanceTitle}
              description={s.guidanceDescription}
            >
              <ol className="scam-detection-page__guidance-list">
                {result.guidance.map((step, i) => (
                  <li
                    key={i}
                    className={
                      s.highlightPrefixes.some((p) => step.startsWith(p))
                        ? 'scam-detection-page__guidance-item scam-detection-page__guidance-item--highlight'
                        : 'scam-detection-page__guidance-item'
                    }
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </section>
      )}
    </main>
  )
}
