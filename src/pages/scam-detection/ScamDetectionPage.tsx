import { useRef, useState } from 'react'
import type { ClipboardEvent } from 'react'
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
      if (!navigator.clipboard?.readText) {
        setError(s.errorPasteUnavailable)
        return
      }

      const pasted = await navigator.clipboard.readText()
      if (!pasted || pasted.trim().length === 0) {
        setError(s.errorPasteEmpty)
        return
      }

      setText(pasted.trim())
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

  const handleTextareaPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (!pasted || pasted.trim().length === 0) {
      event.preventDefault()
      setError(s.errorPasteEmpty)
      return
    }
    setError(null)
  }

  const renderGuidanceStep = (step: string, riskLevel: ScamAnalysis['riskLevel']) => {
    const trimmed = step.trim()
    if (!trimmed) return null

    if (riskLevel === 'Very Low' || riskLevel === 'Low') {
      return <span className="scam-detection-page__guidance-rest">{trimmed}</span>
    }

    const prefixes = (s.highlightPrefixes ?? [])
      .map((p) => p.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)

    const matched = prefixes.find((prefix) => trimmed.toLowerCase().startsWith(prefix.toLowerCase()))

    const firstSpace = trimmed.search(/\s/)
    const fallbackFirst = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)
    const highlight = matched ?? fallbackFirst
    const rest = trimmed.slice(highlight.length)

    return (
      <>
        <span className="scam-detection-page__guidance-first">{highlight}</span>
        <span className="scam-detection-page__guidance-rest">{rest}</span>
      </>
    )
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

      <section className="scam-detection-page__grid" aria-label={s.workspaceLabel}>
        <SectionCard
          className="scam-detection-page__card scam-detection-page__card--input"
          eyebrow={s.step1Eyebrow}
          title={s.step1Title}
          description={s.step1Description}
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
          <div className="scam-detection-page__textarea-block">
            <label className="scam-detection-page__label" htmlFor="scam-input">
              {s.messageLabel}
            </label>
            <div className="scam-detection-page__textarea-wrap">
              <textarea
                id="scam-input"
                className={`scam-detection-page__textarea${isOverLimit ? ' scam-detection-page__textarea--error' : ''}`}
                rows={7}
                placeholder={s.messagePlaceholder}
                value={text}
                onChange={(e) => { setText(e.target.value); setError(null) }}
                onPaste={handleTextareaPaste}
                disabled={isLoading}
                aria-describedby="scam-input-meta"
              />
            </div>
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
        <SectionCard
          className="scam-detection-page__card scam-detection-page__card--result"
          eyebrow={s.step2Eyebrow}
          title={s.step2Title}
          description={s.step2Description}
        >
          <div ref={resultsRef} className="scam-detection-page__result-body" aria-live="polite">
            {isLoading ? (
              <div className="scam-detection-page__loading" aria-label={s.loadingLabel}>
                <div className="scam-detection-page__spinner" aria-hidden="true" />
                <p>{s.loadingLabel}</p>
              </div>
            ) : result ? (
              <>
                <div className="scam-detection-page__result-top">
                  <div
                    className={[
                      'scam-detection-page__risk-box',
                      `scam-detection-page__risk-box--${result.riskLevel.toLowerCase().replace(' ', '-')}`,
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <div className="scam-detection-page__risk-box-label">
                      {s.riskLabels[result.riskLevel]}
                    </div>
                    <div className="scam-detection-page__risk-box-sub">RISK</div>
                    <div className="scam-detection-page__risk-box-pct">
                      {Math.round(result.confidencePct)}%
                    </div>
                  </div>

                  <div className="scam-detection-page__pills" aria-label="Result tags">
                    <span className="scam-detection-page__pill scam-detection-page__pill--type">
                      <span>{s.resultTypeLabel}:</span>
                      <strong>{s.typeLabels[result.scamType]}</strong>
                    </span>
                    <span
                      className={
                        result.isScam
                          ? 'scam-detection-page__pill scam-detection-page__pill--bad'
                          : 'scam-detection-page__pill scam-detection-page__pill--good'
                      }
                    >
                      {result.isScam ? s.resultVerdictScam : s.resultVerdictNotScam}
                    </span>
                  </div>
                </div>

                <p className="scam-detection-page__summary">{result.summary}</p>

                {result.indicators.length ? (
                  <div className="scam-detection-page__block">
                    <h3 className="scam-detection-page__h3">{s.indicatorsTitle}</h3>
                    <ul className="scam-detection-page__list">
                      {result.indicators.map((ind, i) => (
                        <li key={i}>{ind.title}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="scam-detection-page__muted">{s.indicatorsEmpty}</p>
                )}

                {result.guidance.length ? (
                  <div className="scam-detection-page__block">
                    <h3 className="scam-detection-page__h3">Smart Guidance</h3>
                    <ul className="scam-detection-page__list">
                      {result.guidance.map((step, i) => (
                        <li key={i} className="scam-detection-page__guidance-item">
                          {renderGuidanceStep(step, result.riskLevel)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="scam-detection-page__empty">{s.emptyState}</p>
            )}
          </div>
        </SectionCard>
      </section>
    </main>
  )
}
