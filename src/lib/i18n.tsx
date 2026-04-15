import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { appRoutes, type AppRoute } from '@/app/routes'
import type { ScamRiskLevel, ScamType } from '@/types/scamDetection'

export type Language = 'en' | 'ms' | 'zh'

type HeroTitleToken = {
  id: string
  tone: 'plain' | 'highlight'
  text: string
  spaceAfter: boolean
}

type Strings = {
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
  homeFeatures: {
    scam: string
    detection: string
    simulation: string
    studyCenter: string
    support: string
    open: string
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
  aboutUs: {
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

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  strings: Strings
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLanguage(): Language {
  const stored = window.localStorage.getItem('scamsafe_language')
  if (stored === 'en' || stored === 'ms' || stored === 'zh') return stored

  const browserLanguage = window.navigator.language.toLowerCase()
  if (browserLanguage.startsWith('zh')) return 'zh'
  if (browserLanguage.startsWith('ms')) return 'ms'
  return 'en'
}

const STRINGS: Record<Language, Strings> = {
  en: {
    nav: {
      [appRoutes.home]: 'Home',
      [appRoutes.detection]: 'Scam Detection',
      [appRoutes.simulation]: 'Scam Simulation',
      [appRoutes.studyCenter]: 'Study Center',
      [appRoutes.support]: 'Post-Scam Support',
      [appRoutes.aboutUs]: 'About Us',
    },
    ui: {
      openMenu: 'Open navigation menu',
      language: 'Language',
      languageOption: {
        en: 'English',
        ms: 'Malay',
        zh: 'Chinese',
      },
    },
    common: {
      backToHome: 'Back to Home',
      completed: 'Completed',
      safe: 'Safe',
      risky: 'Risky',
    },
    footer: {
      title: 'References & Information',
      sourcesTitle: 'Data sources',
      sourcesHint: 'Coming soon',
      aboutTitle: 'About ScamSafe',
      aboutHint: 'Coming soon',
      riskTitle: 'Risk level guide',
      riskHint: 'Coming soon',
    },
    homeCard: {
      eyebrow: 'Professional and reliable',
      title: 'Choose a service',
      helper: 'Tap one option below to begin',
      helperBefore: 'Tap one option below to',
      helperAction: 'begin',
      helperAfter: '',
    },
    homeFeatures: {
      scam: 'Scam',
      detection: 'Detection',
      simulation: 'Simulation',
      studyCenter: 'Study Center',
      support: 'Support',
      open: 'Open',
    },
    hero: {
      titleTokens: [
        { id: 'stay-1', tone: 'plain', text: 'Stay', spaceAfter: true },
        { id: 'safe', tone: 'highlight', text: 'Safe', spaceAfter: false },
        { id: 'comma', tone: 'plain', text: ',', spaceAfter: true },
        { id: 'stay-2', tone: 'plain', text: 'Stay', spaceAfter: true },
        { id: 'confident', tone: 'highlight', text: 'Confident', spaceAfter: true },
        { id: 'in', tone: 'plain', text: 'in', spaceAfter: true },
        { id: 'the', tone: 'plain', text: 'the', spaceAfter: true },
        { id: 'digital', tone: 'plain', text: 'Digital', spaceAfter: true },
        { id: 'world', tone: 'plain', text: 'World', spaceAfter: false },
      ],
      subtitle:
        'ScamSafe is an AI-powered website that helps elderly people in Malaysia check suspicious SMS scams and copy-pasted message content from emails or chats using large text, simple steps, and calm explanations.',
      pills: {
        detection: 'Scam detection',
        chat: 'AI chat',
        senior: 'Senior-friendly',
        steps: 'Guided actions',
      },
      modules: {
        detectionTitle: 'Scam detection',
        detectionSubtitle: 'SMS and pasted message checks',
        practiceTitle: 'Practice mode',
        practiceSubtitle: 'Learn safe replies step-by-step',
        supportTitle: 'Support',
        supportSubtitle: 'Calm next steps if you are unsure',
      },
      video: {
        label: 'Tutorial video placeholder',
        hint: 'Coming soon',
      },
    },
    featurePage: {
      currentFocusEyebrow: 'Current focus',
      currentFocusTitle: 'This page is ready for the full feature flow.',
      currentFocusDescription: 'The structure is separated from the home screen, so we can build this feature as its own dedicated experience.',
      nextStepEyebrow: 'Next step',
      nextStepTitle: 'Ready for detailed UI design.',
      supportText: 'We can continue with forms, results panels, call-to-action areas, and mobile-first layouts directly inside this page.',
    },
    aboutUs: {
      eyebrow: 'About Us',
      title: 'ScamSafe',
      description: 'ScamSafe is an academic project focused on scam awareness, detection, and support for older adults.',
      missionEyebrow: 'Mission',
      missionTitle: 'Professional. Simple. Reliable.',
      missionDescription: 'We aim to make scam prevention tools more accessible and easier to understand.',
      missionPoints: [
        'Mobile-first layouts with large, readable typography.',
        'Clear actions and calm, supportive language.',
        'Practical learning and post-incident guidance.',
      ],
      teamEyebrow: 'Team',
      teamTitle: 'FIT5120 Team TM08',
      teamDescription: 'Team details can be added here when finalized.',
      teamSupport: 'This section will include team information, acknowledgements, and any required academic disclosures.',
    },
    postScamSupport: {
      eyebrow: 'Post-Scam Support',
      title: 'Get calm next-step support after a scam incident.',
      description: 'This page is prepared for recovery guidance, reporting actions, emergency contacts, and practical support after harm has already happened.',
      highlights: [
        'Show urgent steps in a calm and readable order.',
        'Provide reporting, financial, and emotional support pathways.',
        'Reduce panic by breaking recovery into simple actions.',
      ],
      supportNote: 'This area can later become a structured recovery checklist with support contacts and reporting tools.',
    },
    studyCenter: {
      pageLabel: 'Anti-Scam Study Center',
      eyebrow: 'Anti-Scam Study Center',
      title: 'Anti-Scam Study Center',
      lede: 'Take simple quizzes to learn scam patterns, get instant feedback, and track your progress.',
      step1Eyebrow: 'Step 1',
      step1Title: 'Choose a quiz',
      step1Description: 'Pick a category (or Mixed quiz), then tap “Start quiz”.',
      step2Eyebrow: 'Step 2',
      step2Title: 'Answer and learn',
      step2Description: 'Pick one answer, then tap “Submit answer” to see why.',
      chooseTopicLabel: 'Choose a category',
      startQuiz: 'Start quiz',
      loadingLabel: 'Loading…',
      questionCountLabel: 'Questions',
      submitAnswer: 'Submit answer',
      errorPickAnswer: 'Please choose one answer first.',
      nextQuestion: 'Next question',
      finishQuiz: 'Finish quiz',
      restart: 'Start again',
      correct: 'Correct',
      incorrect: 'Incorrect',
      explanationTitle: 'Explanation',
      yourAnswerLabel: 'Your answer',
      correctAnswerLabel: 'Correct answer',
      moreInfoLabel: 'More info',
      tipsTitle: 'What to do next',
      progressEyebrow: 'Progress',
      progressTitle: 'Your learning progress',
      progressDescription: 'Track quiz scores over time and by scam type. Saved on this device.',
      pointsLabel: 'Points',
      sessionsLabel: 'Scores over time',
      breakdownLabel: 'By scam type',
      emptyProgress: 'Complete a quiz to see your progress here.',
    },
    scamDetection: {
      pageLabel: 'Scam Detection',
      headerEyebrow: 'Scam Detection',
      title: 'Check a suspicious message',
      lede: 'Paste a message or SMS content and tap “Analyze Message”.',
      workspaceLabel: 'Scam detection analysis',
      step1Eyebrow: 'Step 1',
      step1Title: 'Paste or type the message',
      step1Description: 'Up to 500 words. We will show a risk level, scam type, key warning signs, and what to do next.',
      step2Eyebrow: 'Step 2',
      step2Title: 'Result',
      step2Description: 'A simple summary you can trust. If risk is high, stop and verify before doing anything.',
      clear: 'Clear',
      paste: 'Paste',
      analyze: 'Analyze Message',
      analyzing: 'Analyzing…',
      messageLabel: 'Message',
      messagePlaceholder: 'Paste or type the suspicious message here…',
      wordsLabel: 'words',
      errorEmpty: 'Please enter or paste a message to analyze',
      errorPasteUnavailable: 'Paste is not available. Please paste using your keyboard.',
      errorPasteEmpty: 'Nothing was pasted. Please copy the message again, then tap “Paste”.',
      wordLimitExceeded: (limit, current) =>
        `Word limit exceeded. Please keep your message under ${limit} words (currently ${current}).`,
      loadingLabel: 'Analyzing your message…',
      emptyState: 'Paste a suspicious message on the left, then tap “Analyze Message”.',
      modalTitle: 'High risk detected',
      modalText: 'Stop and verify before you do anything. Do not click links, do not share OTPs, and do not send money.',
      modalConfirm: 'I Understand',
      resultRiskLabel: 'Risk',
      resultTypeLabel: 'Type',
      resultVerdictScam: 'Scam',
      resultVerdictNotScam: 'Not scam',
      indicatorsTitle: 'Key warning indicators',
      indicatorsEmpty: 'No major warning indicators were found.',
      guidanceEyebrow: 'Smart guidance',
      guidanceTitle: 'What to do next',
      guidanceDescription: 'Simple steps to keep you safe.',
      riskLabels: {
        'Very Low': 'Very Low',
        Low: 'Low',
        Medium: 'Medium',
        High: 'High',
        'Very High': 'Very High',
      },
      typeLabels: {
        Phishing: 'Phishing',
        Impersonation: 'Impersonation',
        'Investment scam': 'Investment scam',
        'Prize scam': 'Prize scam',
        'Tech support scam': 'Tech support scam',
        Unknown: 'Needs review',
      },
      highlightPrefixes: ['Do not'],
    },
    scamSimulation: {
      pageLabel: 'Scam Simulation',
      eyebrow: 'Scam Simulation',
      title: 'Practice with a safe chatbot',
      lede: 'Choose one scam category, then reply as you normally would. You will get feedback at the end.',
      workspaceLabel: 'Simulation workspace',
      step1Eyebrow: 'Step 1',
      step1Title: 'Pick a category',
      step1Description: 'Choose one scam type for this practice session.',
      step2Eyebrow: 'Step 2',
      step2Title: 'Chat',
      step2Description: 'You are safe here. This is only practice.',
      reset: 'Reset',
      messagesLabel: 'Chat messages',
      phoneDefaultTitle: 'Scam Simulation',
      emptyState: 'Select a category to start. The chatbot will send the first message.',
      inputPlaceholderActive: 'Type your reply…',
      inputPlaceholderInactive: 'Pick a category first…',
      composerLabel: 'Reply composer',
      micUnsupported: 'Voice input is not supported on this device.',
      mic: 'Voice input',
      send: 'Send',
      typingLabel: 'Bot is typing',
      feedbackLabel: 'Simulation feedback',
      whyTitle: 'Why',
      nextTitle: 'What to do next',
      performanceLabel: 'Simulation performance',
      progressEyebrow: 'Progress',
      progressTitle: 'Your practice summary',
      progressDescription: 'This is stored on this device.',
      startScenario: (title) => `Start ${title}`,
      scenarioUnavailable: 'Available in English only',
    },
  },
  ms: {
    nav: {
      [appRoutes.home]: 'Laman Utama',
      [appRoutes.detection]: 'Pengesanan Penipuan',
      [appRoutes.simulation]: 'Simulasi Penipuan',
      [appRoutes.studyCenter]: 'Pusat Pembelajaran',
      [appRoutes.support]: 'Sokongan Selepas Ditipu',
      [appRoutes.aboutUs]: 'Tentang Kami',
    },
    ui: {
      openMenu: 'Buka menu navigasi',
      language: 'Bahasa',
      languageOption: {
        en: 'Bahasa Inggeris',
        ms: 'Bahasa Melayu',
        zh: 'Bahasa Cina',
      },
    },
    common: {
      backToHome: 'Kembali ke Laman Utama',
      completed: 'Selesai',
      safe: 'Selamat',
      risky: 'Berisiko',
    },
    footer: {
      title: 'Rujukan & Maklumat',
      sourcesTitle: 'Sumber data',
      sourcesHint: 'Coming soon',
      aboutTitle: 'Tentang ScamSafe',
      aboutHint: 'Coming soon',
      riskTitle: 'Panduan tahap risiko',
      riskHint: 'Coming soon',
    },
    homeCard: {
      eyebrow: 'Profesional dan boleh dipercayai',
      title: 'Pilih perkhidmatan',
      helper: 'Tekan satu pilihan di bawah untuk bermula',
      helperBefore: 'Tekan satu pilihan di bawah untuk',
      helperAction: 'bermula',
      helperAfter: '',
    },
    homeFeatures: {
      scam: 'Penipuan',
      detection: 'Pengesanan',
      simulation: 'Simulasi',
      studyCenter: 'Pusat Pembelajaran',
      support: 'Sokongan',
      open: 'Buka',
    },
    hero: {
      titleTokens: [
        { id: 'kekal', tone: 'plain', text: 'Kekal', spaceAfter: true },
        { id: 'selamat', tone: 'highlight', text: 'Selamat', spaceAfter: false },
        { id: 'comma', tone: 'plain', text: ',', spaceAfter: true },
        { id: 'kekal-2', tone: 'plain', text: 'Kekal', spaceAfter: true },
        { id: 'yakin', tone: 'highlight', text: 'Yakin', spaceAfter: true },
        { id: 'dalam', tone: 'plain', text: 'dalam', spaceAfter: true },
        { id: 'dunia', tone: 'plain', text: 'Dunia', spaceAfter: true },
        { id: 'digital', tone: 'plain', text: 'Digital', spaceAfter: false },
      ],
      subtitle:
        'ScamSafe ialah laman web berkuasa AI yang membantu warga emas di Malaysia menyemak SMS mencurigakan dan kandungan mesej yang disalin daripada emel atau chat menggunakan tulisan besar, langkah mudah, dan penjelasan yang tenang.',
      pills: {
        detection: 'Pengesanan penipuan',
        chat: 'Sembang AI',
        senior: 'Mesra warga emas',
        steps: 'Tindakan berpandu',
      },
      modules: {
        detectionTitle: 'Pengesanan penipuan',
        detectionSubtitle: 'Semakan SMS dan mesej tampal',
        practiceTitle: 'Mod latihan',
        practiceSubtitle: 'Belajar membalas dengan selamat',
        supportTitle: 'Sokongan',
        supportSubtitle: 'Langkah tenang apabila ragu',
      },
      video: {
        label: 'Ruang video tutorial',
        hint: 'Coming soon',
      },
    },
    featurePage: {
      currentFocusEyebrow: 'Fokus semasa',
      currentFocusTitle: 'Halaman ini sedia untuk aliran ciri penuh.',
      currentFocusDescription: 'Struktur ini dipisahkan daripada laman utama supaya kita boleh membina pengalaman khusus untuk ciri ini.',
      nextStepEyebrow: 'Langkah seterusnya',
      nextStepTitle: 'Sedia untuk reka bentuk UI terperinci.',
      supportText: 'Kita boleh terus bina borang, panel hasil, kawasan tindakan, dan susun atur mobile-first terus di halaman ini.',
    },
    aboutUs: {
      eyebrow: 'Tentang Kami',
      title: 'ScamSafe',
      description: 'ScamSafe ialah projek akademik yang memberi tumpuan kepada kesedaran, pengesanan, dan sokongan penipuan untuk warga emas.',
      missionEyebrow: 'Misi',
      missionTitle: 'Profesional. Mudah. Boleh dipercayai.',
      missionDescription: 'Kami mahu menjadikan alat pencegahan penipuan lebih mudah dicapai dan difahami.',
      missionPoints: [
        'Susun atur mobile-first dengan tulisan besar dan mudah dibaca.',
        'Tindakan yang jelas dan bahasa yang tenang serta menyokong.',
        'Pembelajaran praktikal dan panduan selepas insiden.',
      ],
      teamEyebrow: 'Pasukan',
      teamTitle: 'FIT5120 Team TM08',
      teamDescription: 'Maklumat pasukan boleh ditambah di sini apabila dimuktamadkan.',
      teamSupport: 'Bahagian ini akan merangkumi maklumat pasukan, penghargaan, dan sebarang pendedahan akademik yang diperlukan.',
    },
    postScamSupport: {
      eyebrow: 'Sokongan Selepas Ditipu',
      title: 'Dapatkan sokongan langkah seterusnya dengan tenang selepas insiden penipuan.',
      description: 'Halaman ini disediakan untuk panduan pemulihan, tindakan pelaporan, hubungan kecemasan, dan sokongan praktikal selepas kerugian berlaku.',
      highlights: [
        'Tunjukkan langkah penting mengikut turutan yang tenang dan mudah dibaca.',
        'Sediakan laluan pelaporan, kewangan, dan sokongan emosi.',
        'Kurangkan panik dengan memecahkan pemulihan kepada tindakan mudah.',
      ],
      supportNote: 'Ruang ini boleh menjadi senarai semak pemulihan berstruktur dengan hubungan sokongan dan alat pelaporan.',
    },
    studyCenter: {
      pageLabel: 'Pusat Pembelajaran Anti-Penipuan',
      eyebrow: 'Pusat Pembelajaran Anti-Penipuan',
      title: 'Pusat Pembelajaran Anti-Penipuan',
      lede: 'Jawab kuiz ringkas untuk belajar corak penipuan, dapat maklum balas segera, dan jejak kemajuan anda.',
      step1Eyebrow: 'Langkah 1',
      step1Title: 'Pilih kuiz',
      step1Description: 'Pilih kategori (atau Kuiz campuran), kemudian tekan “Mula kuiz”.',
      step2Eyebrow: 'Langkah 2',
      step2Title: 'Jawab dan belajar',
      step2Description: 'Pilih satu jawapan, kemudian tekan “Hantar jawapan” untuk lihat sebabnya.',
      chooseTopicLabel: 'Pilih kategori',
      startQuiz: 'Mula kuiz',
      loadingLabel: 'Sedang memuatkan…',
      questionCountLabel: 'Soalan',
      submitAnswer: 'Hantar jawapan',
      errorPickAnswer: 'Sila pilih satu jawapan dahulu.',
      nextQuestion: 'Soalan seterusnya',
      finishQuiz: 'Tamat kuiz',
      restart: 'Mula semula',
      correct: 'Betul',
      incorrect: 'Salah',
      explanationTitle: 'Penjelasan',
      yourAnswerLabel: 'Jawapan anda',
      correctAnswerLabel: 'Jawapan betul',
      moreInfoLabel: 'Maklumat tambahan',
      tipsTitle: 'Apa yang patut dibuat',
      progressEyebrow: 'Kemajuan',
      progressTitle: 'Kemajuan pembelajaran anda',
      progressDescription: 'Jejak skor kuiz dari masa ke masa dan mengikut jenis penipuan. Disimpan pada peranti ini.',
      pointsLabel: 'Mata',
      sessionsLabel: 'Skor mengikut masa',
      breakdownLabel: 'Mengikut jenis penipuan',
      emptyProgress: 'Selesaikan satu kuiz untuk melihat kemajuan di sini.',
    },
    scamDetection: {
      pageLabel: 'Pengesanan Penipuan',
      headerEyebrow: 'Pengesanan Penipuan',
      title: 'Semak mesej yang mencurigakan',
      lede: 'Tampal mesej atau kandungan SMS dan tekan “Analisis Mesej”.',
      workspaceLabel: 'Analisis pengesanan penipuan',
      step1Eyebrow: 'Langkah 1',
      step1Title: 'Tampal atau taip mesej',
      step1Description: 'Sehingga 500 perkataan. Kami akan tunjukkan tahap risiko, jenis penipuan, tanda amaran utama, dan apa yang perlu dibuat seterusnya.',
      step2Eyebrow: 'Langkah 2',
      step2Title: 'Keputusan',
      step2Description: 'Ringkasan mudah yang boleh dipercayai. Jika risikonya tinggi, berhenti dan sahkan dahulu.',
      clear: 'Kosongkan',
      paste: 'Tampal',
      analyze: 'Analisis Mesej',
      analyzing: 'Sedang menganalisis…',
      messageLabel: 'Mesej',
      messagePlaceholder: 'Tampal atau taip mesej mencurigakan di sini…',
      wordsLabel: 'perkataan',
      errorEmpty: 'Sila masukkan atau tampal mesej untuk dianalisis',
      errorPasteUnavailable: 'Fungsi tampal tidak tersedia. Sila tampal menggunakan papan kekunci anda.',
      errorPasteEmpty: 'Tiada apa yang ditampal. Sila salin mesej sekali lagi, kemudian tekan “Paste”.',
      wordLimitExceeded: (limit, current) =>
        `Had perkataan melebihi. Sila pastikan mesej kurang daripada ${limit} perkataan (kini ${current}).`,
      loadingLabel: 'Sedang menganalisis mesej anda…',
      emptyState: 'Tampal mesej mencurigakan di sebelah kiri, kemudian tekan “Analisis Mesej”.',
      modalTitle: 'Risiko tinggi dikesan',
      modalText: 'Berhenti dan sahkan sebelum anda buat apa-apa. Jangan klik pautan, jangan kongsi OTP, dan jangan hantar wang.',
      modalConfirm: 'Saya Faham',
      resultRiskLabel: 'Risiko',
      resultTypeLabel: 'Jenis',
      resultVerdictScam: 'Penipuan',
      resultVerdictNotScam: 'Bukan penipuan',
      indicatorsTitle: 'Petunjuk amaran utama',
      indicatorsEmpty: 'Tiada petunjuk amaran utama ditemui.',
      guidanceEyebrow: 'Panduan pintar',
      guidanceTitle: 'Apa yang perlu dibuat seterusnya',
      guidanceDescription: 'Langkah mudah untuk memastikan anda selamat.',
      riskLabels: {
        'Very Low': 'Sangat rendah',
        Low: 'Rendah',
        Medium: 'Sederhana',
        High: 'Tinggi',
        'Very High': 'Sangat tinggi',
      },
      typeLabels: {
        Phishing: 'Phishing',
        Impersonation: 'Penyamaran',
        'Investment scam': 'Penipuan pelaburan',
        'Prize scam': 'Penipuan hadiah',
        'Tech support scam': 'Penipuan sokongan teknikal',
        Unknown: 'Perlu disemak',
      },
      highlightPrefixes: ['Jangan'],
    },
    scamSimulation: {
      pageLabel: 'Simulasi Penipuan',
      eyebrow: 'Simulasi Penipuan',
      title: 'Berlatih dengan chatbot yang selamat',
      lede: 'Pilih satu kategori penipuan, kemudian balas seperti biasa. Anda akan menerima maklum balas pada akhir perbualan.',
      workspaceLabel: 'Ruang kerja simulasi',
      step1Eyebrow: 'Langkah 1',
      step1Title: 'Pilih kategori',
      step1Description: 'Pilih satu jenis penipuan untuk sesi latihan ini.',
      step2Eyebrow: 'Langkah 2',
      step2Title: 'Chat',
      step2Description: 'Anda selamat di sini. Ini hanyalah latihan.',
      reset: 'Set Semula',
      messagesLabel: 'Mesej chat',
      phoneDefaultTitle: 'Simulasi Penipuan',
      emptyState: 'Pilih kategori untuk mula. Chatbot akan menghantar mesej pertama.',
      inputPlaceholderActive: 'Taip balasan anda…',
      inputPlaceholderInactive: 'Pilih kategori dahulu…',
      composerLabel: 'Ruang balasan',
      micUnsupported: 'Input suara tidak disokong pada peranti ini.',
      mic: 'Input suara',
      send: 'Hantar',
      typingLabel: 'Bot sedang menaip',
      feedbackLabel: 'Maklum balas simulasi',
      whyTitle: 'Mengapa',
      nextTitle: 'Apa yang perlu dibuat seterusnya',
      performanceLabel: 'Prestasi simulasi',
      progressEyebrow: 'Kemajuan',
      progressTitle: 'Ringkasan latihan anda',
      progressDescription: 'Ini disimpan pada peranti ini.',
      startScenario: (title) => `Mula ${title}`,
      scenarioUnavailable: 'Hanya tersedia dalam Bahasa Inggeris',
    },
  },
  zh: {
    nav: {
      [appRoutes.home]: '首页',
      [appRoutes.detection]: '诈骗检测',
      [appRoutes.simulation]: '诈骗模拟',
      [appRoutes.studyCenter]: '学习中心',
      [appRoutes.support]: '事后支援',
      [appRoutes.aboutUs]: '关于我们',
    },
    ui: {
      openMenu: '打开导航菜单',
      language: '语言',
      languageOption: {
        en: '英语',
        ms: '马来语',
        zh: '中文',
      },
    },
    common: {
      backToHome: '返回首页',
      completed: '已完成',
      safe: '安全',
      risky: '风险',
    },
    footer: {
      title: '参考与说明',
      sourcesTitle: '数据来源',
      sourcesHint: 'Coming soon',
      aboutTitle: '关于 ScamSafe',
      aboutHint: 'Coming soon',
      riskTitle: '风险等级说明',
      riskHint: 'Coming soon',
    },
    homeCard: {
      eyebrow: '专业可靠',
      title: '选择服务',
      helper: '点击下方任一选项开始',
      helperBefore: '点击下方任一选项',
      helperAction: '开始',
      helperAfter: '',
    },
    homeFeatures: {
      scam: '诈骗',
      detection: '检测',
      simulation: '模拟',
      studyCenter: '学习中心',
      support: '支援',
      open: '进入',
    },
    hero: {
      titleTokens: [
        { id: 'stay-safe', tone: 'plain', text: '保持', spaceAfter: false },
        { id: 'safe', tone: 'highlight', text: '安全', spaceAfter: false },
        { id: 'comma', tone: 'plain', text: '，', spaceAfter: false },
        { id: 'stay-confident', tone: 'plain', text: '保持', spaceAfter: false },
        { id: 'confident', tone: 'highlight', text: '自信', spaceAfter: false },
        { id: 'tail', tone: 'plain', text: '畅游数字世界', spaceAfter: false },
      ],
      subtitle:
        'ScamSafe 是一款 AI 反诈网站，帮助马来西亚的老年人检查可疑诈骗短信，以及复制粘贴的邮件和聊天消息内容，采用大字显示、步骤清晰、解释安心的方式。',
      pills: {
        detection: '诈骗检测',
        chat: 'AI 聊天',
        senior: '老年友好',
        steps: '行动指引',
      },
      modules: {
        detectionTitle: '诈骗检测',
        detectionSubtitle: '短信与粘贴内容检查',
        practiceTitle: '练习模式',
        practiceSubtitle: '一步步学会安全回应',
        supportTitle: '支援',
        supportSubtitle: '不确定时的安心指引',
      },
      video: {
        label: '教学视频占位',
        hint: 'Coming soon',
      },
    },
    featurePage: {
      currentFocusEyebrow: '当前重点',
      currentFocusTitle: '此页面已准备好进入完整功能流程。',
      currentFocusDescription: '结构已经从首页独立出来，我们可以把这里做成完整的专属功能页面。',
      nextStepEyebrow: '下一步',
      nextStepTitle: '可以继续细化界面设计。',
      supportText: '我们可以直接在这个页面继续做表单、结果面板、操作区，以及移动端优先布局。',
    },
    aboutUs: {
      eyebrow: '关于我们',
      title: 'ScamSafe',
      description: 'ScamSafe 是一个专注于诈骗认知、检测与支援的学术项目，主要面向老年群体。',
      missionEyebrow: '使命',
      missionTitle: '专业、简单、可靠。',
      missionDescription: '我们的目标是让防诈工具更容易接触、更容易理解。',
      missionPoints: [
        '移动端优先布局，字体更大、更清晰。',
        '操作明确，语言平静且有支持感。',
        '提供实用学习与事后应对指引。',
      ],
      teamEyebrow: '团队',
      teamTitle: 'FIT5120 Team TM08',
      teamDescription: '团队信息可在确定后补充到这里。',
      teamSupport: '这里后续可加入团队成员、致谢以及所需的学术说明。',
    },
    postScamSupport: {
      eyebrow: '事后支援',
      title: '在诈骗事件发生后，获得冷静清晰的下一步支援。',
      description: '这个页面用于放置恢复指引、举报步骤、紧急联系人，以及已经受害后的实用支持内容。',
      highlights: [
        '用冷静、易读的顺序展示紧急处理步骤。',
        '提供举报、财务与情绪支持路径。',
        '把恢复过程拆成简单步骤，减少慌乱。',
      ],
      supportNote: '这里后续可以发展为结构化的恢复清单，包含支持联系方式与举报工具。',
    },
    studyCenter: {
      pageLabel: '反诈学习中心',
      eyebrow: '反诈学习中心',
      title: '反诈学习中心',
      lede: '通过选择题练习识别诈骗模式，获得即时反馈，并查看学习进度。',
      step1Eyebrow: '步骤 1',
      step1Title: '选择测验',
      step1Description: '选择一个类别（或混合测验），然后点击“开始测验”。',
      step2Eyebrow: '步骤 2',
      step2Title: '答题学习',
      step2Description: '选择一个答案，然后点击“提交答案”查看原因。',
      chooseTopicLabel: '选择类别',
      startQuiz: '开始测验',
      loadingLabel: '加载中…',
      questionCountLabel: '题目',
      submitAnswer: '提交答案',
      errorPickAnswer: '请先选择一个答案。',
      nextQuestion: '下一题',
      finishQuiz: '完成测验',
      restart: '重新开始',
      correct: '正确',
      incorrect: '不正确',
      explanationTitle: '解释',
      yourAnswerLabel: '你的选择',
      correctAnswerLabel: '正确答案',
      moreInfoLabel: '补充说明',
      tipsTitle: '下一步建议',
      progressEyebrow: '进度',
      progressTitle: '你的学习进度',
      progressDescription: '查看分数趋势与各诈骗类型表现。数据保存在当前设备中。',
      pointsLabel: '积分',
      sessionsLabel: '分数趋势',
      breakdownLabel: '按诈骗类型',
      emptyProgress: '完成一次测验后，这里会显示你的进度。',
    },
    scamDetection: {
      pageLabel: '诈骗检测',
      headerEyebrow: '诈骗检测',
      title: '检查可疑消息',
      lede: '粘贴一段消息或短信内容，然后点击“分析消息”。',
      workspaceLabel: '诈骗检测分析',
      step1Eyebrow: '步骤 1',
      step1Title: '粘贴或输入消息',
      step1Description: '最多 500 个单词。我们会显示风险等级、诈骗类型、关键警示，以及下一步建议。',
      step2Eyebrow: '步骤 2',
      step2Title: '结果',
      step2Description: '给你一个清晰、容易理解的总结。如果风险高，请先停止并核实。',
      clear: '清空',
      paste: '粘贴',
      analyze: '分析消息',
      analyzing: '正在分析…',
      messageLabel: '消息',
      messagePlaceholder: '把可疑消息粘贴或输入到这里…',
      wordsLabel: '词',
      errorEmpty: '请输入或粘贴一段消息再进行分析',
      errorPasteUnavailable: '当前无法使用粘贴功能，请使用键盘手动粘贴。',
      errorPasteEmpty: '没有粘贴到内容。请重新复制消息后，再点击“Paste”。',
      wordLimitExceeded: (limit, current) => `已超过字数限制。请将消息控制在 ${limit} 个词以内（当前 ${current}）。`,
      loadingLabel: '正在分析你的消息…',
      emptyState: '先在左侧粘贴一段可疑消息，然后点击“分析消息”。',
      modalTitle: '检测到高风险',
      modalText: '请先停止并核实，再进行任何操作。不要点击链接，不要提供 OTP，也不要转账。',
      modalConfirm: '我明白了',
      resultRiskLabel: '风险',
      resultTypeLabel: '类型',
      resultVerdictScam: '诈骗',
      resultVerdictNotScam: '非诈骗',
      indicatorsTitle: '关键警示信号',
      indicatorsEmpty: '没有发现明显的警示信号。',
      guidanceEyebrow: '智能指引',
      guidanceTitle: '下一步怎么做',
      guidanceDescription: '简单清晰的安全建议。',
      riskLabels: {
        'Very Low': '很低',
        Low: '低',
        Medium: '中等',
        High: '高',
        'Very High': '很高',
      },
      typeLabels: {
        Phishing: '钓鱼诈骗',
        Impersonation: '冒充诈骗',
        'Investment scam': '投资诈骗',
        'Prize scam': '中奖诈骗',
        'Tech support scam': '技术支持诈骗',
        Unknown: '需要核查',
      },
      highlightPrefixes: ['不要'],
    },
    scamSimulation: {
      pageLabel: '诈骗模拟',
      eyebrow: '诈骗模拟',
      title: '与安全聊天机器人练习',
      lede: '选择一个诈骗类别，然后像平常一样回复。对话结束后会给你反馈。',
      workspaceLabel: '模拟练习区',
      step1Eyebrow: '步骤 1',
      step1Title: '选择类别',
      step1Description: '为这次练习选择一种诈骗类型。',
      step2Eyebrow: '步骤 2',
      step2Title: '聊天',
      step2Description: '这里是安全的。这只是练习。',
      reset: '重置',
      messagesLabel: '聊天消息',
      phoneDefaultTitle: '诈骗模拟',
      emptyState: '先选择一个类别开始。聊天机器人会先发送第一条消息。',
      inputPlaceholderActive: '输入你的回复…',
      inputPlaceholderInactive: '请先选择类别…',
      composerLabel: '回复输入区',
      micUnsupported: '当前设备不支持语音输入。',
      mic: '语音输入',
      send: '发送',
      typingLabel: '机器人正在输入',
      feedbackLabel: '模拟反馈',
      whyTitle: '原因',
      nextTitle: '接下来怎么做',
      performanceLabel: '模拟表现',
      progressEyebrow: '进度',
      progressTitle: '你的练习总结',
      progressDescription: '这些数据保存在当前设备中。',
      startScenario: (title) => `开始 ${title}`,
      scenarioUnavailable: '仅支持英语',
    },
  },
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage())

  useEffect(() => {
    window.localStorage.setItem('scamsafe_language', language)
  }, [language])

  useEffect(() => {
    const html = window.document.documentElement
    html.lang = language === 'zh' ? 'zh-Hans' : language
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, strings: STRINGS[language] }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return value
}
