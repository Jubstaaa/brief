import { consola } from 'consola'

import {
    HIGHLIGHT_TARGET,
    TRIAGE_MAX_TOKENS,
    TRIAGE_MODEL,
} from '../constants/inference.constants'
import { complete } from '../inference/client'
import { TRIAGE_SYSTEM, triageUser } from '../inference/prompts/triage.prompt'
import {
    repoTriageSchema,
    type Triage,
    type TriagePick,
} from '../schemas/triage.schema'
import type { RepoCommits } from '../types/brief.types'

const EMPTY: Triage = { picks: [] }

async function triageRepo(repo: RepoCommits): Promise<Triage> {
    if (!repo.kept.length) return EMPTY

    const result = await complete({
        maxTokens: TRIAGE_MAX_TOKENS,
        model: TRIAGE_MODEL,
        schema: repoTriageSchema,
        system: TRIAGE_SYSTEM,
        user: triageUser(repo),
    })

    return {
        picks: result.picks.map(pick => ({ ...pick, repo: repo.label })),
    }
}

function interleave(groups: TriagePick[][], limit: number): TriagePick[] {
    const longest = Math.max(0, ...groups.map(group => group.length))
    const picked: TriagePick[] = []

    for (let index = 0; index < longest && picked.length < limit; index++) {
        for (const group of groups) {
            if (picked.length >= limit) break
            const pick = group[index]
            if (pick) picked.push(pick)
        }
    }

    return picked
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

    return {
        picks: interleave(
            results.map(result => result.picks),
            HIGHLIGHT_TARGET
        ),
    }
}
