// useNotificationTraining simulates scam-style browser notifications in a
// controlled way. It coordinates permission handling, fetch timing, local
// persistence, and the handoff into the reveal page experience.
import { useEffect, useRef, useState } from 'react'
import logo from '@/assets/scamsafe-logo.png'
import { appRoutes } from '@/app/routes'
import { writeStoredNotificationScenario } from '@/lib/notification-training/storage'
import type { StoredNotificationScenario } from '@/lib/notification-training/types'
import { fetchRandomNotification } from '@/services/notificationTraining'

type NotificationPermissionState = NotificationPermission | 'unsupported'

const FIRST_NOTIFICATION_DELAY_MS = 10_000

function supportsNativeNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function useNotificationTraining(enabled: boolean, language = 'en', notificationTitle = 'ScamSafe notification training') {
  const entryTimeRef = useRef<number | null>(null)
  const hasTriggeredRef = useRef(false)
  const notificationRef = useRef<Notification | null>(null)
  const previousLanguageRef = useRef(language)
  const [activeScenario, setActiveScenario] = useState<StoredNotificationScenario | null>(null)
  const [permission, setPermission] = useState<NotificationPermissionState>(() => {
    if (!supportsNativeNotifications()) {
      return 'unsupported'
    }

    return window.Notification.permission
  })

  const openScenario = (scenario: StoredNotificationScenario | null = activeScenario) => {
    if (!scenario) return

    notificationRef.current?.close()
    notificationRef.current = null
    setActiveScenario(null)
    writeStoredNotificationScenario(scenario)
    window.location.hash = appRoutes.notificationReveal
    window.focus()
  }

  const dismissScenario = () => {
    notificationRef.current?.close()
    notificationRef.current = null
    setActiveScenario(null)
  }

  useEffect(() => {
    if (!supportsNativeNotifications() || !enabled) {
      return
    }

    if (entryTimeRef.current === null) {
      entryTimeRef.current = Date.now()
    }

    const syncPermission = () => {
      setPermission(window.Notification.permission)
    }

    const requestPermissionAfterLoad = () => {
      syncPermission()

      if (window.Notification.permission !== 'default') {
        return
      }

      void window.Notification.requestPermission().then((nextPermission) => {
        setPermission(nextPermission)
      })
    }

    if (window.document.readyState === 'complete') {
      requestPermissionAfterLoad()
      return
    }

    window.addEventListener('load', requestPermissionAfterLoad, { once: true })

    return () => {
      window.removeEventListener('load', requestPermissionAfterLoad)
    }
  }, [enabled])

  useEffect(() => {
    if (previousLanguageRef.current === language) {
      return
    }

    previousLanguageRef.current = language

    if (!enabled || (!activeScenario && !notificationRef.current)) {
      return
    }

    // If the user changes language while a training alert is visible, replace
    // that in-flight scenario so the refreshed preview comes back localized.
    notificationRef.current?.close()
    notificationRef.current = null
    setActiveScenario(null)
    hasTriggeredRef.current = false
    entryTimeRef.current = Date.now() - FIRST_NOTIFICATION_DELAY_MS
  }, [activeScenario, enabled, language])

  useEffect(() => {
    if (!enabled || hasTriggeredRef.current) {
      return
    }

    if (entryTimeRef.current === null) {
      entryTimeRef.current = Date.now()
    }

    const elapsed = Date.now() - entryTimeRef.current
    const waitTime = Math.max(0, FIRST_NOTIFICATION_DELAY_MS - elapsed)

    let isCancelled = false

    const timeoutId = window.setTimeout(() => {
      if (hasTriggeredRef.current) {
        return
      }

      void (async () => {
        try {
          // Pass the current language so the notification message is localised.
          const preview = await fetchRandomNotification(language)
          if (isCancelled || hasTriggeredRef.current) {
            return
          }

          hasTriggeredRef.current = true

          const scenario: StoredNotificationScenario = {
            id: preview.id,
            message: preview.message,
            triggeredAt: Date.now(),
          }

          writeStoredNotificationScenario(scenario)
          setActiveScenario(scenario)

          if (permission === 'granted') {
            try {
              const nativeNotification = new window.Notification(notificationTitle, {
                body: scenario.message,
                icon: logo,
                requireInteraction: true,
                tag: `notification-training-${scenario.id}`,
              })

              nativeNotification.onclick = (event) => {
                event.preventDefault()
                notificationRef.current?.close()
                notificationRef.current = null
                setActiveScenario(null)
                writeStoredNotificationScenario(scenario)
                window.location.hash = appRoutes.notificationReveal
                window.focus()
              }

              notificationRef.current = nativeNotification
            } catch {
              // Keep the in-app preview available even if the native notification fails.
            }
          }
        } catch {
          hasTriggeredRef.current = false
        }
      })()
    }, waitTime)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [enabled, language, notificationTitle, permission])

  useEffect(() => {
    if (!enabled) {
      entryTimeRef.current = null
      hasTriggeredRef.current = false
      notificationRef.current?.close()
      notificationRef.current = null
      setActiveScenario(null)
    }
  }, [enabled])

  useEffect(() => {
    return () => {
      notificationRef.current?.close()
    }
  }, [])

  return {
    activeScenario,
    dismissScenario,
    isSupported: permission !== 'unsupported',
    openScenario,
    permission,
  }
}
