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
  byTopic: Partial<Record<Exclude<QuizTopic, 'mixed'>, { total: number; correct: number }>>
}
