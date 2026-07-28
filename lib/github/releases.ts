import { isWithinInterval } from 'date-fns'

import type { Release, RepoConfig } from '../types/brief.types'

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

    return items
        .filter(item => !item.draft && !item.prerelease && item.published_at)
        .filter(item => STABLE_TAG.test(item.tag_name))
        .filter(item =>
            isWithinInterval(new Date(item.published_at!), interval)
        )
        .map(item => ({
            label: config.label,
            publishedAt: item.published_at!,
            tag: item.tag_name,
            url: item.html_url,
        }))
}
