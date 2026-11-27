import type { RepoConfig } from '@/lib/repos'

import { filterCommits } from '@/pipeline/filter'

import { octokit } from './client'

export interface Commit {
    prNumber: null | number
    sha: string
    title: string
    url: string
}

export interface RepoCommits {
    dropped: number
    kept: Commit[]
    label: string
    total: number
}

const PR_SUFFIX = /\(#(\d+)\)\s*$/

export function extractPrNumber(title: string): null | number {
    const match = PR_SUFFIX.exec(title)
    return match ? Number(match[1]) : null
}

export async function fetchCommits(
    config: RepoConfig,
    since: string,
    until: string
): Promise<RepoCommits> {
    const items = await octokit.paginate(octokit.rest.repos.listCommits, {
        owner: config.owner,
        per_page: 100,
        repo: config.repo,
        since,
        until,
    })

    const all: Commit[] = items.map(item => {
        const title = firstLine(item.commit.message)

        return {
            prNumber: extractPrNumber(title),
            sha: item.sha,
            title,
            url: item.html_url,
        }
    })

    const { dropped, kept } = filterCommits(all, config.noise)

    return { dropped, kept, label: config.label, total: all.length }
}

export function firstLine(message: string): string {
    return (message.split('\n')[0] ?? '').trim()
}
