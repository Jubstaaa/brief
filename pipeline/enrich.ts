import { consola } from 'consola'
import { compact, uniqBy } from 'es-toolkit'

import { findRepo } from '@/lib/repos'
import type { RepoCommits } from '@/pipeline/github/commits'
import { fetchPullDetail } from '@/pipeline/github/pulls'
import type { PullDetail } from '@/pipeline/github/pulls'

import type { Triage } from './triage.schema'

interface PullRef {
    pr: number
    repo: string
}

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
    const refs = referencedPulls(triaged)

    for (const ref of refs) {
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

    // Same guard as triage and draft: with no detail at all, draft would
    // report its own failure and point at the model instead of GitHub.
    if (refs.length && !details.length) {
        throw new Error(
            `could not fetch any of the ${refs.length} picked pull requests`
        )
    }

    return details
}
