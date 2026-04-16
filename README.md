# ScamSafe

## Project Description

### UN Goal 16: Promoting Ethical Tech & Digital Rights

#### Overview

ScamSafe is an AI-powered scam detection and prevention website designed to protect older adults in Malaysia. The project focuses on ethical technology, digital rights, and accessible protection for users who may face a higher risk of online fraud because of limited digital literacy and age-related vulnerability.

#### Problem Statement

In the digital age, online scams are becoming increasingly common. Research shows that 74% of adults face scams monthly through phone calls, social media, and text messages. The *State of Scam Report 2024* reports that scam victims in Malaysia suffer total losses of RM54.02 billion, which is equivalent to around 3% of the nation's GDP (Global Anti-Scam Alliance, 2024).

Older adults in Malaysia aged 60 and above account for 83.7% of scam victims because of lower digital literacy and age-related cognitive decline (Saifuddin et al., 2024). Although many websites can detect malicious websites, only a small number of tools are designed to detect scams in ways that specifically support elderly users. ScamSafe responds to this gap by proposing an AI-powered scam detection and prevention website tailored to this audience.

#### Project Goal

The goal of ScamSafe is to create a simplified and trustworthy tool that helps elderly users:

- identify suspicious messages, links, and scam patterns,
- protect their financial independence,
- make safer decisions without needing advanced technical knowledge,
- and maintain dignity by avoiding shame, embarrassment, or dependence when facing suspicious situations.

#### Persona

**Name:** Feng Tan  
**Age:** 65  
**Location:** Cheras, Kuala Lumpur, Malaysia  
**Occupation:** Retired Secondary School Teacher with stable financial resources

##### Lifestyle and Behavior

- Lives with his wife while his children work in Singapore, which increases social isolation and his trust in friendly strangers.
- Uses WhatsApp and Facebook daily, but is not confident with digital security or device protection.
- Is highly responsive to messages that appear official, especially from authorities such as the police or bank representatives (Saifuddin et al., 2024).

##### Pain Points

- Stable savings and reliable income make him a prime target for investment and impersonation scams.
- Age-related decline in memory and decision-making makes it harder to identify inconsistencies in sophisticated scam scripts.
- Older victims often face significantly higher financial losses per incident than other age groups (New Straits Times, 2025).

##### Goals and Motivations

- Protect lifetime savings and maintain financial independence.
- Review suspicious content with a simple tool that does not require advanced technical skills.
- Defend himself independently while avoiding the shame or embarrassment of being defrauded.

#### Open Data and Datasets

##### Population and Demographics

- [OpenDOSM population by district](https://open.dosm.gov.my/data-catalogue/population_district)
- [OpenDOSM population dashboard](https://open.dosm.gov.my/dashboard/population)
- [data.gov.my crime dataset reference](https://data.gov.my/data-catalogue/crime_district)
  Note: this is useful for district-level context, but it is not an online scam dataset.

##### Phishing and Fraud Sources

- [OpenPhish phishing website database](https://openphish.com/phishing_database.html)
- [UNIMAS phishing dataset](https://www.fcsit.unimas.my/phishing-dataset)
- [CyberSecurity Malaysia / MyCERT fraud statistics](https://www.cybersecurity.my/portal-main/statistics-details?id=21)
  Note: the fraud statistics currently extend only to 2024.

##### Call and Message Datasets

- [Kaggle call transcript scam determinations dataset](https://www.kaggle.com/datasets/mealss/call-transcripts-scam-determinations?resource=download)
- [SMS scam detection dataset](https://github.com/vinit9638/SMS-scam-detection-dataset/blob/main/sms_scam_detection_dataset_merged_with_lang.csv)

#### Key Design Direction

- Build for mobile first because the primary interaction flow should be simple, direct, and easy to navigate on a phone.
- Prioritize clarity, reassurance, and low cognitive load for older adults.
- Extend the same interface for desktop later without turning it into a separate product experience.

## Technical Overview

Tech stack: Vite + React + TypeScript with ESLint and Prettier configured.

This project is organized as a mobile-first frontend scaffold with tablet and desktop expansion paths prepared from the start.

### Current structure

```text
src/
  app/            Application shell
  assets/         Static assets
  components/     Shared UI and layout pieces
  components/layout/
  components/ui/  Reusable UI components
  hooks/          Shared React hooks
  lib/            Shared helpers and utilities
  pages/home/     Page-level content
  services/       API calls and data access
  styles/         Global styles and design tokens
  types/          Shared TypeScript types
  App.tsx         Top-level app composition
  main.tsx        React mount entry
```

### Responsive rules

- Start with mobile layouts first and make sure widths between 360px and 430px feel solid.
- At `768px` and above, add wider spacing and two-column layouts for tablets and smaller desktops.
- At `1200px` and above, switch to stronger desktop layouts with separated content zones.
- Keep shared colors, spacing, and breakpoints in `src/styles/tokens.css`.
- Build page structure in `src/pages/home/HomePage.tsx` first and extract reusable pieces into `src/components/ui/`.

### Already prepared

- Frontend runtime setup
- Application provider entry
- Application shell and page entry
- Mobile-first style baseline
- Tablet and desktop breakpoints
- Environment config entry
- Reusable card, button, and status pill components
- Extendable homepage scaffold
- Starter folders for assets, hooks, services, shared utilities, and shared types

### Intentionally not added yet

- Routing
- API wrappers
- State management
- Test framework

These are not missing by mistake. They are intentionally left out to keep the scaffold light at this stage. Add them later when the real page flow becomes clear.

### Study Center (Quiz) backend notes

The frontend “Anti-Scam Study Center” page is designed to work with a backend schema where:

- `questions.explanation` is an optional overall note shown after answering
- `choices.explanation` is the per-choice explanation (why that choice is correct/incorrect)
- `choices.is_correct` determines the correct answer (enforced by a unique index in the DB)

The UI is already prepared to display:

- “Your answer” explanation (from the selected choice)
- “Correct answer” explanation (shown when the user is wrong)
- Optional “More info” (from `questions.explanation`)

Adapter helpers live in `src/services/studyCenterBackendAdapter.ts`.

### Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd install
npm.cmd run dev
```

### Common commands

```bash
npm run build
npm run preview
npm run lint
npm run format
npm run typecheck
```

## License and Academic Use

This repository is part of the ScamSafe academic project developed by Team TM08 for FIT5120 at Monash University.

Project team: `Team TM08`  
Student authors: `Vaibhavi Vijayakumar`, `Zheng Sun`, `Huanheng Luo`, `Yanchen Geng`, `Xinyao Xiao`

- Copyright in the original project materials is held by Team TM08 unless otherwise stated.
- The deployed ScamSafe website may be publicly accessible for demonstration, academic presentation, portfolio review, and related project purposes for at least six months.
- Public access to the website does not grant reuse, redistribution, commercial, or derivative rights over the source code, design assets, documentation, or other protected project materials.
- Monash University staff and authorized academic reviewers may access and evaluate the project for academic, administrative, and record-keeping purposes.
- No open-source license is granted for this repository.
- Third-party datasets, libraries, and external resources remain subject to their own licenses and terms.

For the full licensing terms, see [LICENSE](/Users/swenson/Downloads/FIT5120%20IE/Real_project/ScamSafe/LICENSE). For a short-form project notice, see [NOTICE](/Users/swenson/Downloads/FIT5120%20IE/Real_project/ScamSafe/NOTICE).

last update 17/04/2026 2:42am
