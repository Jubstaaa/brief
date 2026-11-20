import { isWithinInterval } from 'date-fns'

import type { Release } from '@/lib/brief'
import type { RepoConfig } from '@/lib/repos'

import { octokit } from './client'

const STABLE_TAG = /^v?\d+\.\d+\.\d+$/

export async function fetchReleases(
    config: RepoConfig,
    since: string,
    until: string
): Promise<Release[]> {
    const items = await octokit.paginate(octokit.rest.repos.listReleases, {
        owner: config.owner,
        per_page: 50,
        repo: config.repo,
    })

    const interval = {
        end: new Date(new Date(until).getTime() - 1),
        start: new Date(since),
    }

    return items.flatMap(item => {
        const publishedAt = item.published_at

        if (item.draft || item.prerelease || !publishedAt) return []
        if (!STABLE_TAG.test(item.tag_name)) return []
        if (!isWithinInterval(new Date(publishedAt), interval)) return []

        return [
            {
                label: config.label,
                publishedAt,
                tag: item.tag_name,
                url: item.html_url,
            },
        ]
    })
}
