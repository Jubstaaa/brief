import {
    MAX_FILES_PER_PR,
    PATCH_LIMIT,
    PR_BODY_LIMIT,
} from '../constants/noise.constants'
import type { PullDetail, RepoConfig } from '../types/brief.types'

import { octokit } from './client'

export async function fetchPullDetail(
    config: RepoConfig,
    pullNumber: number
): Promise<PullDetail> {
    const target = {
        owner: config.owner,
        pull_number: pullNumber,
        repo: config.repo,
    }

    const [{ data: pull }, { data: files }] = await Promise.all([
        octokit.rest.pulls.get(target),
        octokit.rest.pulls.listFiles({ ...target, per_page: MAX_FILES_PER_PR }),
    ])

    return {
        body: (pull.body ?? '').slice(0, PR_BODY_LIMIT),
        files: files.map(file => ({
            additions: file.additions,
            deletions: file.deletions,
            patch: (file.patch ?? '').slice(0, PATCH_LIMIT),
            path: file.filename,
        })),
        label: config.label,
        labels: pull.labels.map(label => label.name),
        number: pull.number,
        title: pull.title,
        url: pull.html_url,
    }
}
