function usdPerMtok(variable: string): number | undefined {
    const raw = process.env[variable]

    if (!raw) return undefined

    const parsed = Number(raw)

    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(
            `${variable} must be a non-negative number, got "${raw}"`
        )
    }

    return parsed
}

export const INFERENCE_BASE_URL =
    process.env.DO_INFERENCE_BASE_URL ?? 'https://inference.do-ai.run/v1'

// DO model access keys are per-model allowlists since 2026-08-11; this key
// grants llama-4-maverick and kimi-k2.5 only. Cheap+fast model triages, the
// stronger one drafts.
export const TRIAGE_MODEL = process.env.BRIEF_TRIAGE_MODEL ?? 'llama-4-maverick'

export const DRAFT_MODEL = process.env.BRIEF_DRAFT_MODEL ?? 'kimi-k2.5'

export const OUTPUT_LANGUAGE = process.env.BRIEF_LANGUAGE ?? 'Turkish'

export const TRIAGE_MAX_TOKENS = 8_000

// kimi-k2.5 caps non-streaming completions at 9k tokens on DO inference.
export const DRAFT_MAX_TOKENS = 9_000

export const HIGHLIGHTS_PER_REPO = 6

export const MAX_RETRIES = 3

export const REQUEST_TIMEOUT_MS = 600_000

export const MAX_CODE_BLOCKS = 3

export const INPUT_USD_PER_MTOK = usdPerMtok('BRIEF_INPUT_USD_PER_MTOK')

export const OUTPUT_USD_PER_MTOK = usdPerMtok('BRIEF_OUTPUT_USD_PER_MTOK')
