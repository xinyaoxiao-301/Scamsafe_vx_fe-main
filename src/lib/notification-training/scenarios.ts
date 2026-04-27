import type { NotificationScenario, StoredNotificationScenario } from '@/lib/notification-training/types'

const scamScenarios: NotificationScenario[] = [
  {
    id: 'prize-claim-scam',
    kind: 'scam',
    title: 'Prize Won: Act now to claim',
    body: 'You have won a RM1,500 smart device reward. Click to claim before 6:00 PM today.',
    sender: 'ScamSafe Rewards Centre',
    url: 'https://scamsafe-prize-claim-now.biz/reward',
    actionLabel: 'Open',
    branding: 'ScamSafe Rewards Centre',
    revealTitle: 'This was a scam! Be more careful next time.',
    revealMessage: 'The notification used pressure and a suspicious destination to push you into a rushed decision.',
    revealSummary:
      'Scam alerts often sound exciting or urgent so the victim reacts before checking the sender, tone, and link.',
    reasons: [
      {
        id: 'scam-urgency',
        tone: 'danger',
        title: 'Urgent reward language',
        description: 'Phrases like “Act now” and a same-day deadline are designed to rush you.',
      },
      {
        id: 'scam-url',
        tone: 'danger',
        title: 'Mismatched website address',
        description: 'The web address uses an unrelated reward domain instead of a trusted branded site.',
      },
      {
        id: 'scam-branding',
        tone: 'danger',
        title: 'Inconsistent sender branding',
        description: 'The sender name imitates a trusted brand, but the wording does not match a real product notice.',
      },
    ],
  },
  {
    id: 'bank-code-scam',
    kind: 'scam',
    title: 'Bank alert: Verify your code now',
    body: 'Suspicious access detected. Open now and confirm your TAC code to avoid account lock.',
    sender: 'Secure Banking Review',
    url: 'https://bank-review-safe-login.click/verify',
    actionLabel: 'Open',
    branding: 'Secure Banking Review',
    revealTitle: 'This was a scam! Be more careful next time.',
    revealMessage: 'The message pretended to protect an account, but it asked for urgent action through an unsafe link.',
    revealSummary:
      'Scammers often copy bank-style wording so the victim feels fear first and checks details later.',
    reasons: [
      {
        id: 'scam-fear',
        tone: 'danger',
        title: 'Fear-based tone',
        description: 'Warnings about account lock or suspicious access are meant to create panic.',
      },
      {
        id: 'scam-tac',
        tone: 'danger',
        title: 'Sensitive code request',
        description: 'A real bank would not ask for a TAC or password through a push notification link.',
      },
      {
        id: 'scam-link',
        tone: 'danger',
        title: 'Suspicious login domain',
        description: 'The destination uses a generic “.click” domain instead of an official bank site.',
      },
    ],
  },
]

const safeScenarios: NotificationScenario[] = [
  {
    id: 'browser-update-safe',
    kind: 'safe',
    title: 'ScamSafe Browser update available',
    body: 'Version 4.2 is ready. Open to review what changed and update when convenient.',
    sender: 'ScamSafe Browser',
    url: 'https://portal.scamsafe.app/browser-notes',
    actionLabel: 'Open',
    branding: 'ScamSafe Browser',
    revealTitle: 'This was a genuine notification.',
    revealMessage: 'The notice stayed calm, matched the product branding, and linked to a consistent web address.',
    revealSummary:
      'Safe alerts usually explain the update clearly and let the user decide without pressure.',
    reasons: [
      {
        id: 'safe-tone',
        tone: 'safe',
        title: 'Neutral and informative tone',
        description: 'The notification explains what is available without using urgency or reward language.',
      },
      {
        id: 'safe-brand',
        tone: 'safe',
        title: 'Consistent sender branding',
        description: 'The sender name and the product mentioned in the message are the same.',
      },
      {
        id: 'safe-url',
        tone: 'safe',
        title: 'Trusted destination',
        description: 'The link matches the ScamSafe domain and looks like a product information page.',
      },
    ],
  },
  {
    id: 'maintenance-safe',
    kind: 'safe',
    title: 'ScamSafe notice: Maintenance tonight',
    body: 'System maintenance is scheduled for 9:00 PM. Open if you want to read the service details.',
    sender: 'ScamSafe System',
    url: 'https://portal.scamsafe.app/status',
    actionLabel: 'Open',
    branding: 'ScamSafe System',
    revealTitle: 'This was a genuine notification.',
    revealMessage: 'The message describes a routine update, keeps a steady tone, and points to a matching status page.',
    revealSummary:
      'Genuine notifications usually explain the event plainly and do not force the user to react immediately.',
    reasons: [
      {
        id: 'safe-plain-language',
        tone: 'safe',
        title: 'Plain service language',
        description: 'The wording is calm and descriptive instead of urgent, emotional, or rewarding.',
      },
      {
        id: 'safe-consistent-source',
        tone: 'safe',
        title: 'Recognisable sender',
        description: 'The sender and page address both match the ScamSafe product branding.',
      },
      {
        id: 'safe-no-pressure',
        tone: 'safe',
        title: 'No pressure to act immediately',
        description: 'The user is invited to read more, not pushed to hurry or enter private information.',
      },
    ],
  },
]

function pickRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function pickNotificationScenario(): StoredNotificationScenario {
  // The epic requires a 50:50 split between safe and scam outcomes.
  const selectedPool = Math.random() < 0.5 ? scamScenarios : safeScenarios

  return {
    ...pickRandomItem(selectedPool),
    triggeredAt: Date.now(),
  }
}
