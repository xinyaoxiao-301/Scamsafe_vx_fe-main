import type { KnowledgeHubIcon } from '@/pages/knowledge-hub/types'

type CategoryIconProps = {
  icon: KnowledgeHubIcon
}

export function CategoryIcon({ icon }: CategoryIconProps) {
  switch (icon) {
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h16v10H4z" />
          <path d="M2.5 7.5h19v3h-19z" />
          <path d="M12 7.5V20" />
          <path d="M9 7.5c-1.8 0-3-1.2-3-2.8S7 2 8.7 2c1.3 0 2.1.8 3.3 2.6" />
          <path d="M15 7.5c1.8 0 3-1.2 3-2.8S17 2 15.3 2c-1.3 0-2.1.8-3.3 2.6" />
        </svg>
      )
    case 'bank':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 9 9-5 9 5" />
          <path d="M4.5 10.5h15" />
          <path d="M6 10.5V18" />
          <path d="M10 10.5V18" />
          <path d="M14 10.5V18" />
          <path d="M18 10.5V18" />
          <path d="M3.5 20h17" />
        </svg>
      )
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
          <path d="m5 12 4-3 4 1 5-4" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4.5 7 7.5 6 7.5-6" />
          <path d="m4.5 18 6.2-5" />
          <path d="m19.5 18-6.2-5" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 2 1.8 4.7L18.5 8l-4.7 1.3L12 14l-1.8-4.7L5.5 8l4.7-1.3L12 2Z" />
          <path d="m18 14 .9 2.3 2.1.6-2.1.6L18 20l-.9-2.3-2.1-.6 2.1-.6L18 14Z" />
          <path d="m6 14 1 2.6 2.5.7-2.5.7L6 21l-1-2.6-2.5-.7 2.5-.7L6 14Z" />
        </svg>
      )
  }
}
