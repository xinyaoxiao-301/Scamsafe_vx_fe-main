// Barrel exports for the i18n module so consuming files can import translation
// primitives from one stable path instead of several nested files.
export { I18nProvider } from './provider'
export { useI18n } from './useI18n'
export type { I18nContextValue, Language, Strings } from './types'
