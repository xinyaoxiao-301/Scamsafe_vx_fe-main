import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionCard } from '@/components/ui/SectionCard'
import { useI18n } from '@/lib/i18n'

type AboutUsPageProps = {
  onBackHome: () => void
}

type KnowledgeHubIcon = 'gift' | 'bank' | 'chart' | 'mail' | 'spark'

type KnowledgeHubExample = {
  id: string
  title: string
  kind: 'sms' | 'email'
  channelLabel: string
  timeLabel: string
  fromLabel: string
  subject?: string
  previewLines: string[]
  actionText?: string
  hint: string
}

type KnowledgeHubArticle = {
  id: string
  title: string
  publishedOn: string
  source: string
  sourceHref: string
  summary: string
  detail: string
  warningSigns: string[]
  tips: string[]
}

type KnowledgeHubCategory = {
  id: string
  label: string
  helper: string
  icon: KnowledgeHubIcon
  articles: KnowledgeHubArticle[]
  examples: KnowledgeHubExample[]
}

const knowledgeHubCategories: KnowledgeHubCategory[] = [
  {
    id: 'aid-prize',
    label: 'Prize & aid scams',
    helper: 'Free cash, lucky draws, and reward links that try to rush you into clicking.',
    icon: 'gift',
    articles: [
      {
        id: 'kkm-rm450',
        title: 'Fake RM450 medical subsidy link steals personal and bank details',
        publishedOn: '10 Apr 2026',
        source: 'The Star QuickCheck / MyCheck',
        sourceHref:
          'https://www.thestar.com.my/news/true-or-not/2026/04/10/quickcheck-is-the-health-ministry-giving-out-an-rm450-medical-subsidy',
        summary:
          'A WhatsApp chain claimed the Health Ministry was giving every Malaysian RM450. The link looked simple and friendly, but it led victims to forms asking for personal details and bank card information.',
        detail:
          'This pattern is dangerous because it sounds generous, local, and urgent. If money or prizes are offered through a random chat link, seniors should stop and verify the claim on an official government website first.',
        warningSigns: [
          'The offer arrives through WhatsApp instead of an official government channel.',
          'The page accepts random details without checking identity.',
          'The final step asks for card details instead of a normal official process.',
        ],
        tips: [
          'Do not trust cash assistance links forwarded by friends or groups.',
          'Check the organisation name on its official website before typing any details.',
          'If a page asks for your bank card number to receive aid, close it immediately.',
        ],
      },
      {
        id: 'fake-lucky-draw',
        title: 'Pensioner loses nearly RM90,000 after fake prize and live-video scam',
        publishedOn: '13 Mar 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/news/nation/2026/03/13/pensioner-loses-nearly-rm90000-to-a-scam',
        summary:
          'A pensioner was first pulled in by a lucky-draw advertisement and fake live videos. The scam slowly built trust before taking a much larger amount of money.',
        detail:
          'Prize scams often begin with small excitement, not direct threats. The goal is to make the victim feel chosen, special, or already halfway to receiving a reward.',
        warningSigns: [
          'A big prize appears before any proper verification.',
          'The message uses emotional words like winner, urgent, or today only.',
          'You are asked to pay a fee, deposit, or verification charge to unlock the reward.',
        ],
        tips: [
          'Real prizes do not need a secret payment to be released.',
          'Pause if a “winner” message appears before you even remember joining anything.',
          'Show the message to a family member before sending any money.',
        ],
      },
    ],
    examples: [
      {
        id: 'aid-sms',
        title: 'Fake subsidy SMS',
        kind: 'sms',
        channelLabel: 'SMS screenshot',
        timeLabel: '11:38',
        fromLabel: 'KKM Relief Update',
        previewLines: [
          'Wahhh! KKM is giving RM450 health subsidy.',
          'Claim today before the slot closes at 6pm.',
          'Tap this link now and confirm your bank card.',
        ],
        actionText: 'Apply now',
        hint: 'Red flags: free cash, closing time pressure, and card details request.',
      },
      {
        id: 'aid-email',
        title: 'Fake winner notice email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '08:16',
        fromLabel: 'reward-desk@carebonus-help.com',
        subject: 'You have been selected for a one-time family support payout',
        previewLines: [
          'Dear applicant, your support reward is ready for release.',
          'To avoid cancellation, complete bank verification in the secure form below.',
          'You must respond today to keep your prize active.',
        ],
        actionText: 'Release reward',
        hint: 'Red flags: unfamiliar email domain and urgent reward release button.',
      },
    ],
  },
  {
    id: 'bank-alerts',
    label: 'Bank SMS & account alerts',
    helper: 'Messages pretending to be from your bank, card issuer, or security team.',
    icon: 'bank',
    articles: [
      {
        id: 'fake-maybank-sms',
        title: 'Fake bank SMS asks victims to change password through a phishing link',
        publishedOn: '13 Apr 2026',
        source: 'The Star QuickCheck / MyCheck',
        sourceHref:
          'https://www.thestar.com.my/news/true-or-not/2026/04/13/quickcheck-are-scammers-sending-fake-bank-sms-messages-to-steal-your-password',
        summary:
          'A fake Maybank-style SMS warned people that suspicious login attempts had happened and told them to click a link to change their username and password. The link was part of a phishing attempt.',
        detail:
          'This scam works because it creates fear first. Many older users want to protect their account quickly, so they may click before checking whether the message came from the real bank.',
        warningSigns: [
          'The SMS includes a link asking you to fix a bank problem right away.',
          'The message uses panic language about account suspension or repeated login attempts.',
          'Malaysian banks have warned customers not to trust links sent by SMS.',
        ],
        tips: [
          'Never tap a banking link inside an unexpected SMS.',
          'Open your bank app directly, or call the number on the back of your card.',
          'If you already clicked, change your banking password from the real app immediately.',
        ],
      },
      {
        id: 'credit-card-fraud',
        title: 'Elderly contractor among victims in credit-card scam losses',
        publishedOn: '01 Apr 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/news/nation/2026/04/01/rm60000-lost-to-credit-card-scams-elderly-contractor-among-victims',
        summary:
          'Victims reported card transactions they did not authorise, including overseas charges. The safest first step was to call the bank and block the card immediately.',
        detail:
          'Not every bank scam begins with a suspicious link. Some start when victims notice unknown charges, then panic and answer fake follow-up messages that pretend to be help.',
        warningSigns: [
          'A message asks you to “verify” your card through a new link after a strange transaction.',
          'The sender pushes you to confirm many details before the bank has even identified you properly.',
          'You are told to solve the problem outside the official banking app.',
        ],
        tips: [
          'Freeze or block the card first before reading any follow-up message.',
          'Use only the number printed on your card or official banking app.',
          'Write down the transaction time, amount, and merchant before calling the bank.',
        ],
      },
    ],
    examples: [
      {
        id: 'bank-sms',
        title: 'Fake Maybank password reset SMS',
        kind: 'sms',
        channelLabel: 'SMS screenshot',
        timeLabel: '10:34',
        fromLabel: 'MAYBANK ALERT',
        previewLines: [
          'Dear customer, there were 3 login attempts on your account.',
          'Change your username and password now to avoid suspension.',
          'Tap maybank-secure-help.com to continue.',
        ],
        actionText: 'Secure account',
        hint: 'Red flags: fear message, fake domain, and SMS link for banking action.',
      },
      {
        id: 'bank-email',
        title: 'Fake card-security email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '07:52',
        fromLabel: 'security@maybank-verify-support.com',
        subject: 'Immediate card verification needed after overseas transaction',
        previewLines: [
          'We detected unusual card activity and need you to confirm your information.',
          'Please complete the secure verification form to stop further transactions.',
          'Failure to act within 30 minutes may lock your account.',
        ],
        actionText: 'Verify card',
        hint: 'Red flags: fake support domain and a countdown that pushes panic.',
      },
    ],
  },
  {
    id: 'investment-social',
    label: 'Investment & social media scams',
    helper: 'High-return offers that move from social media into chat groups and fake trading apps.',
    icon: 'chart',
    articles: [
      {
        id: 'investment-social-media',
        title: 'Police say investment scams on social media caused RM1.47bil in losses',
        publishedOn: '19 Apr 2026',
        source: 'The Star / Bernama',
        sourceHref:
          'https://www.thestar.com.my/news/nation/2026/04/19/rm147bil-lost-to-investment-scams-viasocial-media-platforms',
        summary:
          'Police said fake companies, clone firms, Ponzi tactics, and cryptocurrency traps were still spreading through Facebook, Instagram, WhatsApp, and Telegram. Victims often saw fake profits but could not withdraw them.',
        detail:
          'This is one of the most common modern scam journeys: a social media ad, a private chat, a convincing investment group, and finally a fake platform that keeps asking for more money.',
        warningSigns: [
          'The offer promises fast returns with little explanation.',
          'The “investment group” shows many happy screenshots but no regulated licence details.',
          'Victims are told to pay extra taxes or fees before they can withdraw money.',
        ],
        tips: [
          'Be suspicious when returns sound fast, guaranteed, or too smooth.',
          'Verify investment companies through official Bank Negara Malaysia or Securities Commission channels.',
          'If a platform blocks withdrawals, stop paying immediately and seek help.',
        ],
      },
      {
        id: 'rm8b-global-scheme',
        title: 'Victims describe a huge online investment scheme that looked profitable at first',
        publishedOn: '23 Apr 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/news/nation/2026/04/23/over-300-foreigners-cry-foul-over-rm8bil-scam-by-malaysian',
        summary:
          'A major case showed how fake platforms can look stable for a long time. Early withdrawals and attractive numbers on screen were used to build trust before larger losses followed.',
        detail:
          'Many investment scams do not fail in the first few minutes. They can feel professional, patient, and profitable. That makes them especially dangerous for retirees hoping to stretch their savings.',
        warningSigns: [
          'The app shows profits easily but delays real withdrawals.',
          'The group keeps encouraging bigger deposits after small early wins.',
          'You are asked to keep adding money to “unlock” what already belongs to you.',
        ],
        tips: [
          'Never trust a platform just because it shows gains on the screen.',
          'Take a screenshot of every payment, chat, and balance page if you feel unsure.',
          'Stop when a platform asks for extra release fees, taxes, or admin charges.',
        ],
      },
    ],
    examples: [
      {
        id: 'investment-sms',
        title: 'Fake VIP trading group invitation',
        kind: 'sms',
        channelLabel: 'SMS screenshot',
        timeLabel: '09:21',
        fromLabel: 'VIP Broker Assistant',
        previewLines: [
          'Teacher says today is the best time to buy before market opens.',
          'Join our private WhatsApp room and copy the trade now.',
          'Members already earned 18% this morning.',
        ],
        actionText: 'Join VIP group',
        hint: 'Red flags: guaranteed returns and pressure to join a private chat group.',
      },
      {
        id: 'investment-email',
        title: 'Fake investment platform welcome email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '13:05',
        fromLabel: 'support@primewealth-growth.net',
        subject: 'Your profit dashboard is ready for first withdrawal',
        previewLines: [
          'Congratulations, your account already shows a positive return.',
          'To release the funds, please clear the processing charge today.',
          'Our finance team will confirm once your transfer is received.',
        ],
        actionText: 'Release profits',
        hint: 'Red flags: profits appear before trust is earned and a fee is needed to withdraw.',
      },
    ],
  },
  {
    id: 'email-impersonation',
    label: 'Email impersonation scams',
    helper: 'Urgent emails that pretend to be from a boss, vendor, organiser, or trusted contact.',
    icon: 'mail',
    articles: [
      {
        id: 'bec-case',
        title: 'Business email compromise case shows how fake corporate email chains steal transfers',
        publishedOn: '25 Apr 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/aseanplus/aseanplus-news/2026/04/25/three-teens-including-a-malaysian-arrested-in-singapore-after-duping-us-remitter-in-business-e-mail-compromise-scam-involving-us289mil',
        summary:
          'A business e-mail compromise case involved fake corporate identities, shell companies, and bank accounts set up to receive stolen transfers. The scam copied normal business communication patterns to look ordinary.',
        detail:
          'Email scams do not always contain broken spelling. Some are clean, professional, and calm. What makes them dangerous is that they hijack trust already built between colleagues, suppliers, or customers.',
        warningSigns: [
          'The email asks for a transfer or payment change that breaks the usual process.',
          'A familiar name is used, but the email address is slightly different.',
          'You are told to keep the payment urgent, private, or outside the normal chain.',
        ],
        tips: [
          'Call the person or company using a known number before sending money.',
          'Double-check the sender address character by character.',
          'Slow down when an email tries to sound both urgent and secret.',
        ],
      },
      {
        id: 'fake-invitation',
        title: 'Fake invitation emails are being used as a new phishing hook',
        publishedOn: '24 Apr 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/tech/tech-news/2026/04/24/theres-a-new-phishing-scam-fake-invitations',
        summary:
          'A simple invitation email can feel harmless, but it may only be a new way to get people to click. Instead of threatening the victim, it uses curiosity and politeness.',
        detail:
          'This tactic is effective because many people are trained to ignore obvious fear messages. A soft invitation, event link, or attachment can bypass that caution if the message feels warm and social.',
        warningSigns: [
          'The invitation is vague and does not clearly explain who sent it.',
          'You are pushed to click a link “for details” without context.',
          'The sender feels unfamiliar even though the email sounds friendly.',
        ],
        tips: [
          'Treat unexpected invites like any other suspicious link.',
          'Check whether the event, person, or company is real before opening anything.',
          'If you were not expecting it, do not let politeness override caution.',
        ],
      },
    ],
    examples: [
      {
        id: 'email-payment',
        title: 'Urgent supplier payment email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '14:22',
        fromLabel: 'procurement@minedu-supply-support.com',
        subject: 'Urgent canteen order payment update before 4pm',
        previewLines: [
          'Please use the new supplier account attached below.',
          'This order is urgent and should not be delayed for approval.',
          'Reply once the transfer is completed.',
        ],
        actionText: 'Open attachment',
        hint: 'Red flags: payment change, time pressure, and an unfamiliar sender address.',
      },
      {
        id: 'email-invite',
        title: 'Soft phishing invitation email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '16:08',
        fromLabel: 'events@private-evening-guest.com',
        subject: 'Come and share an evening with me',
        previewLines: [
          'I would love to invite you to a private evening gathering.',
          'Click below for the location, guest list, and special details.',
          'Please confirm soon as places are limited.',
        ],
        actionText: 'View invitation',
        hint: 'Red flags: vague sender identity and a curiosity link without context.',
      },
    ],
  },
  {
    id: 'ai-impersonation',
    label: 'AI voice & deepfake scams',
    helper: 'New scams using cloned voices, fake authority videos, and polished machine-written messages.',
    icon: 'spark',
    articles: [
      {
        id: 'ai-misuse-surge',
        title: 'Authorities warn that scam posts and AI impersonation content are rising fast',
        publishedOn: '27 Apr 2026',
        source: 'The Star',
        sourceHref:
          'https://www.thestar.com.my/news/nation/2026/04/27/scam-posts-surge-sharply-as-ai-misuse-escalates-says-teo',
        summary:
          'Malaysian officials said scam-related online content removed in early 2026 was already high. The warning specifically highlighted AI-generated impersonation, including fake voices used in misleading aid videos.',
        detail:
          'AI scams can look more polished than older fraud. The message may sound natural, copy a known face, or repeat a trusted public name. That makes emotional verification harder for seniors.',
        warningSigns: [
          'A famous voice or public figure is tied to a money offer or easy financial aid.',
          'The content sounds smooth but does not point to an official channel.',
          'A video or audio clip quickly moves you toward a private link or payment step.',
        ],
        tips: [
          'Verify the claim through the real organisation website, not the video caption.',
          'Be extra careful with aid videos that ask you to click or share quickly.',
          'If a familiar voice asks for money unexpectedly, call the real person or office directly.',
        ],
      },
      {
        id: 'ai-scales-scams',
        title: 'Interpol says AI helps scammers write better messages and clone voices faster',
        publishedOn: '10 Feb 2026',
        source: 'The Star / Bloomberg',
        sourceHref:
          'https://www.thestar.com.my/tech/tech-news/2026/02/10/ai-helps-scam-centres-evade-crackdown-in-asia-dupe-more-victims',
        summary:
          'Interpol officials warned that AI tools now help scammers write more realistic messages, generate better fake profiles, and produce cloned voices. Older “bad grammar” clues may no longer be reliable.',
        detail:
          'This means the safest habit is not “look for spelling mistakes” anymore. The better question is whether the request itself makes sense, matches your normal contact method, and comes from a trusted verified source.',
        warningSigns: [
          'The message looks polished but still asks for urgent money, codes, or private data.',
          'A caller sounds familiar but changes the normal contact pattern.',
          'The request tries to skip your usual checking steps.',
        ],
        tips: [
          'Judge the request, not just the grammar quality.',
          'Use a second channel to confirm any urgent money request.',
          'Teach family members that a familiar voice alone is no longer enough proof.',
        ],
      },
    ],
    examples: [
      {
        id: 'ai-sms',
        title: 'Cloned-authority aid message',
        kind: 'sms',
        channelLabel: 'SMS screenshot',
        timeLabel: '12:07',
        fromLabel: 'Official Aid Broadcast',
        previewLines: [
          'A respected public figure has announced a new emergency support payout.',
          'Register now through this private link before the video is removed.',
          'Share with your family immediately so they do not miss the chance.',
        ],
        actionText: 'Register now',
        hint: 'Red flags: fame is used as proof, then the message pushes you to a private link.',
      },
      {
        id: 'ai-email',
        title: 'Polished AI-written verification email',
        kind: 'email',
        channelLabel: 'Email screenshot',
        timeLabel: '18:11',
        fromLabel: 'citizen-care@relief-office-support.net',
        subject: 'Kind reminder: confirm your support enrolment',
        previewLines: [
          'We noticed your assistance registration remains incomplete.',
          'Please complete your verification now to prevent your slot from expiring.',
          'This secure form only takes one minute to finish.',
        ],
        actionText: 'Complete verification',
        hint: 'Red flags: smooth language, fake urgency, and a support address that is not official.',
      },
    ],
  },
]

function renderCategoryIcon(icon: KnowledgeHubIcon) {
  switch (icon) {
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h16v10H4z" />
          <path d="M2.5 7.5h19v3h-19z" />
          <path d="M12 7.5V20" />
          <path d="M9 7.5c-1.8 0-3-1.2-3-2.8S7 2 8.7 2c1.3 0 2.1.8 3.3 2.6" />
          <path d="M15 7.5c1.8 0 3-1.2 3-2.8S17 2 15.3 2c-1.3 0-2.1.8-3.3 2.6" />
        </svg>
      )
    case 'bank':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 9 9-5 9 5" />
          <path d="M4.5 10.5h15" />
          <path d="M6 10.5V18" />
          <path d="M10 10.5V18" />
          <path d="M14 10.5V18" />
          <path d="M18 10.5V18" />
          <path d="M3.5 20h17" />
        </svg>
      )
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
          <path d="m5 12 4-3 4 1 5-4" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4.5 7 7.5 6 7.5-6" />
          <path d="m4.5 18 6.2-5" />
          <path d="m19.5 18-6.2-5" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 2 1.8 4.7L18.5 8l-4.7 1.3L12 14l-1.8-4.7L5.5 8l4.7-1.3L12 2Z" />
          <path d="m18 14 .9 2.3 2.1.6-2.1.6L18 20l-.9-2.3-2.1-.6 2.1-.6L18 14Z" />
          <path d="m6 14 1 2.6 2.5.7-2.5.7L6 21l-1-2.6-2.5-.7 2.5-.7L6 14Z" />
        </svg>
      )
  }
}

function ExampleMockup({
  example,
  expanded = false,
}: {
  example: KnowledgeHubExample
  expanded?: boolean
}) {
  return (
    <div
      className={
        expanded
          ? `knowledge-hub-page__example-frame knowledge-hub-page__example-frame--${example.kind} knowledge-hub-page__example-frame--expanded`
          : `knowledge-hub-page__example-frame knowledge-hub-page__example-frame--${example.kind}`
      }
    >
      <div className="knowledge-hub-page__example-window">
        <div className="knowledge-hub-page__example-bar">
          <span>{example.channelLabel}</span>
          <span>{example.timeLabel}</span>
        </div>
        <div className="knowledge-hub-page__example-header">
          <p className="knowledge-hub-page__example-from">{example.fromLabel}</p>
          {example.subject ? (
            <p className="knowledge-hub-page__example-subject">{example.subject}</p>
          ) : null}
        </div>
        <div className="knowledge-hub-page__example-body">
          {example.previewLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {example.actionText ? (
            <span className="knowledge-hub-page__example-action">{example.actionText}</span>
          ) : null}
        </div>
      </div>
      <div className="knowledge-hub-page__example-footer">
        <p className="knowledge-hub-page__example-title">{example.title}</p>
        <p className="knowledge-hub-page__example-hint">{example.hint}</p>
      </div>
    </div>
  )
}

export function AboutUsPage({ onBackHome }: AboutUsPageProps) {
  const { strings } = useI18n()
  const [selectedCategoryId, setSelectedCategoryId] = useState(knowledgeHubCategories[0].id)
  const [selectedArticleId, setSelectedArticleId] = useState(knowledgeHubCategories[0].articles[0].id)
  const [openExampleId, setOpenExampleId] = useState<string | null>(null)

  const selectedCategory =
    knowledgeHubCategories.find((category) => category.id === selectedCategoryId) ??
    knowledgeHubCategories[0]

  const selectedArticle =
    selectedCategory.articles.find((article) => article.id === selectedArticleId) ??
    selectedCategory.articles[0]

  const openExample =
    selectedCategory.examples.find((example) => example.id === openExampleId) ?? null

  const handleCategorySelect = (category: KnowledgeHubCategory) => {
    setSelectedCategoryId(category.id)
    setSelectedArticleId(category.articles[0].id)
    setOpenExampleId(null)
  }

  return (
    <main className="knowledge-hub-page" aria-label={strings.aboutUs.title}>
      <section className="knowledge-hub-page__hero">
        <p className="knowledge-hub-page__eyebrow">{strings.aboutUs.eyebrow}</p>
        <h1>{strings.aboutUs.title}</h1>
        <p className="knowledge-hub-page__description">
          A calm, readable scam library with category buttons, short explainers, and tap-to-zoom examples for older eyes.
        </p>
        <div className="knowledge-hub-page__hero-note">
          <span>Latest references in this hub were published between 10 Feb 2026 and 27 Apr 2026.</span>
        </div>
      </section>

      <section className="knowledge-hub-page__grid">
        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--categories"
          eyebrow="Step 1"
          title="Choose a scam category"
          description="Large buttons with clear icons help you open one scam pattern at a time."
          footer={
            <div className="knowledge-hub-page__overview-footer">
              <p className="knowledge-hub-page__overview-note">
                Read one topic slowly, then compare it with the screenshots below.
              </p>
              <Button variant="secondary" onClick={onBackHome}>
                {strings.common.backToHome}
              </Button>
            </div>
          }
        >
          <div className="knowledge-hub-page__category-grid" role="list" aria-label="Scam categories">
            {knowledgeHubCategories.map((category) => {
              const isActive = category.id === selectedCategory.id

              return (
                <button
                  key={category.id}
                  type="button"
                  role="listitem"
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? 'knowledge-hub-page__category-button knowledge-hub-page__category-button--active'
                      : 'knowledge-hub-page__category-button'
                  }
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="knowledge-hub-page__category-icon">{renderCategoryIcon(category.icon)}</span>
                  <span className="knowledge-hub-page__category-copy">
                    <strong>{category.label}</strong>
                    <small>{category.helper}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          className="knowledge-hub-page__card knowledge-hub-page__card--library"
          eyebrow="Step 2"
          title={selectedCategory.label}
          description={selectedCategory.helper}
        >
          <div className="knowledge-hub-page__workspace">
            <div className="knowledge-hub-page__article-list" role="list" aria-label={`${selectedCategory.label} articles`}>
              {selectedCategory.articles.map((article) => {
                const isActive = article.id === selectedArticle.id

                return (
                  <button
                    key={article.id}
                    type="button"
                    role="listitem"
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? 'knowledge-hub-page__article-card knowledge-hub-page__article-card--active'
                        : 'knowledge-hub-page__article-card'
                    }
                    onClick={() => setSelectedArticleId(article.id)}
                  >
                    <span className="knowledge-hub-page__article-date">{article.publishedOn}</span>
                    <strong className="knowledge-hub-page__article-title">{article.title}</strong>
                    <span className="knowledge-hub-page__article-summary">{article.summary}</span>
                    <span className="knowledge-hub-page__article-source">{article.source}</span>
                  </button>
                )
              })}
            </div>

            <article className="knowledge-hub-page__reader" aria-label="Selected article">
              <div className="knowledge-hub-page__reader-top">
                <p className="knowledge-hub-page__reader-eyebrow">Latest article</p>
                <h2 className="knowledge-hub-page__reader-title">{selectedArticle.title}</h2>
                <div className="knowledge-hub-page__reader-meta">
                  <span>{selectedArticle.publishedOn}</span>
                  <a
                    className="knowledge-hub-page__source-link"
                    href={selectedArticle.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read source
                  </a>
                </div>
              </div>

              <div className="knowledge-hub-page__reader-body">
                <p>{selectedArticle.summary}</p>
                <p>{selectedArticle.detail}</p>
              </div>

              <div className="knowledge-hub-page__reader-grid">
                <section className="knowledge-hub-page__reader-panel">
                  <p className="knowledge-hub-page__panel-title">Warning signs</p>
                  <ul className="knowledge-hub-page__panel-list">
                    {selectedArticle.warningSigns.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="knowledge-hub-page__reader-panel">
                  <p className="knowledge-hub-page__panel-title">Simple prevention tips</p>
                  <ul className="knowledge-hub-page__panel-list">
                    {selectedArticle.tips.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="knowledge-hub-page__examples" aria-label="Examples">
                <div className="knowledge-hub-page__examples-head">
                  <div>
                    <p className="knowledge-hub-page__examples-eyebrow">Examples</p>
                    <h3 className="knowledge-hub-page__examples-title">Real-world screenshot gallery</h3>
                  </div>
                  <p className="knowledge-hub-page__examples-note">
                    Tap any image to expand it for easier reading.
                  </p>
                </div>

                <div className="knowledge-hub-page__examples-grid" role="list">
                  {selectedCategory.examples.map((example) => (
                    <button
                      key={example.id}
                      type="button"
                      role="listitem"
                      className="knowledge-hub-page__example-button"
                      onClick={() => setOpenExampleId(example.id)}
                    >
                      <ExampleMockup example={example} />
                    </button>
                  ))}
                </div>
              </section>
            </article>
          </div>
        </SectionCard>
      </section>

      {openExample ? (
        <div className="knowledge-hub-page__modal" role="dialog" aria-modal="true" aria-label={openExample.title}>
          <button
            type="button"
            className="knowledge-hub-page__modal-backdrop"
            aria-label="Close example"
            onClick={() => setOpenExampleId(null)}
          />
          <div className="knowledge-hub-page__modal-card">
            <div className="knowledge-hub-page__modal-head">
              <div>
                <p className="knowledge-hub-page__modal-eyebrow">Expanded example</p>
                <h3 className="knowledge-hub-page__modal-title">{openExample.title}</h3>
              </div>
              <button
                type="button"
                className="knowledge-hub-page__modal-close"
                onClick={() => setOpenExampleId(null)}
              >
                Close
              </button>
            </div>
            <ExampleMockup example={openExample} expanded />
          </div>
        </div>
      ) : null}
    </main>
  )
}
