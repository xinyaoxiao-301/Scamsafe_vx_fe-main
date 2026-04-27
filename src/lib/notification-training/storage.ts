import type { StoredNotificationScenario } from '@/lib/notification-training/types'

const LAST_NOTIFICATION_SCENARIO_KEY = 'scamsafe_notification_training_last_scenario_v1'

export function readStoredNotificationScenario() {
  try {
    const raw = window.sessionStorage.getItem(LAST_NOTIFICATION_SCENARIO_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredNotificationScenario
  } catch {
    return null
  }
}

export function writeStoredNotificationScenario(scenario: StoredNotificationScenario) {
  window.sessionStorage.setItem(LAST_NOTIFICATION_SCENARIO_KEY, JSON.stringify(scenario))
}
