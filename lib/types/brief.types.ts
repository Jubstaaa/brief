import type { BriefKind } from '../schemas/triage.schema'

export interface RepoConfig {
    label: string
    owner: string
    repo: string
}

export interface BriefWindow {
    since: string
    until: string
    week: string
}

export interface Commit {
    prNumber: number | null
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

export interface Release {
    label: string
    publishedAt: string
    tag: string
    url: string
}

export interface PullFile {
    additions: number
    deletions: number
    patch: string
    path: string
}

export interface PullDetail {
    body: string
    files: PullFile[]
    label: string
    labels: string[]
    number: number
    title: string
    url: string
}

export interface BriefCode {
    lang: string
    snippet: string
}

export interface BriefItem {
    action: string
    code?: BriefCode | null
    detail: string
    headline: string
    kind: BriefKind
    pr: number
    repo: string
}

export interface BriefCount {
    kept: number
    label: string
    total: number
}

export interface BriefCommit {
    repo: string
    title: string
    url: string
}

export interface BriefUsage {
    calls: number
    costUsd?: number
    inputTokens: number
    outputTokens: number
}

export interface Brief {
    commits: BriefCommit[]
    counts: BriefCount[]
    generatedAt: string
    items: BriefItem[]
    model: string
    quiet: boolean
    releases: Release[]
    since: string
    until: string
    usage: BriefUsage
    week: string
}

export interface ArchiveEntry {
    itemCount: number
    since: string
    total: number
    until: string
    week: string
}

export interface PullRef {
    pr: number
    repo: string
}
