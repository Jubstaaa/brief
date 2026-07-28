import { filterCommits } from '../pipeline/filter'
import type { Commit, RepoCommits, RepoConfig } from '../types/brief.types'

import { octokit } from './client'

const PR_SUFFIX = /\(#(\d+)\)\s*$/

export function firstLine(message: string): string {
    return message.split('\n')[0]!.trim()
}

export function extractPrNumber(title: string): number | null {
    const match = title.match(PR_SUFFIX)
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
