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

export interface BriefHighlight {
    code?: BriefCode | null
    pr: number
    repo: string
    title: string
    url: string
    what: string
    why: string
}

export interface BriefThemePull {
    number: number
    repo: string
    title: string
    url: string
}

export interface BriefTheme {
    prs: BriefThemePull[]
    summary: string
    title: string
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

export interface Brief {
    commits: BriefCommit[]
    counts: BriefCount[]
    generatedAt: string
    highlights: BriefHighlight[]
    model: string
    quiet: boolean
    releases: Release[]
    since: string
    themes: BriefTheme[]
    until: string
    week: string
}

export interface ArchiveEntry {
    highlightCount: number
    since: string
    total: number
    until: string
    week: string
}

export interface PullRef {
    pr: number
    repo: string
}
