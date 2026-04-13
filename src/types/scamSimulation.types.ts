/**
 * types/scamSimulation.ts
 * ───────────────────────
 * Shared types for the scam simulation feature.
 * Consumed by services/scamSimulation.ts and ScamSimulationPage.tsx.
 */

// Scenario slugs — must match SLUG_TO_CATEGORY keys in scam_sim.py
export type ScamScenarioType =
  | 'romance-scams'
  | 'investment-scams'
  | 'tech-support-scams'
  | 'government-imposters'
  | 'marketplace-scams'
  | 'charity-scams'
  | 'lottery-prize-scams'
  | 'family-emergency-scams'

// Chat messages rendered in the phone UI
export type SimulationMessage = {
  id:        string
  from:      'user' | 'bot'
  text:      string
  timestamp: number
}

// One row in the performance summary table
export type SimulationPerformanceRow = {
  type:      ScamScenarioType
  label:     string        // English display label from SCENARIO_LABELS
  completed: number
  safe:      number
  risky:     number
}

// ── API response shapes (matching scam_sim.py exactly) ────────────────────────

/** POST /api/simulate/start */
export type SimulationStartResult = {
  session_id:      string
  initial_message: string
}

/** POST /api/simulate/message */
export type SimulationMessageResult = {
  bot_reply:     string
  fell_for_scam: boolean
  feedback:      string | null
}

/** POST /api/simulate/quit */
export type SimulationQuitResult = {
  feedback: string
}
