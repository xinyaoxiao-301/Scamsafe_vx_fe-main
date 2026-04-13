import type { QuizQuestion, QuizTopic } from '@/types/studyCenterQuiz'

type BackendQuizRow = {
  id: number
  title: string
  description: string | null
  slug: string
  display_order: number
  is_published: boolean
  created_at: string
}

type BackendQuestionRow = {
  id: number
  quiz_id: number
  prompt: string
  explanation: string | null
  display_order: number
}

type BackendChoiceRow = {
  id: number
  question_id: number
  label: string
  explanation: string | null
  is_correct: boolean
  display_order: number
}

export type BackendQuizBundle = BackendQuizRow & {
  questions: Array<
    BackendQuestionRow & {
      choices: BackendChoiceRow[]
    }
  >
}

const SLUG_TO_TOPIC: Record<string, Exclude<QuizTopic, 'mixed'>> = {
  'romance-scams': 'romance',
  'investment-scams': 'investment',
  'tech-support-scams': 'tech-support',
  'government-imposters': 'government-imposter',
  'marketplace-scams': 'marketplace',
  'charity-scams': 'charity',
  'lottery-prize-scams': 'lottery-prize',
  'family-emergency-scams': 'family-emergency',
}

export function topicFromQuizSlug(slug: string): Exclude<QuizTopic, 'mixed'> | null {
  return SLUG_TO_TOPIC[slug] ?? null
}

export function adaptBackendQuiz(bundle: BackendQuizBundle): { topic: Exclude<QuizTopic, 'mixed'>; questions: QuizQuestion[] } {
  const topic = topicFromQuizSlug(bundle.slug)
  if (!topic) {
    throw new Error(`Unknown quiz slug: ${bundle.slug}`)
  }

  const questions = (bundle.questions ?? []).map((question) => adaptBackendQuestion(topic, question))
  return { topic, questions }
}

function adaptBackendQuestion(
  topic: Exclude<QuizTopic, 'mixed'>,
  question: BackendQuestionRow & { choices: BackendChoiceRow[] },
): QuizQuestion {
  const choices = [...(question.choices ?? [])].sort((a, b) => a.display_order - b.display_order)
  const correct = choices.find((choice) => choice.is_correct) ?? choices[0]

  const options = choices.map((choice) => ({
    id: String(choice.id),
    text: choice.label,
  }))

  const choiceExplanations: Record<string, string> = {}
  choices.forEach((choice) => {
    if (choice.explanation) {
      choiceExplanations[String(choice.id)] = choice.explanation
    }
  })

  return {
    id: `q-${question.id}`,
    topic,
    prompt: question.prompt,
    questionExplanation: question.explanation,
    options,
    correctOptionId: String(correct?.id ?? options[0]?.id ?? 'a'),
    explanation: { correctReasons: [], incorrectReasons: [], tips: [] },
    choiceExplanations,
  }
}
