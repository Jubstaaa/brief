import { consola } from 'consola'

import { findRepo } from '@/lib/repos'
import type { RepoCommits } from '@/pipeline/github/commits'
import { complete } from '@/pipeline/inference/client'
import {
    TRIAGE_MAX_TOKENS,
    TRIAGE_MODEL,
    TRIAGE_REASONING_EFFORT,
} from '@/pipeline/inference/config'
import {
    TRIAGE_SYSTEM,
    triageUser,
} from '@/pipeline/inference/prompts/triage.prompt'

import { repoTriageSchema, type Triage } from './triage.schema'

const EMPTY: Triage = { picks: [] }

async function triageRepo(repo: RepoCommits): Promise<Triage> {
    if (!repo.kept.length) return EMPTY

    const framework = findRepo(repo.label)?.title ?? repo.label

    const result = await complete({
        maxTokens: TRIAGE_MAX_TOKENS,
        model: TRIAGE_MODEL,
        reasoningEffort: TRIAGE_REASONING_EFFORT,
        schema: repoTriageSchema,
        system: TRIAGE_SYSTEM,
        user: triageUser(repo, framework),
    })

    return {
        picks: result.picks.map(pick => ({ ...pick, repo: repo.label })),
    }
}

export async function triage(repos: RepoCommits[]): Promise<Triage> {
    let failures = 0

    const results = await Promise.all(
        repos.map(repo =>
            triageRepo(repo).catch(error => {
                failures += 1
                consola.warn(`triage failed for ${repo.label}, skipping`, error)
                return EMPTY
            })
        )
    )

    const picks = results.flatMap(result => result.picks)

    // Swallowed failures make an outage look like a quiet week and publish an
    // empty brief. Zero picks with failures present means we were blind, not
    // that nothing happened — abort so the workflow fails loudly.
    if (!picks.length && failures) {
        throw new Error(
            `triage failed for ${failures} of ${repos.length} repos and produced no picks`
        )
    }

    return { picks }
}
