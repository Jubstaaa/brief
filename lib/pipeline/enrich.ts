import { consola } from 'consola'
import { compact, uniqBy } from 'es-toolkit'

import { findRepo } from '../constants/repos.constants'
import { fetchPullDetail } from '../github/pulls'
import type { Triage } from '../schemas/triage.schema'
import type { PullDetail, PullRef, RepoCommits } from '../types/brief.types'

function refKey(ref: PullRef): string {
    return `${ref.repo}#${ref.pr}`
}

function repoOwning(repos: RepoCommits[], pr: number): string | undefined {
    return repos.find(repo => repo.kept.some(commit => commit.prNumber === pr))
        ?.label
}

function referencedPulls(triaged: Triage, repos: RepoCommits[]): PullRef[] {
    const fromHighlights = triaged.highlights.map(highlight => ({
        pr: highlight.pr,
        repo: highlight.repo,
    }))

    const fromThemes = triaged.themes.flatMap(theme =>
        compact(
            theme.prs.map(pr => {
                const repo = repoOwning(repos, pr)
                return repo ? { pr, repo } : undefined
            })
        )
    )

    return uniqBy([...fromHighlights, ...fromThemes], refKey)
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

    for (const ref of referencedPulls(triaged, repos)) {
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
