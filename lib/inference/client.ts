import OpenAI from 'openai'
import type { z } from 'zod'

import {
    INFERENCE_BASE_URL,
    MAX_RETRIES,
    REQUEST_TIMEOUT_MS,
} from '../constants/inference.constants'

export type ReasoningEffort = 'high' | 'low' | 'medium'

export interface UsageTotals {
    calls: number
    inputTokens: number
    outputTokens: number
}

const totals: UsageTotals = { calls: 0, inputTokens: 0, outputTokens: 0 }

export function usageTotals(): UsageTotals {
    return { ...totals }
}

let cached: OpenAI | undefined

function client(): OpenAI {
    if (!cached) {
        const apiKey = process.env.DO_INFERENCE_API_KEY

        if (!apiKey) throw new Error('DO_INFERENCE_API_KEY is not set')

        cached = new OpenAI({
            apiKey,
            baseURL: INFERENCE_BASE_URL,
            maxRetries: MAX_RETRIES,
            timeout: REQUEST_TIMEOUT_MS,
        })
    }

    return cached
}

export function extractJson(raw: string): unknown {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const candidate = fenced ? fenced[1]! : raw
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')

    if (start === -1 || end <= start)
        throw new Error('no JSON object found in response')

    return JSON.parse(candidate.slice(start, end + 1))
}

export async function complete<T>(options: {
    maxTokens: number
    model: string
    reasoningEffort: ReasoningEffort
    schema: z.ZodType<T>
    system: string
    user: string
}): Promise<T> {
    const completion = await client().chat.completions.create({
        max_tokens: options.maxTokens,
        messages: [
            { content: options.system, role: 'system' },
            { content: options.user, role: 'user' },
        ],
        model: options.model,
        reasoning_effort: options.reasoningEffort,
    })

    totals.calls += 1
    totals.inputTokens += completion.usage?.prompt_tokens ?? 0
    totals.outputTokens += completion.usage?.completion_tokens ?? 0

    const choice = completion.choices[0]
    const content = choice?.message?.content

    if (!content) {
        throw new Error(
            `${options.model} returned no content (finish_reason: ${choice?.finish_reason ?? 'unknown'}, ` +
                `completion tokens: ${completion.usage?.completion_tokens ?? 0}). ` +
                'Reasoning models can spend the whole budget before emitting an answer — raise max_tokens.'
        )
    }

    const parsed = options.schema.safeParse(extractJson(content))

    if (!parsed.success) {
        const issues = parsed.error.issues
            .map(issue => `${issue.path.join('.')} ${issue.message}`)
            .join('; ')
        throw new Error(`${options.model} schema mismatch: ${issues}`)
    }

    return parsed.data
}
