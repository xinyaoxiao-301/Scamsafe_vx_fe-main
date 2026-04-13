/**
 * services/scamDetection.ts
 * ─────────────────────────
 * Calls the FastAPI /api/detect endpoint backed by scam_detector.py / Groq.
 * Configure the backend URL via VITE_API_BASE_URL (defaults to localhost:8000).
 */

import type { Language } from '@/lib/i18n'
import type { ScamAnalysis, ScamRiskLevel, ScamType } from '@/types/scamDetection'

const API_BASE =
  (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:8000'

const VALID_RISK_LEVELS: ScamRiskLevel[] = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
const VALID_SCAM_TYPES: ScamType[] = ['Phishing', 'Impersonation', 'Investment scam', 'Prize scam', 'Tech support scam', 'Unknown']

const RISK_SCORE_MAP: Record<ScamRiskLevel, number> = {
  'Very Low': 8,
  'Low': 25,
  'Medium': 50,
  'High': 65,
  'Very High': 88,
}

export function countWords(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

export async function analyzeScamText(
  text: string,
  _language: Language = 'en',
): Promise<ScamAnalysis> {
  try {
    const res = await fetch(`${API_BASE}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: _language }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error((body as { detail?: string }).detail ?? `Server error ${res.status}`)
    }

    const data = await res.json()

    const riskLevel: ScamRiskLevel = VALID_RISK_LEVELS.includes(data.risk_level)
      ? data.risk_level
      : 'Low'

    const scamType: ScamType = VALID_SCAM_TYPES.includes(data.scam_type)
      ? data.scam_type
      : 'Unknown'

    return {
      isScam: data.is_scam,
      confidencePct: Math.round(data.confidence_percentage),
      riskScore: RISK_SCORE_MAP[riskLevel],
      riskLevel,
      scamType,
      summary: data.summary,
      indicators: (data.warning_indicators ?? []).map((title: string) => ({ title, description: '' })),
      guidance: data.action_steps ?? [],
    }
  } catch {
    return {
      isScam: false,
      confidencePct: 0,
      riskScore: 0,
      riskLevel: 'Very Low',
      scamType: 'Unknown',
      summary: 'Analysis not available.',
      indicators: [],
      guidance: [],
    }
  }
}