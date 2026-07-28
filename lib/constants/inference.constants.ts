export const INFERENCE_BASE_URL =
    process.env.DO_INFERENCE_BASE_URL ?? 'https://inference.do-ai.run/v1'

export const TRIAGE_MODEL =
    process.env.BRIEF_TRIAGE_MODEL ?? 'router:software-engineering'

export const DRAFT_MODEL = process.env.BRIEF_DRAFT_MODEL ?? 'router:writing'

export const OUTPUT_LANGUAGE = process.env.BRIEF_LANGUAGE ?? 'Turkish'

export const TRIAGE_MAX_TOKENS = 16_000

export const DRAFT_MAX_TOKENS = 16_000

export const HIGHLIGHT_TARGET = 9

export const MAX_RETRIES = 3

export const REQUEST_TIMEOUT_MS = 600_000
