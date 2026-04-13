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
} from '@/types/scamSimulation'
import { env } from '@/lib/env'

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE        = env.apiBaseUrl
const PERFORMANCE_KEY = 'scamsafe_simulation_performance_v1'

// ── Slug → UI display label ───────────────────────────────────────────────────
// Must match the keys in SLUG_TO_CATEGORY in scam_sim.py exactly.
// These English labels are only used in the scenario picker UI.
// ms/zh show "not available" — handled via i18n scenarioUnavailable string.

export const SCENARIO_SLUGS: ScamScenarioType[] = [
  'romance-scams',
  'investment-scams',
  'tech-support-scams',
  'government-imposters',
  'marketplace-scams',
  'charity-scams',
  'lottery-prize-scams',
  'family-emergency-scams',
]

export const SCENARIO_LABELS: Record<ScamScenarioType, string> = {
  'romance-scams':          'Romance scam',
  'investment-scams':       'Investment scam',
  'tech-support-scams':     'Tech support scam',
  'government-imposters':   'Government imposter',
  'marketplace-scams':      'Marketplace scam',
  'charity-scams':          'Charity scam',
  'lottery-prize-scams':    'Lottery / prize scam',
  'family-emergency-scams': 'Family emergency scam',
}

// ── Goodbye detection ─────────────────────────────────────────────────────────
// Mirrors GOODBYE_PHRASES in scam_sim.py.
// Checked client-side so the frontend can route to /api/simulate/quit
// (success path) instead of /api/simulate/message.

export const GOODBYE_PHRASES: string[] = [
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
    return JSON.parse(raw) as PerformanceStore
  } catch {
    return buildEmptyPerformance()
  }
}

export function getPerformance(): SimulationPerformanceRow[] {
  const store = readPerformance()
  return SCENARIO_SLUGS.map((slug) => ({
    type:      slug,
    label:     SCENARIO_LABELS[slug],
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
  scenarioType: ScamScenarioType,
): Promise<SimulationStartResult> {
  const res = await fetch(`${API_BASE}/api/simulate/start`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ scenario_type: scenarioType }),
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
