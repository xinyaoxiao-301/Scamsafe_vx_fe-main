const fallbackApiBaseUrl = ''

export const env = {
  /**
   * If set (recommended in production), API calls go directly to that origin.
   * If empty, callers may use same-origin (e.g. Vite dev-server proxy via `/api`).
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl).trim(),
} as const
