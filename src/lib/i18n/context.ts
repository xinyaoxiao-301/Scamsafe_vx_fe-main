// The context stays intentionally thin: the provider owns all translation
// lookup logic while consumers only read the current language and strings.
import { createContext } from 'react'
import type { I18nContextValue } from './types'

export const I18nContext = createContext<I18nContextValue | null>(null)
