import type { PropsWithChildren, ReactNode } from 'react'

type SectionCardProps = PropsWithChildren<{
  eyebrow?: string
  eyebrowClassName?: string
  title: string
  description?: string
  footer?: ReactNode
  className?: string
}>

export function SectionCard({
  eyebrow,
  eyebrowClassName,
  title,
  description,
  footer,
  className,
  children,
}: SectionCardProps) {
  return (
    <section className={className ? `section-card ${className}` : 'section-card'}>
      {eyebrow ? (
        <p className={eyebrowClassName ? `section-card__eyebrow ${eyebrowClassName}` : 'section-card__eyebrow'}>
          {eyebrow}
        </p>
      ) : null}
      <header className="section-card__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="section-card__body">{children}</div>
      {footer ? <div className="section-card__footer">{footer}</div> : null}
    </section>
  )
}
