export type StoredNotificationScenario = {
  id: number
  message: string
  triggeredAt: number
}

export type NotificationReveal = StoredNotificationScenario & {
  label: string
  isScam: boolean
}
