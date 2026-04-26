import type { QuizQuestion, QuizTopic } from '@/types/studyCenterQuiz'

// These row shapes mirror the quiz tables returned by the backend. They are kept
// separate from the UI-facing QuizQuestion type so database naming can stay
// snake_case while React components work with camelCase fields.
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

// Backend quiz slugs are public API values. Convert them once at the adapter
// boundary so the rest of the frontend can use compact topic keys.
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
    // Fail loudly for new or misspelled slugs. Silent fallback would store
    // progress under the wrong category and make the learning chart misleading.
    throw new Error(`Unknown quiz slug: ${bundle.slug}`)
  }

  const questions = (bundle.questions ?? []).map((question) => adaptBackendQuestion(topic, question))
  return { topic, questions }
}

function adaptBackendQuestion(
  topic: Exclude<QuizTopic, 'mixed'>,
  question: BackendQuestionRow & { choices: BackendChoiceRow[] },
): QuizQuestion {
  // Respect backend display_order so non-alphabetical answer ordering can be
  // authored in the database without frontend changes.
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
    // The fallback keeps malformed question data renderable in development, but
    // production content should always include exactly one correct choice.
    correctOptionId: String(correct?.id ?? options[0]?.id ?? 'a'),
    // Older quiz UI expects generic reason arrays. Backend-authored quizzes use
    // per-choice explanations instead, so these stay empty for compatibility.
    explanation: { correctReasons: [], incorrectReasons: [], tips: [] },
    choiceExplanations,
  }
}
