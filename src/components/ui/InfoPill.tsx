type InfoPillProps = {
  label: string
  tone?: 'neutral' | 'accent'
}

export function InfoPill({ label, tone = 'neutral' }: InfoPillProps) {
  return <span className={`info-pill info-pill--${tone}`}>{label}</span>
}
