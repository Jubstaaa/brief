import { consola } from 'consola'
import { compact, uniqBy } from 'es-toolkit'

import { findRepo } from '../constants/repos.constants'
import { fetchPullDetail } from '../github/pulls'
import type { Triage } from '../schemas/triage.schema'
import type { PullDetail, PullRef, RepoCommits } from '../types/brief.types'

function refKey(ref: PullRef): string {
    return `${ref.repo}#${ref.pr}`
}

function referencedPulls(triaged: Triage): PullRef[] {
    const refs = triaged.picks.map(pick => ({ pr: pick.pr, repo: pick.repo }))

    return uniqBy(refs, refKey)
}

function inWindow(repos: RepoCommits[]): Set<string> {
    return new Set(
        repos.flatMap(repo =>
            compact(
                repo.kept.map(commit =>
                    commit.prNumber
                        ? refKey({ pr: commit.prNumber, repo: repo.label })
                        : undefined
                )
            )
        )
    )
}

export async function enrich(
    triaged: Triage,
    repos: RepoCommits[]
): Promise<PullDetail[]> {
    const known = inWindow(repos)
    const details: PullDetail[] = []

    for (const ref of referencedPulls(triaged)) {
        const config = findRepo(ref.repo)

        if (!config) {
            consola.warn(`unknown repo label "${ref.repo}", skipping`)
            continue
        }

        if (!known.has(refKey(ref))) {
            consola.warn(`${refKey(ref)} is not in this window, skipping`)
            continue
        }

        try {
            details.push(await fetchPullDetail(config, ref.pr))
        } catch (error) {
            consola.warn(`${refKey(ref)} could not be fetched, skipping`, error)
        }
    }

    return details
}
