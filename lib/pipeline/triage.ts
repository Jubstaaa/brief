import { consola } from 'consola'

import {
    TRIAGE_MAX_TOKENS,
    TRIAGE_MODEL,
} from '../constants/inference.constants'
import { findRepo } from '../constants/repos.constants'
import { complete } from '../inference/client'
import { TRIAGE_SYSTEM, triageUser } from '../inference/prompts/triage.prompt'
import { repoTriageSchema, type Triage } from '../schemas/triage.schema'
import type { RepoCommits } from '../types/brief.types'

const EMPTY: Triage = { picks: [] }

async function triageRepo(repo: RepoCommits): Promise<Triage> {
    if (!repo.kept.length) return EMPTY

    const framework = findRepo(repo.label)?.title ?? repo.label

    const result = await complete({
        maxTokens: TRIAGE_MAX_TOKENS,
        model: TRIAGE_MODEL,
        schema: repoTriageSchema,
        system: TRIAGE_SYSTEM,
        user: triageUser(repo, framework),
    })

    return {
        picks: result.picks.map(pick => ({ ...pick, repo: repo.label })),
    }
}

export async function triage(repos: RepoCommits[]): Promise<Triage> {
    const results = await Promise.all(
        repos.map(repo =>
            triageRepo(repo).catch(error => {
                consola.warn(`triage failed for ${repo.label}, skipping`, error)
                return EMPTY
            })
        )
    )

    return { picks: results.flatMap(result => result.picks) }
}
