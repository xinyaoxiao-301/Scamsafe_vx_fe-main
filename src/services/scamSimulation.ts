/**
 * services/scamSimulation.ts
 * ──────────────────────────
 * Frontend service layer for the scam simulation backend (scam_sim.py).
 *
 * The backend owns ALL simulation logic:
 *   - RAG seed retrieval (Upstash Vector + SentenceTransformer)
 *   - Persona/prompt generation (Groq LLaMA)
 *   - Scam escalation timing
 *   - "Fell for scam" judgement
 *   - Feedback generation
 *
 * This file only handles:
 *   1. API calls to the three simulation endpoints
 *   2. The slug → UI label map for the scenario picker
 *   3. Goodbye-phrase detection (mirrors GOODBYE_PHRASES in scam_sim.py)
 *   4. localStorage performance tracking
 *
 * API endpoints consumed:
 *   POST /api/simulate/start   → { session_id, initial_message }
 *   POST /api/simulate/message → { bot_reply, fell_for_scam, feedback }
 *   POST /api/simulate/quit    → { feedback }
 */

import type {
  ScamScenarioType,
  SimulationPerformanceRow,
  SimulationStartResult,
  SimulationMessageResult,
  SimulationQuitResult,
} from '@/types/scamSimulationTypes'
import { env } from '@/lib/env'
import type { Language } from '@/lib/i18n'

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE        = env.apiBaseUrl
const PERFORMANCE_KEY = 'scamsafe_simulation_performance_v1'

// ── Slug → UI display label ───────────────────────────────────────────────────
// Scenario slugs stay stable for the backend; the UI labels can still localize
// so progress cards and unavailable views respect the selected language.

export type ApiScenarioType = Exclude<ScamScenarioType, 'mixed-scams'>

export const API_SCENARIO_SLUGS: ApiScenarioType[] = [
  'romance-scams',
  'investment-scams',
  'tech-support-scams',
  'government-imposters',
  'marketplace-scams',
  'charity-scams',
  'lottery-prize-scams',
  'family-emergency-scams',
]

const SCENARIO_SLUGS: ScamScenarioType[] = ['mixed-scams', ...API_SCENARIO_SLUGS]

const SCENARIO_LABELS: Record<ScamScenarioType, string> = {
  'mixed-scams':            'Random Category',
  'romance-scams':          'Romance scams',
  'investment-scams':       'Investment scams',
  'tech-support-scams':     'Tech support scams',
  'government-imposters':   'Government imposters',
  'marketplace-scams':      'Marketplace scams',
  'charity-scams':          'Charity scams',
  'lottery-prize-scams':    'Lottery / prize scams',
  'family-emergency-scams': 'Family emergency scams',
}

const SCENARIO_DESCRIPTIONS: Record<ScamScenarioType, string> = {
  'mixed-scams':            'A short mix of common scam patterns.',
  'romance-scams':          'Protect yourself when someone online pretends to be a lover to scam you.',
  'investment-scams':       'Recognize offers that sound too good to be true.',
  'tech-support-scams':     'Avoid fake solutions for non-existent problems.',
  'government-imposters':   'Know how scammers imitate governmental bodies.',
  'marketplace-scams':      'Learn to avoid fake sellers and escrow tricks.',
  'charity-scams':          'Understand how scammers pose as legitimate charities.',
  'lottery-prize-scams':    'You cannot win a contest you did not enter.',
  'family-emergency-scams': 'Check urgent calls claiming a relative is in trouble.',
}

const SCENARIO_LABELS_BY_LANGUAGE: Record<Language, Record<ScamScenarioType, string>> = {
  en: SCENARIO_LABELS,
  ms: {
    'mixed-scams':            'Kategori Rawak',
    'romance-scams':          'Scam percintaan',
    'investment-scams':       'Scam pelaburan',
    'tech-support-scams':     'Scam sokongan teknikal',
    'government-imposters':   'Penyamar kerajaan',
    'marketplace-scams':      'Scam marketplace',
    'charity-scams':          'Scam amal',
    'lottery-prize-scams':    'Scam loteri / hadiah',
    'family-emergency-scams': 'Scam kecemasan keluarga',
  },
  zh: {
    'mixed-scams':            '随机类别',
    'romance-scams':          '情感诈骗',
    'investment-scams':       '投资诈骗',
    'tech-support-scams':     '技术支持诈骗',
    'government-imposters':   '冒充政府人员',
    'marketplace-scams':      '网购交易诈骗',
    'charity-scams':          '慈善诈骗',
    'lottery-prize-scams':    '彩票 / 中奖诈骗',
    'family-emergency-scams': '家庭紧急诈骗',
  },
}

const SCENARIO_DESCRIPTIONS_BY_LANGUAGE: Record<Language, Record<ScamScenarioType, string>> = {
  en: SCENARIO_DESCRIPTIONS,
  ms: {
    'mixed-scams':            'Gabungan ringkas corak scam biasa.',
    'romance-scams':          'Lindungi diri apabila seseorang dalam talian berpura-pura mencintai anda.',
    'investment-scams':       'Kenal pasti tawaran yang terlalu bagus untuk dipercayai.',
    'tech-support-scams':     'Elakkan penyelesaian palsu untuk masalah yang tidak wujud.',
    'government-imposters':   'Ketahui cara scammer menyamar sebagai badan kerajaan.',
    'marketplace-scams':      'Belajar mengelak penjual palsu dan helah escrow.',
    'charity-scams':          'Fahami cara scammer menyamar sebagai badan amal sah.',
    'lottery-prize-scams':    'Anda tidak boleh menang pertandingan yang anda tidak sertai.',
    'family-emergency-scams': 'Semak panggilan mendesak yang mendakwa ahli keluarga dalam masalah.',
  },
  zh: {
    'mixed-scams':            '常见诈骗模式的简短混合练习。',
    'romance-scams':          '学习识别网上假装恋爱的诈骗者。',
    'investment-scams':       '识别那些好到不真实的投资机会。',
    'tech-support-scams':     '避免为不存在的问题接受假技术支持。',
    'government-imposters':   '了解诈骗者如何冒充政府机构。',
    'marketplace-scams':      '学习避开假卖家和托管付款陷阱。',
    'charity-scams':          '理解诈骗者如何冒充正规慈善机构。',
    'lottery-prize-scams':    '没有参加的抽奖，不可能真的中奖。',
    'family-emergency-scams': '核实声称亲人出事的紧急来电。',
  },
}

export function getScenarioLabels(language: Language): Record<ScamScenarioType, string> {
  return SCENARIO_LABELS_BY_LANGUAGE[language]
}

export function getScenarioDescriptions(language: Language): Record<ScamScenarioType, string> {
  return SCENARIO_DESCRIPTIONS_BY_LANGUAGE[language]
}

// ── Goodbye detection ─────────────────────────────────────────────────────────
// Mirrors GOODBYE_PHRASES in scam_sim.py.
// Checked client-side so the frontend can route to /api/simulate/quit
// (success path) instead of /api/simulate/message.

const GOODBYE_PHRASES: string[] = [
  'bye', 'goodbye', 'see you', 'later', 'farewell',
  'quit', 'exit', 'stop', 'cya', 'take care', 'gotta go',
]

export function isGoodbye(text: string): boolean {
  const lower = text.trim().toLowerCase()
  return GOODBYE_PHRASES.some((phrase) => lower.includes(phrase))
}

// ── Performance tracking (localStorage) ──────────────────────────────────────

type PerformanceStore = Record<ScamScenarioType, { completed: number; safe: number; risky: number }>

function buildEmptyPerformance(): PerformanceStore {
  return Object.fromEntries(
    SCENARIO_SLUGS.map((slug) => [slug, { completed: 0, safe: 0, risky: 0 }]),
  ) as PerformanceStore
}

function readPerformance(): PerformanceStore {
  try {
    const raw = window.localStorage.getItem(PERFORMANCE_KEY)
    if (!raw) return buildEmptyPerformance()
    // Stored progress is intentionally local-only and best-effort. If future
    // versions add new scenario slugs, getPerformance fills missing rows below.
    return JSON.parse(raw) as PerformanceStore
  } catch {
    return buildEmptyPerformance()
  }
}

export function getPerformance(language: Language = 'en'): SimulationPerformanceRow[] {
  const store = readPerformance()
  const scenarioLabels = getScenarioLabels(language)
  return SCENARIO_SLUGS.map((slug) => ({
    type:      slug,
    label:     scenarioLabels[slug],
    completed: store[slug]?.completed ?? 0,
    safe:      store[slug]?.safe      ?? 0,
    risky:     store[slug]?.risky     ?? 0,
  }))
}

export function recordPerformance(type: ScamScenarioType, outcome: 'safe' | 'risky') {
  const store = readPerformance()
  if (!store[type]) store[type] = { completed: 0, safe: 0, risky: 0 }
  store[type].completed += 1
  store[type][outcome]  += 1
  window.localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(store))
}

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * Start a new simulation session for the given scenario slug.
 * Mirrors: POST /api/simulate/start  { scenario_type }
 * Returns: { session_id, initial_message }
 */
export async function startSimulationSession(
  scenarioType: ApiScenarioType,
  language: Language = 'en',
): Promise<SimulationStartResult> {
  const res = await fetch(`${API_BASE}/api/simulate/start`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ scenario_type: scenarioType, language }),
  })
  if (!res.ok) throw new Error(`Simulation start error: ${res.status}`)
  return res.json() as Promise<SimulationStartResult>
}

/**
 * Send a user message and receive the bot's reply (or fell-for-scam feedback).
 * Mirrors: POST /api/simulate/message  { session_id, message }
 * Returns: { bot_reply, fell_for_scam, feedback }
 */
export async function sendSimulationMessage(
  sessionId: string,
  message:   string,
): Promise<SimulationMessageResult> {
  const res = await fetch(`${API_BASE}/api/simulate/message`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: sessionId, message }),
  })
  if (!res.ok) throw new Error(`Simulation message error: ${res.status}`)
  return res.json() as Promise<SimulationMessageResult>
}

/**
 * End a session early — user successfully avoided the scam.
 * Mirrors: POST /api/simulate/quit  { session_id }
 * Returns: { feedback }
 */
export async function quitSimulationSession(
  sessionId: string,
): Promise<SimulationQuitResult> {
  const res = await fetch(`${API_BASE}/api/simulate/quit`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ session_id: sessionId }),
  })
  if (!res.ok) throw new Error(`Simulation quit error: ${res.status}`)
  return res.json() as Promise<SimulationQuitResult>
}
