import { consola } from 'consola'

import {
    HIGHLIGHT_TARGET,
    TRIAGE_MAX_TOKENS,
    TRIAGE_MODEL,
    TRIAGE_REASONING_EFFORT,
} from '../constants/inference.constants'
import { complete } from '../inference/client'
import { TRIAGE_SYSTEM, triageUser } from '../inference/prompts/triage.prompt'
import {
    repoTriageSchema,
    type Triage,
    type TriageHighlight,
} from '../schemas/triage.schema'
import type { RepoCommits } from '../types/brief.types'

const EMPTY: Triage = { highlights: [], themes: [] }

async function triageRepo(repo: RepoCommits): Promise<Triage> {
    if (!repo.kept.length) return EMPTY

    const result = await complete({
        maxTokens: TRIAGE_MAX_TOKENS,
        model: TRIAGE_MODEL,
        reasoningEffort: TRIAGE_REASONING_EFFORT,
        schema: repoTriageSchema,
        system: TRIAGE_SYSTEM,
        user: triageUser(repo),
    })

    return {
        highlights: result.highlights.map(highlight => ({
            ...highlight,
            repo: repo.label,
        })),
        themes: result.themes,
    }
}

function interleave(
    groups: TriageHighlight[][],
    limit: number
): TriageHighlight[] {
    const longest = Math.max(0, ...groups.map(group => group.length))
    const picked: TriageHighlight[] = []

    for (let index = 0; index < longest && picked.length < limit; index++) {
        for (const group of groups) {
            if (picked.length >= limit) break
            const highlight = group[index]
            if (highlight) picked.push(highlight)
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
        highlights: interleave(
            results.map(result => result.highlights),
            HIGHLIGHT_TARGET
        ),
        themes: results.flatMap(result => result.themes),
    }
}
