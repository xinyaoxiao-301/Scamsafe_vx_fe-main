// Lightweight label chip used for short supporting metadata such as status,
// emphasis tags, or secondary descriptors inside cards.
type InfoPillProps = {
  label: string
  tone?: 'neutral' | 'accent'
}

export function InfoPill({ label, tone = 'neutral' }: InfoPillProps) {
  return <span className={`info-pill info-pill--${tone}`}>{label}</span>
}
