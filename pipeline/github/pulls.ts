import type { RepoConfig } from '@/lib/repos'

import { octokit } from './client'

const PR_BODY_LIMIT = 1400

const MAX_FILES_PER_PR = 12

const PATCH_LIMIT = 450

export const MAX_PATCHED_FILES = 2

export interface PullDetail {
    body: string
    files: PullFile[]
    label: string
    labels: string[]
    number: number
    title: string
    url: string
}

interface PullFile {
    additions: number
    deletions: number
    patch: string
    path: string
}

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
