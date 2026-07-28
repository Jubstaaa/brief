import { Command } from 'commander'
import { consola } from 'consola'
import OpenAI from 'openai'

import {
    DRAFT_MAX_TOKENS,
    INFERENCE_BASE_URL,
} from '../lib/constants/inference.constants'
import { findRepo } from '../lib/constants/repos.constants'
import { fetchPullDetail } from '../lib/github/pulls'
import { extractJson } from '../lib/inference/client'
import { DRAFT_SYSTEM, draftUser } from '../lib/inference/prompts/draft.prompt'
import { draftItemSchema } from '../lib/schemas/draft.schema'
import type { PullDetail } from '../lib/types/brief.types'

interface Candidate {
    model: string
    reasoningEffort?: 'high' | 'low' | 'medium'
}

interface Sample {
    detail: PullDetail
    kind: string
    reason: string
}

const CANDIDATES: Candidate[] = [
    { model: 'router:writing', reasoningEffort: 'medium' },
    { model: 'llama-4-maverick' },
    { model: 'llama3.3-70b-instruct' },
    { model: 'deepseek-4-flash' },
    { model: 'alibaba-qwen3-32b' },
    { model: 'mistral-3-14B' },
    { model: 'gemma-4-31B-it' },
    { model: 'openai-gpt-oss-120b', reasoningEffort: 'medium' },
]

const SAMPLES: { kind: string; pr: number; reason: string; repo: string }[] = [
    {
        kind: 'feature',
        pr: 96150,
        reason: 'new config flag teams can turn on themselves',
        repo: 'next.js',
    },
    {
        kind: 'fix',
        pr: 37030,
        reason: 'removes a false hydration warning teams were working around',
        repo: 'react',
    },
    {
        kind: 'fix',
        pr: 96173,
        reason: 'fixes a leak teams hit when clients disconnect mid-response',
        repo: 'next.js',
    },
]

interface Result {
    codeLang: string | null
    error: string | null
    hasCode: boolean
    headline: string | null
    inputTokens: number
    model: string
    ms: number
    outputTokens: number
    pr: number
    raw: string | null
    schemaOk: boolean
    text: string | null
}

async function callModel(
    client: OpenAI,
    candidate: Candidate,
    sample: Sample
): Promise<Result> {
    const base: Result = {
        codeLang: null,
        error: null,
        hasCode: false,
        headline: null,
        inputTokens: 0,
        model: candidate.model,
        ms: 0,
        outputTokens: 0,
        pr: sample.detail.number,
        raw: null,
        schemaOk: false,
        text: null,
    }

    const started = performance.now()

    try {
        const completion = await client.chat.completions.create({
            max_tokens: DRAFT_MAX_TOKENS,
            messages: [
                { content: DRAFT_SYSTEM, role: 'system' },
                {
                    content: draftUser(
                        { kind: sample.kind, reason: sample.reason },
                        sample.detail
                    ),
                    role: 'user',
                },
            ],
            model: candidate.model,
            ...(candidate.reasoningEffort
                ? { reasoning_effort: candidate.reasoningEffort }
                : {}),
        })

        base.ms = Math.round(performance.now() - started)
        base.inputTokens = completion.usage?.prompt_tokens ?? 0
        base.outputTokens = completion.usage?.completion_tokens ?? 0

        const content = completion.choices[0]?.message?.content ?? null
        base.raw = content

        if (!content) {
            base.error = `no content (finish_reason: ${completion.choices[0]?.finish_reason ?? '?'})`
            return base
        }

        const parsed = draftItemSchema.safeParse(extractJson(content))

        if (!parsed.success) {
            base.error = parsed.error.issues
                .map(issue => `${issue.path.join('.')} ${issue.message}`)
                .join('; ')
            return base
        }

        base.schemaOk = true
        base.headline = parsed.data.headline
        base.hasCode = Boolean(parsed.data.code)
        base.codeLang = parsed.data.code?.lang ?? null
        base.text = [
            `headline: ${parsed.data.headline}`,
            `detail:   ${parsed.data.detail}`,
            `action:   ${parsed.data.action}`,
            parsed.data.code
                ? `code(${parsed.data.code.lang}):\n${parsed.data.code.snippet}`
                : 'code:     null',
        ].join('\n')
    } catch (error) {
        base.ms = Math.round(performance.now() - started)
        base.error = error instanceof Error ? error.message : String(error)
    }

    return base
}

new Command()
    .name('bench-models')
    .description('Compare candidate draft models on real pull requests')
    .option('--only <models>', 'comma-separated subset of models to run')
    .action(async options => {
        const apiKey = process.env.DO_INFERENCE_API_KEY

        if (!apiKey) throw new Error('DO_INFERENCE_API_KEY is not set')

        const client = new OpenAI({
            apiKey,
            baseURL: INFERENCE_BASE_URL,
            maxRetries: 4,
            timeout: 600_000,
        })

        const only = options.only
            ? new Set(String(options.only).split(','))
            : undefined

        const candidates = only
            ? CANDIDATES.filter(candidate => only.has(candidate.model))
            : CANDIDATES

        consola.start(`fetching ${SAMPLES.length} pull requests`)

        const samples: Sample[] = []

        for (const entry of SAMPLES) {
            const config = findRepo(entry.repo)

            if (!config) throw new Error(`unknown repo ${entry.repo}`)

            samples.push({
                detail: await fetchPullDetail(config, entry.pr),
                kind: entry.kind,
                reason: entry.reason,
            })
        }

        for (const sample of samples) {
            consola.info(
                `${sample.detail.label}#${sample.detail.number} — ${sample.detail.title}`
            )
        }

        const results: Result[] = []

        for (const candidate of candidates) {
            for (const sample of samples) {
                const result = await callModel(client, candidate, sample)
                results.push(result)
                await new Promise(resolve => setTimeout(resolve, 3_000))

                consola.log(
                    `\n${'='.repeat(72)}\n${candidate.model}  #${result.pr}  ` +
                        `${result.ms}ms  ${result.outputTokens} out  ` +
                        `schema=${result.schemaOk}\n${'='.repeat(72)}`
                )

                if (result.error) consola.error(result.error)
                if (result.raw && !result.schemaOk)
                    consola.log(`raw:\n${result.raw.slice(0, 1200)}`)
                if (result.text) consola.log(result.text)
            }
        }

        consola.log(`\n\n${'#'.repeat(72)}\nSUMMARY\n${'#'.repeat(72)}`)

        for (const candidate of candidates) {
            const mine = results.filter(r => r.model === candidate.model)
            const ok = mine.filter(r => r.schemaOk)
            const avgMs = mine.length
                ? Math.round(mine.reduce((s, r) => s + r.ms, 0) / mine.length)
                : 0
            const avgOut = mine.length
                ? Math.round(
                      mine.reduce((s, r) => s + r.outputTokens, 0) / mine.length
                  )
                : 0

            consola.log(
                `${candidate.model.padEnd(28)} schema ${ok.length}/${mine.length}  ` +
                    `avg ${String(avgMs).padStart(6)}ms  ` +
                    `avg ${String(avgOut).padStart(5)} out  ` +
                    `code ${mine.filter(r => r.hasCode).length}/${mine.length}` +
                    (mine[0]?.error
                        ? `  err: ${mine[0].error.slice(0, 60)}`
                        : '')
            )
        }
    })
    .parseAsync()
    .catch(error => {
        consola.error(error)
        process.exit(1)
    })
