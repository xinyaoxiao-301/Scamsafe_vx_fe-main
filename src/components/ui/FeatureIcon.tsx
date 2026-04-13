type FeatureIconProps = {
  name: 'detection' | 'study' | 'simulation' | 'support'
}

export function FeatureIcon({ name }: FeatureIconProps) {
  if (name === 'detection') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="4.7" />
        <path d="M14 14 19 19" />
        <path d="M10.5 8.7v3.6" />
        <path d="M8.7 10.5h3.6" />
      </svg>
    )
  }

  if (name === 'study') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.5 6.5h13v11h-13Z" />
        <path d="M8 9h8" />
        <path d="M8 12h8" />
        <path d="M8 15h5" />
      </svg>
    )
  }

  if (name === 'simulation') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2.5L10 18v-3H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        <circle cx="10" cy="10.5" r="0.9" />
        <circle cx="14" cy="10.5" r="0.9" />
        <path d="M9.6 13h4.8" />
        <path d="M12 3.5v1.7" />
        <path d="M9.1 5.4 7.9 4.2" />
        <path d="M14.9 5.4 16.1 4.2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.4 5.8a2.2 2.2 0 0 1 2.8.2l1.3 1.3a1.8 1.8 0 0 1 0 2.5l-.9.9a11.4 11.4 0 0 0 1.7 1.9 11.4 11.4 0 0 0 1.9 1.7l.9-.9a1.8 1.8 0 0 1 2.5 0l1.3 1.3a2.2 2.2 0 0 1 .2 2.8l-.5.7a2.7 2.7 0 0 1-2.7 1c-2.2-.4-4.5-1.8-6.8-4.1S6.3 11 5.9 8.8a2.7 2.7 0 0 1 1-2.7Z" />
      <path d="M16.8 6.2h2.7v2.7" />
      <path d="M19.5 6.2 15.7 10" />
    </svg>
  )
}
