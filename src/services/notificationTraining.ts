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
}

async function parseError(res: Response) {
  const body = await res.json().catch(() => ({}))
  return (body as { detail?: string }).detail ?? `Server error ${res.status}`
}

export async function fetchRandomNotification(): Promise<RandomNotificationResponse> {
  const res = await fetch(`${API_BASE}/api/notifications/random`)
  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<RandomNotificationResponse>
}

export async function fetchNotificationReveal(notificationId: number): Promise<NotificationReveal> {
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}`)
  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  const data = (await res.json()) as NotificationRevealResponse

  return {
    id: data.id,
    message: data.message,
    label: data.label,
    isScam: data.is_scam,
    triggeredAt: Date.now(),
  }
}
