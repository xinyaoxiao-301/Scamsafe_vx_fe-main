import type { PropsWithChildren } from 'react'

// Central place for future app-wide providers. Keeping this wrapper small makes
// main.tsx stable if more global context providers are introduced later.
export function AppProviders({ children }: PropsWithChildren) {
  return <>{children}</>
}
