// AppProviders is the single extension point for global React providers.
// Right now it only passes children through, but keeping the wrapper in place
// lets the app add future providers without changing the bootstrap entry file.
import type { PropsWithChildren } from 'react'
export function AppProviders({ children }: PropsWithChildren) {
  return <>{children}</>
}
