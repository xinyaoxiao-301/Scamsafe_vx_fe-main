import type { KnowledgeHubCategory } from '@/pages/knowledge-hub/types'

// Keep the article library next to the page feature instead of embedding it in
// the page component. This makes the screen easier to read and safer to update.
export const knowledgeHubCategories: KnowledgeHubCategory[] = [
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
