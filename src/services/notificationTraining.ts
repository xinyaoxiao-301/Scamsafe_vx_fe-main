// Service layer for the notification training flow. These calls keep the popup
// hook and reveal page aligned with the backend's simulated alert content.
import { env } from '@/lib/env'
import type { NotificationReveal } from '@/lib/notification-training/types'

const API_BASE = env.apiBaseUrl

type RandomNotificationResponse = {
  id: number
  message: string
}

type NotificationRevealResponse = {
  id: number
  message: string
  label: string
  is_scam: boolean
  explanations: string[]
}

async function parseError(res: Response) {
  const body = await res.json().catch(() => ({}))
  return (body as { detail?: string }).detail ?? `Server error ${res.status}`
}

export async function fetchRandomNotification(language = 'en'): Promise<RandomNotificationResponse> {
  const url = new URL(`${API_BASE}/api/notifications/random`)
  url.searchParams.set('language', language)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<RandomNotificationResponse>
}

export async function fetchNotificationReveal(
  notificationId: number,
  language = 'en',
): Promise<NotificationReveal> {
  const url = new URL(`${API_BASE}/api/notifications/${notificationId}`)
  url.searchParams.set('language', language)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  const data = (await res.json()) as NotificationRevealResponse

  return {
    id: data.id,
    message: data.message,
    label: data.label,
    isScam: data.is_scam,
    explanations: data.explanations ?? [],
    triggeredAt: Date.now(),
  }
}
