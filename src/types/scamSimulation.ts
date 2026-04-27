/**
 * Shared types for the scam simulation feature.
 * Consumed by services/scamSimulation.ts and ScamSimulationPage.tsx.
 */

// Scenario slugs.
// Note: 'mixed-scams' is a UI-only picker option. It never gets sent to the API.
export type ScamScenarioType =
  | 'mixed-scams'
  | 'romance-scams'
  | 'investment-scams'
  | 'tech-support-scams'
  | 'government-imposters'
  | 'marketplace-scams'
  | 'charity-scams'
  | 'lottery-prize-scams'
  | 'family-emergency-scams'

// Chat messages rendered in the phone UI.
export type SimulationMessage = {
  id: string
  from: 'user' | 'bot'
  text: string
  timestamp: number
}

// One row in the performance summary table.
export type SimulationPerformanceRow = {
  type: ScamScenarioType
  label: string
  completed: number
  safe: number
  risky: number
}

/** POST /api/simulate/start */
export type SimulationStartResult = {
  session_id: string
  initial_message: string
}

/** POST /api/simulate/message */
export type SimulationMessageResult = {
  bot_reply: string | null
  fell_for_scam: boolean
  session_ended: boolean
  feedback: string | null
}

/** POST /api/simulate/quit */
export type SimulationQuitResult = {
  feedback: string
}
