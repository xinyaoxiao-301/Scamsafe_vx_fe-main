export type NotificationScenarioKind = 'scam' | 'safe'

export type NotificationReason = {
  id: string
  tone: 'danger' | 'safe'
  title: string
  description: string
}

export type NotificationScenario = {
  id: string
  kind: NotificationScenarioKind
  title: string
  body: string
  sender: string
  url: string
  actionLabel: string
  branding: string
  revealTitle: string
  revealMessage: string
  revealSummary: string
  reasons: NotificationReason[]
}

export type StoredNotificationScenario = NotificationScenario & {
  triggeredAt: number
}
