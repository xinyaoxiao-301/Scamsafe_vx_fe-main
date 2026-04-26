// "mixed" is a picker option only. Individual questions always resolve to one
// concrete topic so progress can be grouped by scam category.
export type QuizTopic =
  | 'romance'
  | 'investment'
  | 'tech-support'
  | 'government-imposter'
  | 'marketplace'
  | 'charity'
  | 'lottery-prize'
  | 'family-emergency'
  | 'mixed'

export type QuizOption = {
  id: string
  text: string
}

export type QuizExplanation = {
  correctReasons: string[]
  incorrectReasons: string[]
  tips: string[]
}

export type QuizQuestion = {
  id: string
  topic: Exclude<QuizTopic, 'mixed'>
  prompt: string
  // Full-question explanation from the backend. Choice-level explanations are
  // preferred when available because they explain the user's exact answer.
  questionExplanation?: string | null
  options: QuizOption[]
  correctOptionId: string
  explanation: QuizExplanation
  choiceExplanations?: Partial<Record<string, string>>
}

export type QuizSessionRecord = {
  id: string
  topic: QuizTopic
  totalQuestions: number
  correctCount: number
  pointsEarned: number
  completedAt: number
  // Stores category totals for both topic quizzes and mixed quizzes. This lets
  // the progress breakdown remain useful even when the session topic is "mixed".
  byTopic: Partial<Record<Exclude<QuizTopic, 'mixed'>, { total: number; correct: number }>>
}
