import type { KnowledgeHubExample } from '@/pages/knowledge-hub/types'

type ExampleMockupProps = {
  example: KnowledgeHubExample
  expanded?: boolean
}

export function ExampleMockup({
  example,
  expanded = false,
}: ExampleMockupProps) {
  // The same mockup is used in both the thumbnail grid and the expanded modal
  // so article examples stay visually consistent in each reading mode.
  return (
    <div
      className={
        expanded
          ? `knowledge-hub-page__example-frame knowledge-hub-page__example-frame--${example.kind} knowledge-hub-page__example-frame--expanded`
          : `knowledge-hub-page__example-frame knowledge-hub-page__example-frame--${example.kind}`
      }
    >
      <div className="knowledge-hub-page__example-window">
        <div className="knowledge-hub-page__example-bar">
          <span>{example.channelLabel}</span>
          <span>{example.timeLabel}</span>
        </div>
        <div className="knowledge-hub-page__example-header">
          <p className="knowledge-hub-page__example-from">{example.fromLabel}</p>
          {example.subject ? (
            <p className="knowledge-hub-page__example-subject">{example.subject}</p>
          ) : null}
        </div>
        <div className="knowledge-hub-page__example-body">
          {example.previewLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {example.actionText ? (
            <span className="knowledge-hub-page__example-action">{example.actionText}</span>
          ) : null}
        </div>
      </div>
      <div className="knowledge-hub-page__example-footer">
        <p className="knowledge-hub-page__example-title">{example.title}</p>
        <p className="knowledge-hub-page__example-hint">{example.hint}</p>
      </div>
    </div>
  )
}
