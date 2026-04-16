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
  riskScore: number
  riskLevel: ScamRiskLevel
  scamType: ScamType
  warningTitle?: string
  summary: string
  indicators: { title: string; description: string }[]
  guidance: string[]
}

