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
    brandLabel: string
    primaryNavigation: string
    statsLabel: string
    heroIntroductionLabel: string
    heroTaglineLabel: string
    homeMainLabel: string
    tutorialVideoLabel: string
    keyStatisticsLabel: string
    footerLabel: string
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
    sourcesLead: string
    sourcesItems: string[]
    aboutTitle: string
    aboutLead: string
    aboutPoints: string[]
    aboutTags: string[]
    riskTitle: string
    riskLead: string
    riskItems: Array<{
      label: string
      text: string
    }>
    imageCreditLabel: string
    imageCreditText: string
  }
  homeCard: {
    pageLabel: string
    launchpadLabel: string
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
    exitTitle: string
    exitDescription: string
    returnToNotice: string
  }
  notificationTraining: {
    browserAlertLabel: string
    justNow: string
    suspiciousLabel: string
    trustedLabel: string
    messageLabel: string
    scopeNote: string
    previewHint: string
    popupLabel: string
    previewLabel: string
    practiceAlertName: string
    checkCarefullyTitle: string
    todayLabel: string
    open: string
    dismiss: string
    dismissedScamTitle: string
    dismissedScamDescription: string
    dismissedScamConfirm: string
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
    keywords?: string
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
    newsSectionLabel: string
    liveFeedEyebrow: string
    latestReportsTitle: string
    latestReportsDescription: string
    readingNote: string
    chooseNote: string
    loadingNews: string
    newsErrorPrefix: string
    noNews: string
    newsArticlesLabel: string
    selectedArticleLabel: string
    step1Eyebrow: string
    chooseArticleTitle: string
    chooseArticleDescription: string
    loadingArticle: string
    articleDetailEyebrow: string
    readSource: string
    tipsTitle: string
    chooseAnotherArticle: string
  }
  postScamSupport: {
    eyebrow: string
    title: string
    description: string
    highlights: string[]
    supportNote: string
    startCardEyebrow: string
    startCardTitle: string
    startCardDescription: string
    startButton: string
    quickGuideLabel: string
    quickSteps: Array<{ title: string; text: string }>
    trackerEyebrow: string
    trackerTitle: string
    trackerDescription: string
    selectedCaseLabel: string
    selectedCaseText: string
    recoveryStepsLabel: string
    statusDone: string
    statusActive: string
    statusLocked: string
    currentAction: string
    reviewNote: string
    completeNote: string
    confirmLabel: string
    nextStepButton: string
    emergencySide: {
      policeTitle: string
      policeText: string
      bankTitle: string
      bankText: string
      lossTitle: string
      lossText: string
    }
    emergencyPanelTitle: string
    emergencyCallLabel: string
    tapCall997: string
    first997Label: string
    first997Text: string
    tapToCallNow: string
    completedEyebrow: string
    completedTitle: string
    completedDescription: string
    finalNote: string
    otherBankName: string
    otherBankInstruction: string
    steps: Array<{
      key: 'stop-money' | 'freeze-bank' | 'secure-accounts' | 'file-report'
      label: string
      eyebrow: string
      title: string
      description: string
      actionLabel?: string
      actionHref?: string
      emergencyTitle?: string
      emergencyLines?: string[]
      extraTitle?: string
      extraDescription?: string
      checklistTitle?: string
      checklist?: string[]
      evidenceTitle?: string
      evidenceItems?: string[]
      semakMuleTitle?: string
      semakMuleDescription?: string
      semakMuleHref?: string
      semakMuleLabel?: string
    }>
  }
  notificationReveal: {
    pageLabel: string
    trainingResultLabel: string
    eyebrow: string
    noAlertTitle: string
    noAlertDescription: string
    loadingTitle: string
    unavailableTitle: string
    unavailableDescription: string
    loadError: string
    heroEyebrow: string
    observedEyebrow: string
    messageBadge: string
    reasonsEyebrow: string
    explanationsLabel: string
    scam: {
      title: string
      summary: string
      cardDescription: string
      reasonsTitle: string
      reasonsDescription: string
      actionLabel: string
      verdictLabel: string
    }
    safe: {
      title: string
      summary: string
      cardDescription: string
      reasonsTitle: string
      reasonsDescription: string
      actionLabel: string
      verdictLabel: string
    }
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
    loadingStateLabel: string
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
    progressShowCategories: string
    progressHideCategories: string
    progressLockedNote: string
    showSpecificTopics: string
    hideSpecificTopics: string
    questionProgressLabel: string
    answerOptionsLabel: string
    feedbackAriaLabel: string
    unavailableMalay: string
    unavailableChinese: string
    errorNoQuestions: string
    errorLoadQuestions: string
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
    resultTagsLabel: string
    resultVerdictScam: string
    resultVerdictNotScam: string
    indicatorsTitle: string
    indicatorsEmpty: string
    guidanceEyebrow: string
    guidanceTitle: string
    guidanceDescription: string
    riskLabels: Record<ScamRiskLevel, string>
    typeLabels: Record<ScamType, string>
    riskBoxLabel: (riskLabel: string) => string
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
    progressShowCategories: string
    progressHideCategories: string
    showSpecificScenarios: string
    hideSpecificScenarios: string
    safeQuitFeedback: string
    riskyOutcomeTitle: string
    safeOutcomeTitle: string
    reportHeading: string
    returnToTop: string
    startScenario: (title: string) => string
    scenarioUnavailable: string
  }
}

export type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  strings: Strings
}
