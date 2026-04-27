/**
 * services/scamDetection.ts
 * ─────────────────────────
 * Calls the FastAPI /api/detect endpoint backed by scam_detector.py / Groq.
 * Configure the backend URL via VITE_API_BASE_URL. When it is empty, the app
 * falls back to same-origin requests so the Vite dev proxy can handle `/api`.
 */

import { env } from '@/lib/env'
import type { Language } from '@/lib/i18n'
import type { ScamAnalysis, ScamRiskLevel, ScamType } from '@/types/scamDetection'

const API_BASE = env.apiBaseUrl

const VALID_RISK_LEVELS: ScamRiskLevel[] = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
const VALID_SCAM_TYPES: ScamType[] = ['Phishing', 'Impersonation', 'Investment Scam',
  'Lottery/Prize Scam', 'Romance Scam', 'Tech Support Scam',
  'Bank Fraud', 'Other', 'Not a scam']

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

    // Treat backend enum values as untrusted input so the result UI never crashes
    // if the model/API returns a label outside the frontend type set.
    const riskLevel: ScamRiskLevel = VALID_RISK_LEVELS.includes(data.risk_level)
      ? data.risk_level
      : 'Low'

    const scamType: ScamType = VALID_SCAM_TYPES.includes(data.scam_type)
      ? data.scam_type
      : 'Other'

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
    // Keep the page usable when the API is unavailable; the UI can still render a
    // neutral analysis state instead of failing the whole interaction.
    return {
      isScam: false,
      confidencePct: 0,
      riskScore: 0,
      riskLevel: 'Very Low',
      scamType: 'Other',
      summary: 'Analysis not available.',
      indicators: [],
      guidance: [],
    }
  }
}
