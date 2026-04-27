import type { AppRoute } from '@/app/routes'
import type { ScamRiskLevel, ScamType } from '@/types/scamDetection'

export type Language = 'en' | 'ms' | 'zh'

export type HeroTitleToken = {
  id: string
  tone: 'plain' | 'highlight'
  text: string
  spaceAfter: boolean
}

export type Strings = {
  nav: Record<AppRoute, string>
  ui: {
    openMenu: string
    language: string
    languageOption: Record<Language, string>
  }
  common: {
    backToHome: string
    completed: string
    safe: string
    risky: string
  }
  footer: {
    title: string
    sourcesTitle: string
    sourcesHint: string
    aboutTitle: string
    aboutHint: string
    riskTitle: string
    riskHint: string
  }
  homeCard: {
    eyebrow: string
    title: string
    helper: string
    helperBefore: string
    helperAction: string
    helperAfter: string
  }
  siteDisclaimer: {
    consentEyebrow: string
    consentTitle: string
    consentDescription: string
    privacyTitle: string
    privacyText: string
    referenceTitle: string
    referenceText: string
    permissionText: string
    agree: string
    disagree: string
  }
  notificationTraining: {
    browserAlertLabel: string
    justNow: string
    suspiciousLabel: string
    trustedLabel: string
    sourceLabel: string
    linkLabel: string
    previewHint: string
    dismiss: string
  }
  homeFeatures: {
    scam: string
    detection: string
    simulation: string
    studyCenter: string
    support: string
    knowledgeHub: string
    open: string
    tooltips: {
      detection: string
      simulation: string
      studyCenter: string
      support: string
      knowledgeHub: string
    }
  }
  homeStats: {
    eyebrow: string
    title: string
    description: string
    cards: {
      monthlyExposure: { value: string; label: string; hint: string }
      totalLosses: { value: string; label: string; hint: string }
      gdpShare: { value: string; label: string; hint: string }
      seniorsAffected: { value: string; label: string; hint: string }
    }
    sources: string
  }
  hero: {
    titleTokens: HeroTitleToken[]
    subtitle: string
    pills: {
      detection: string
      chat: string
      senior: string
      steps: string
    }
    modules: {
      detectionTitle: string
      detectionSubtitle: string
      practiceTitle: string
      practiceSubtitle: string
      supportTitle: string
      supportSubtitle: string
    }
    video: {
      label: string
      hint: string
    }
  }
  featurePage: {
    currentFocusEyebrow: string
    currentFocusTitle: string
    currentFocusDescription: string
    nextStepEyebrow: string
    nextStepTitle: string
    supportText: string
  }
  knowledgeHub: {
    eyebrow: string
    title: string
    description: string
    missionEyebrow: string
    missionTitle: string
    missionDescription: string
    missionPoints: string[]
    teamEyebrow: string
    teamTitle: string
    teamDescription: string
    teamSupport: string
  }
  postScamSupport: {
    eyebrow: string
    title: string
    description: string
    highlights: string[]
    supportNote: string
  }
  studyCenter: {
    pageLabel: string
    eyebrow: string
    title: string
    lede: string
    step1Eyebrow: string
    step1Title: string
    step1Description: string
    step2Eyebrow: string
    step2Title: string
    step2Description: string
    chooseTopicLabel: string
    startQuiz: string
    loadingLabel: string
    questionCountLabel: string
    submitAnswer: string
    errorPickAnswer: string
    nextQuestion: string
    finishQuiz: string
    restart: string
    correct: string
    incorrect: string
    explanationTitle: string
    yourAnswerLabel: string
    correctAnswerLabel: string
    moreInfoLabel: string
    tipsTitle: string
    progressEyebrow: string
    progressTitle: string
    progressDescription: string
    pointsLabel: string
    sessionsLabel: string
    breakdownLabel: string
    emptyProgress: string
  }
  scamDetection: {
    pageLabel: string
    headerEyebrow: string
    title: string
    lede: string
    workspaceLabel: string
    step1Eyebrow: string
    step1Title: string
    step1Description: string
    step2Eyebrow: string
    step2Title: string
    step2Description: string
    clear: string
    paste: string
    analyze: string
    analyzing: string
    messageLabel: string
    messagePlaceholder: string
    wordsLabel: string
    errorEmpty: string
    errorPasteUnavailable: string
    errorPasteEmpty: string
    wordLimitExceeded: (limit: number, current: number) => string
    loadingLabel: string
    emptyState: string
    modalTitle: string
    modalText: string
    modalConfirm: string
    resultRiskLabel: string
    resultTypeLabel: string
    resultVerdictScam: string
    resultVerdictNotScam: string
    indicatorsTitle: string
    indicatorsEmpty: string
    guidanceEyebrow: string
    guidanceTitle: string
    guidanceDescription: string
    riskLabels: Record<ScamRiskLevel, string>
    typeLabels: Record<ScamType, string>
    highlightPrefixes: string[]
  }
  scamSimulation: {
    pageLabel: string
    eyebrow: string
    title: string
    lede: string
    workspaceLabel: string
    step1Eyebrow: string
    step1Title: string
    step1Description: string
    step2Eyebrow: string
    step2Title: string
    step2Description: string
    reset: string
    messagesLabel: string
    phoneDefaultTitle: string
    emptyState: string
    inputPlaceholderActive: string
    inputPlaceholderInactive: string
    composerLabel: string
    micUnsupported: string
    mic: string
    send: string
    typingLabel: string
    feedbackLabel: string
    whyTitle: string
    nextTitle: string
    performanceLabel: string
    progressEyebrow: string
    progressTitle: string
    progressDescription: string
    startScenario: (title: string) => string
    scenarioUnavailable: string
  }
}

export type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  strings: Strings
}
