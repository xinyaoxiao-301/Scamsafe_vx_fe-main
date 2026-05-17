// Dedicated hook for translation access. Throwing early here makes missing
// provider wiring obvious during development instead of failing silently.
import { useContext } from 'react'
import { I18nContext } from './context'

export function useI18n() {
  const value = useContext(I18nContext)

  if (!value) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return value
}
