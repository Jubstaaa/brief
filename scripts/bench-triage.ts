import { consola } from 'consola'
import OpenAI from 'openai'

import {
    INFERENCE_BASE_URL,
    TRIAGE_MAX_TOKENS,
} from '../lib/constants/inference.constants'
import { findRepo, REPOS } from '../lib/constants/repos.constants'
import { fetchCommits } from '../lib/github/commits'
import { extractJson } from '../lib/inference/client'
import {
    TRIAGE_SYSTEM,
    triageUser,
} from '../lib/inference/prompts/triage.prompt'
import { repoTriageSchema } from '../lib/schemas/triage.schema'
import { resolveWindow } from '../lib/utils/window'

const CANDIDATES: { model: string; reasoningEffort?: 'low' | 'medium' }[] = [
    { model: 'router:software-engineering', reasoningEffort: 'low' },
    { model: 'gemma-4-31B-it' },
    { model: 'deepseek-4-flash' },
    { model: 'llama-4-maverick' },
]

const client = new OpenAI({
    apiKey: process.env.DO_INFERENCE_API_KEY,
    baseURL: INFERENCE_BASE_URL,
    maxRetries: 4,
    timeout: 600_000,
})

const briefWindow = resolveWindow(new Date())
consola.info(`window ${briefWindow.since} -> ${briefWindow.until}`)

const repos = []

for (const config of REPOS) {
    const result = await fetchCommits(
        config,
        briefWindow.since,
        briefWindow.until
    )
    consola.info(`${result.label}: ${result.kept.length} kept`)
    repos.push(result)
}

for (const candidate of CANDIDATES) {
    for (const repo of repos) {
        const started = performance.now()

        try {
            const completion = await client.chat.completions.create({
                max_tokens: TRIAGE_MAX_TOKENS,
                messages: [
                    { content: TRIAGE_SYSTEM, role: 'system' },
                    {
                        content: triageUser(
                            repo,
                            findRepo(repo.label)?.title ?? repo.label
                        ),
                        role: 'user',
                    },
                ],
                model: candidate.model,
                ...(candidate.reasoningEffort
                    ? { reasoning_effort: candidate.reasoningEffort }
                    : {}),
            })

            const ms = Math.round(performance.now() - started)
            const content = completion.choices[0]?.message?.content ?? ''
            const parsed = repoTriageSchema.safeParse(extractJson(content))

            consola.log(`\n${'='.repeat(72)}`)
            consola.log(
                `${candidate.model}  ${repo.label}  ${ms}ms  ` +
                    `${completion.usage?.completion_tokens ?? 0} out  ` +
                    `schema=${parsed.success}`
            )
            consola.log('='.repeat(72))

            if (!parsed.success) {
                consola.error(
                    parsed.error.issues
                        .map(i => `${i.path.join('.')} ${i.message}`)
                        .join('; ')
                )
                consola.log(content.slice(0, 500))
                continue
            }

            const titles = new Map(
                repo.kept.map(commit => [commit.prNumber, commit.title])
            )

            for (const pick of parsed.data.picks) {
                const known = titles.has(pick.pr)
                consola.log(
                    `${known ? ' ' : '!'} #${pick.pr} [${pick.kind}] ` +
                        `${titles.get(pick.pr) ?? 'NOT IN WINDOW'}`
                )
                consola.log(`    ${pick.reason}`)
            }
        } catch (error) {
            consola.log(`\n${candidate.model}  ${repo.label}  FAILED`)
            consola.error(error instanceof Error ? error.message : error)
        }

        await new Promise(resolve => setTimeout(resolve, 3_000))
    }
}
