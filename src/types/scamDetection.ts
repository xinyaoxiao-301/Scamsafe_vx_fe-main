// Shared type contracts for the scam checker feature. These labels intentionally
// stay human-readable because the backend returns the same values and the UI
// maps them directly into localized presentation labels.
export type ScamRiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'

export type ScamType =
  | 'Phishing'
  | 'Impersonation'
  | 'Investment Scam'
  | 'Lottery/Prize Scam'
  | 'Romance Scam'
  | 'Tech Support Scam'
  | 'Bank Fraud'
  | 'Other'
  | 'Not a scam'

export type ScamAnalysis = {
  isScam: boolean
  confidencePct: number
  // Derived frontend score used for visual emphasis; the API confidence remains
  // separate because confidence and severity are not the same concept.
  riskScore: number
  riskLevel: ScamRiskLevel
  scamType: ScamType
  warningTitle?: string
  summary: string
  indicators: { title: string; description: string }[]
  guidance: string[]
}
