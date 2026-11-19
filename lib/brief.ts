export const BRIEF_KINDS = [
    'breaking',
    'feature',
    'fix',
    'performance',
    'security',
] as const

export type BriefKind = (typeof BRIEF_KINDS)[number]

export interface Release {
    label: string
    publishedAt: string
    tag: string
    url: string
}

interface BriefCode {
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

interface BriefCount {
    kept: number
    label: string
    total: number
}

interface BriefCommit {
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

export interface ArchiveFramework {
    itemCount: number
    slug: string
}

export interface ArchiveEntry {
    frameworks: ArchiveFramework[]
    itemCount: number
    since: string
    total: number
    until: string
    week: string
}
