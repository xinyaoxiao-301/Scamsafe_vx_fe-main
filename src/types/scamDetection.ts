// Labels are intentionally human-readable because the backend/model returns
// these exact strings and the UI maps them directly to localized display labels.
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
