// Shared notification training contracts used by the popup hook, storage layer,
// and reveal page so the simulated browser alert flow stays consistent.
export type StoredNotificationScenario = {
  id: number
  message: string
  triggeredAt: number
}

export type NotificationReveal = StoredNotificationScenario & {
  label: string
  isScam: boolean
  explanations: string[]
}
