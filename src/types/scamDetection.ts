export type ScamRiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'

export type ScamType =
  | 'Phishing'
  | 'Impersonation'
  | 'Investment scam'
  | 'Prize scam'
  | 'Tech support scam'
  | 'Unknown'

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

