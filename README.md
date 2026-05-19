# ScamSafe Frontend

ScamSafe is a mobile-first React frontend for a Malaysia-focused scam-awareness product. This README is intentionally based on the current codebase, not earlier proposal notes, so it only documents behavior, copy, routes, and data sources that are actually present in the frontend.

## Project background

ScamSafe can still be described as a project aligned with `UN Goal 16`, especially its themes of ethical technology, safety, and accessible digital participation. That higher-level framing is valid to keep in the README as project context.

At the same time, this README treats the frontend codebase as the source of truth for implementation details. In other words:

- project background can describe the broader purpose of ScamSafe,
- but product behavior, routes, copy, stats, storage, and data-source claims below must stay aligned with the current frontend code.

### Background overview

ScamSafe is designed as an AI-assisted scam-awareness product for older adults in Malaysia. The broader project direction emphasizes accessible protection, low cognitive load, and practical support for users who may be more vulnerable to online fraud because of limited digital confidence, urgency-based scam tactics, and trust in official-looking messages.

### Project goal

The broader project goal is to help users:

- identify suspicious messages, links, and scam patterns,
- slow down before replying, clicking, or transferring money,
- practice safer responses in a guided environment,
- and recover more confidently after scam exposure.

### Persona reference

One project persona used during design is:

- `Name:` Feng Tan
- `Age:` 65
- `Location:` Cheras, Kuala Lumpur, Malaysia
- `Background:` retired secondary school teacher with stable financial resources

This persona is background design context, not live application state.

### Design direction

- mobile-first interaction for simple phone use,
- calm and reassuring wording,
- large, clear feature entry points,
- step-by-step flows instead of dense dashboards,
- and consistent support for English, Bahasa Melayu, and Chinese users.

### Broader project research references

These sources can remain in the README as project research context. They are not all directly consumed by the frontend at runtime.

#### Population and demographics

- [OpenDOSM population by district](https://open.dosm.gov.my/data-catalogue/population_district)
- [OpenDOSM population dashboard](https://open.dosm.gov.my/dashboard/population)
- [data.gov.my crime dataset reference](https://data.gov.my/data-catalogue/crime_district)

#### Phishing and fraud references

- [OpenPhish phishing website database](https://openphish.com/phishing_database.html)
- [UNIMAS phishing dataset](https://www.fcsit.unimas.my/phishing-dataset)
- [CyberSecurity Malaysia / MyCERT fraud statistics](https://www.cybersecurity.my/portal-main/statistics-details?id=21)

#### Call and message datasets

- [Kaggle call transcript scam determinations dataset](https://www.kaggle.com/datasets/mealss/call-transcripts-scam-determinations?resource=download)
- [SMS scam detection dataset](https://github.com/vinit9638/SMS-scam-detection-dataset/blob/main/sms_scam_detection_dataset_merged_with_lang.csv)
- [SMS Spam Collection Dataset](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset)
- [SMS Spam Dataset](https://www.kaggle.com/datasets/tapakah68/spam-text-messages-dataset)

## Current product scope

- Hash-routed single-page app built with Vite, React, and TypeScript
- English, Bahasa Melayu, and Chinese UI
- Site-entry disclaimer gate before full access
- Home page with hero, video embed, feature launcher, and statistics cards
- Five primary feature pages:
  - `Scam Checker`
  - `AI Scam Chat`
  - `Test Yourself`
  - `Scam News`
  - `Get Help`
- Simulated browser-notification training and a dedicated notification-result page
- Footer information pages for `About Us`, `Data Sources`, and `Risk Guide`

## Current homepage copy and stats

The homepage and footer copy lives in `src/lib/i18n/provider.tsx`. The current English product description used by the frontend is:

`ScamSafe is a simple website that helps older adults in Malaysia check suspicious messages and stay safer online.`

The current homepage stats shown in the UI are:

- `SMS/calls` — `Telecommunication scams`
- `RM255.37m` — `Elderly fraud losses`
- `27.9%` — `Elderly online fraud cases`
- `44%` — `Losses involving age 50+`

If these values change in the UI, update both `src/lib/i18n/provider.tsx` and this README.

## Routes and page files

| Route | Page file | Purpose |
| --- | --- | --- |
| `#/` | `src/pages/home/HomePage.tsx` | Landing page and feature launcher |
| `#/scam-detection` | `src/pages/scam-detection/ScamDetectionPage.tsx` | Scam Checker text-analysis flow |
| `#/scam-simulation` | `src/pages/scam-simulation/ScamSimulationPage.tsx` | AI Scam Chat practice flow |
| `#/study-center` | `src/pages/study-center/StudyCenterPage.tsx` | Quiz and progress flow |
| `#/knowledge-hub` | `src/pages/knowledge-hub/KnowledgeHubPage.tsx` | Scam news list and detail flow |
| `#/post-scam-support` | `src/pages/post-scam-support/PostScamSupportPage.tsx` | Post-scam recovery guidance |
| `#/notification-reveal` | `src/pages/notification-reveal/NotificationRevealPage.tsx` | Notification-result learning page |
| `#/data-sources` | `src/pages/footer-info/FooterInfoPage.tsx` | Footer data-sources page |
| `#/about-us` | `src/pages/footer-info/FooterInfoPage.tsx` | Footer about page |
| `#/risk-guide` | `src/pages/footer-info/FooterInfoPage.tsx` | Footer risk-guide page |

Route constants and hash parsing live in `src/app/routes.ts`.

## Feature behavior

### Scam Checker

- File: `src/pages/scam-detection/ScamDetectionPage.tsx`
- Service: `src/services/scamDetection.ts`
- Accepts pasted or typed text and applies a `500` word limit
- Calls `POST /api/detect`
- Shows localized result cards with risk level, scam type, summary, indicators, and guidance

### AI Scam Chat

- File: `src/pages/scam-simulation/ScamSimulationPage.tsx`
- Service: `src/services/scamSimulation.ts`
- Supports one random category plus specific scam categories
- Uses:
  - `POST /api/simulate/start`
  - `POST /api/simulate/message`
  - `POST /api/simulate/quit`
- Tracks local progress in `localStorage`
- Includes optional browser speech recognition when `SpeechRecognition` or `webkitSpeechRecognition` is available

### Test Yourself

- File: `src/pages/study-center/StudyCenterPage.tsx`
- Service: `src/services/studyCenterQuiz.ts`
- Starts short quizzes with `6` questions by default
- Calls `GET /api/quiz/:slug/questions`
- Stores quiz sessions and points in `localStorage`
- Uses `src/services/studyCenterBackendAdapter.ts` for backend explanation-field alignment

### Scam News

- File: `src/pages/knowledge-hub/KnowledgeHubPage.tsx`
- Service: `src/services/scamNews.ts`
- Calls:
  - `GET /api/scam/news`
  - `GET /api/scam/news/:id`
- Shows article list, selected article detail, source link, article content, and prevention tips

### Get Help

- File: `src/pages/post-scam-support/PostScamSupportPage.tsx`
- Presents a guided recovery flow for scam situations
- The current interactive incident path is centered on transferred-money cases
- Includes Malaysian bank hotline content in-page

### Notification Training

- Hook: `src/hooks/useNotificationTraining.ts`
- Result page: `src/pages/notification-reveal/NotificationRevealPage.tsx`
- Service: `src/services/notificationTraining.ts`
- Storage: `src/lib/notification-training/storage.ts`
- Requests browser notification permission when supported
- Fetches a simulated notification scenario and stores the temporary scenario handoff in `sessionStorage`
- Opens the dedicated result page to explain whether the notification was a scam

### Footer Information Pages

- File: `src/pages/footer-info/FooterInfoPage.tsx`
- Uses translated content from `src/lib/i18n/provider.tsx`
- Renders:
  - `About ScamSafe`
  - `Data sources`
  - `Risk level guide`

## API surface used by the frontend

The frontend currently depends on these backend endpoints:

- `POST /api/detect`
- `POST /api/simulate/start`
- `POST /api/simulate/message`
- `POST /api/simulate/quit`
- `GET /api/quiz/:slug/questions`
- `GET /api/scam/news`
- `GET /api/scam/news/:id`
- `GET /api/notifications/random`
- `GET /api/notifications/:id`

`src/lib/env.ts` reads `VITE_API_BASE_URL`. If it is empty, local development can rely on same-origin `/api/...` requests through the Vite dev proxy in `vite.config.ts`.

## Browser storage and browser APIs

### Storage

- `localStorage`
  - language preference: `scamsafe_language`
  - AI Scam Chat progress: `scamsafe_simulation_performance_v1`
  - Study Center sessions: `scamsafe_study_center_sessions_v1`
  - Study Center points: `scamsafe_study_center_points_v1`
- `sessionStorage`
  - notification handoff state: `scamsafe_notification_training_last_scenario_v1`

There is currently no account-based sync for these progress records. Clearing site data or switching browser/device resets them.

### Browser APIs

- `Notification` API for notification training when supported
- `SpeechRecognition` / `webkitSpeechRecognition` for optional AI Scam Chat voice input
- `matchMedia` via `src/hooks/useMediaQuery.ts` for responsive behavior

## Data sources currently surfaced in the frontend

The footer `Data Sources` page currently references these services and sources in the UI:

### Directly connected or runtime-related

- `GROQ`
- `Neon`
- `NewsAPI`

### Reference sources shown to users

- `Call Transcripts Scam Determinations` dataset
- `SMS Spam Collection Dataset`
- `SMS Spam Dataset`
- `New Straits Times`
- `Malay Mail`
- `The Star`

### Official Malaysia reference

- `NFCC / NSRC`

These entries are assembled in `src/pages/footer-info/FooterInfoPage.tsx` and translated in `src/lib/i18n/provider.tsx`.

## Project structure

```text
public/
  apple-touch-icon.png
  favicon.png
  icon-192.png
  icon-512.png
  site.webmanifest

src/
  app/
    AppProviders.tsx        React provider extension point
    AppShell.tsx            Shared shell, header, hero, footer, nav
    routes.ts               Hash routes and navigation constants
  assets/                   Images used by the UI
  components/ui/            Shared buttons, cards, pills, icons
  hooks/
    useMediaQuery.ts
    useNotificationTraining.ts
  lib/
    env.ts                  Environment access
    i18n/                   Language provider, strings, and hooks
    notification-training/  Notification training types and storage
  pages/
    footer-info/
    home/
    knowledge-hub/
    notification-reveal/
    post-scam-support/
    scam-detection/
    scam-simulation/
    study-center/
  services/
    notificationTraining.ts
    scamDetection.ts
    scamNews.ts
    scamSimulation.ts
    studyCenterBackendAdapter.ts
    studyCenterQuiz.ts
  styles/                   Global and page-level CSS
  types/                    Shared TypeScript models
  App.tsx                   App composition root
  main.tsx                  Browser entry point

eslint.config.js            ESLint config
index.html                  Vite HTML entry
package.json                Scripts and dependencies
vercel.json                 Static-host rewrite config
vite.config.ts              Alias and dev proxy config
```

## Local development

### Install

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

Open `http://127.0.0.1:5173/`

### Common commands

```bash
npm run build
npm run preview
npm run lint
npm run format
npm run typecheck
```

## Local dev backend expectations

- The Vite dev server proxies `/api` requests to `http://localhost:8000`
- If your backend runs elsewhere, set `VITE_API_BASE_URL`
- The app uses hash routing, so static hosting should always rewrite to `index.html`

## Maintenance note

This README was rechecked against the current frontend code on `2026-05-19`. If UI copy, routes, stats, storage keys, or page ownership change, update this file to match the codebase in the same PR.
