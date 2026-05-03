import { env } from '@/lib/env'
import type { Language } from '@/lib/i18n'
import type { QuizQuestion, QuizSessionRecord, QuizTopic } from '@/types/studyCenterQuiz'

// Backend origin (set via VITE_API_BASE_URL in production).
const API_BASE = env.apiBaseUrl

const SESSIONS_KEY = 'scamsafe_study_center_sessions_v1'
const POINTS_KEY   = 'scamsafe_study_center_points_v1'

// Maps frontend QuizTopic keys → DB quiz slugs
const TOPIC_TO_SLUG: Record<Exclude<QuizTopic, 'mixed'>, string> = {
  'romance':            'romance-scams',
  'investment':         'investment-scams',
  'tech-support':       'tech-support-scams',
  'government-imposter':'government-imposters',
  'marketplace':        'marketplace-scams',
  'charity':            'charity-scams',
  'lottery-prize':      'lottery-prize-scams',
  'family-emergency':   'family-emergency-scams',
}

export const TOPIC_ORDER: Exclude<QuizTopic, 'mixed'>[] = [
  'romance',
  'investment',
  'tech-support',
  'government-imposter',
  'marketplace',
  'charity',
  'lottery-prize',
  'family-emergency',
]

export type TopicMeta = {
  topic: QuizTopic
  title: string
  description: string
}

const TOPICS: Record<Language, TopicMeta[]> = {
  en: [
    { topic: 'mixed',               title: 'Mix scams',              description: 'A short mix of common scam patterns.' },
    { topic: 'romance',             title: 'Romance scams',          description: 'Protect yourself when someone online pretends to be a lover to scam you.' },
    { topic: 'investment',          title: 'Investment scams',       description: 'Recognize offers that sound too good to be true.' },
    { topic: 'tech-support',        title: 'Tech support scams',     description: 'Avoid fake solutions for non-existent problems.' },
    { topic: 'government-imposter', title: 'Government imposters',   description: 'Know how scammers imitate governmental bodies.' },
    { topic: 'marketplace',         title: 'Marketplace scams',      description: 'Learn to avoid fake sellers and escrow tricks.' },
    { topic: 'charity',             title: 'Charity scams',          description: 'Understand how scammers pose as legitimate charities.' },
    { topic: 'lottery-prize',       title: 'Lottery / prize scams',  description: 'You cannot win a contest you did not enter.' },
    { topic: 'family-emergency',    title: 'Family emergency scams', description: 'Check urgent calls claiming a relative is in trouble.' },
  ],
  ms: [
    { topic: 'mixed',               title: 'Kuiz campuran',          description: 'Gabungan ringkas corak scam biasa.' },
    { topic: 'romance',             title: 'Scam percintaan',        description: 'Kenal pasti orang dalam talian yang berpura-pura mencintai anda.' },
    { topic: 'investment',          title: 'Scam pelaburan',         description: 'Semak tawaran yang terlalu bagus untuk dipercayai.' },
    { topic: 'tech-support',        title: 'Scam sokongan teknikal', description: 'Elakkan bantuan palsu untuk masalah yang tidak wujud.' },
    { topic: 'government-imposter', title: 'Penyamar kerajaan',      description: 'Fahami cara scammer menyamar sebagai agensi kerajaan.' },
    { topic: 'marketplace',         title: 'Scam marketplace',       description: 'Belajar elak penjual palsu dan helah bayaran.' },
    { topic: 'charity',             title: 'Scam amal',              description: 'Semak kutipan derma yang kelihatan sah.' },
    { topic: 'lottery-prize',       title: 'Scam loteri / hadiah',   description: 'Berhati-hati dengan hadiah yang anda tidak sertai.' },
    { topic: 'family-emergency',    title: 'Scam kecemasan keluarga', description: 'Sahkan panggilan mendesak tentang ahli keluarga.' },
  ],
  zh: [
    { topic: 'mixed',               title: '混合测验',       description: '常见诈骗模式的简短混合练习。' },
    { topic: 'romance',             title: '情感诈骗',       description: '识别网上假装恋爱的诈骗者。' },
    { topic: 'investment',          title: '投资诈骗',       description: '判断好到不真实的投资机会。' },
    { topic: 'tech-support',        title: '技术支持诈骗',   description: '避开针对不存在问题的假技术支持。' },
    { topic: 'government-imposter', title: '冒充政府人员',   description: '了解诈骗者如何冒充政府机构。' },
    { topic: 'marketplace',         title: '网购交易诈骗',   description: '学习避开假卖家和付款陷阱。' },
    { topic: 'charity',             title: '慈善诈骗',       description: '核实看似正规的捐款请求。' },
    { topic: 'lottery-prize',       title: '彩票 / 中奖诈骗', description: '警惕没有参加却突然中奖的消息。' },
    { topic: 'family-emergency',    title: '家庭紧急诈骗',   description: '核实声称家人出事的紧急来电。' },
  ],
}

export function getTopics(language: Language): TopicMeta[] {
  return TOPICS[language]
}

// ── API: fetch questions from backend (English only) ──────────────────────────

export async function fetchQuizQuestions(topic: QuizTopic, count = 6): Promise<QuizQuestion[]> {
  const slug = topic === 'mixed' ? 'mixed' : TOPIC_TO_SLUG[topic as Exclude<QuizTopic, 'mixed'>]
  const res  = await fetch(`${API_BASE}/api/quiz/${slug}/questions?count=${count}`)
  if (!res.ok) throw new Error(`Quiz API error: ${res.status}`)
  return res.json() as Promise<QuizQuestion[]>
}

// ── Session storage ───────────────────────────────────────────────────────────

function readSessions(): QuizSessionRecord[] {
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as QuizSessionRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(sessions: QuizSessionRecord[]) {
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getSessions(): QuizSessionRecord[] {
  return readSessions().sort((a, b) => a.completedAt - b.completedAt)
}

export function getTotalPoints(): number {
  const raw   = window.localStorage.getItem(POINTS_KEY)
  const value = raw ? Number(raw) : 0
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

function addPoints(points: number) {
  const current = getTotalPoints()
  window.localStorage.setItem(POINTS_KEY, String(current + Math.max(0, Math.floor(points))))
}

export function recordSession(record: QuizSessionRecord) {
  const sessions = readSessions()
  sessions.push(record)
  writeSessions(sessions)
  addPoints(record.pointsEarned)
}

export function buildSessionStats(sessions: QuizSessionRecord[]) {
  // Pre-seed every topic so the progress breakdown can render stable rows even
  // before the user has answered questions in each category.
  const byTopic: Record<string, { attempts: number; total: number; correct: number }> = {}
  for (const topic of TOPIC_ORDER) {
    byTopic[topic] = { attempts: 0, total: 0, correct: 0 }
  }

  sessions.forEach((session) => {
    Object.entries(session.byTopic ?? {}).forEach(([topic, stats]) => {
      if (!stats) return
      if (!byTopic[topic]) byTopic[topic] = { attempts: 0, total: 0, correct: 0 }
      byTopic[topic].attempts += 1
      byTopic[topic].total   += stats.total
      byTopic[topic].correct += stats.correct
    })
  })

  return byTopic as Record<Exclude<QuizTopic, 'mixed'>, { attempts: number; total: number; correct: number }>
}
