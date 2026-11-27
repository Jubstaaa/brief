import { consola } from 'consola'
import { compact, uniqBy } from 'es-toolkit'

import type { RepoCommits } from '@/pipeline/github/commits'
import type { PullDetail } from '@/pipeline/github/pulls'

import { findRepo } from '@/lib/repos'
import { fetchPullDetail } from '@/pipeline/github/pulls'

import type { Triage } from './triage.schema'

interface PullRef {
    pr: number
    repo: string
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

    if (refs.length && !details.length) {
        throw new Error(
            `could not fetch any of the ${refs.length} picked pull requests`
        )
    }

    return details
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

function referencedPulls(triaged: Triage): PullRef[] {
    const refs = triaged.picks.map(pick => ({ pr: pick.pr, repo: pick.repo }))

    return uniqBy(refs, refKey)
}

function refKey(ref: PullRef): string {
    return `${ref.repo}#${ref.pr}`
}
