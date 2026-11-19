import type { Commit } from '@/pipeline/github/commits'

const NOISE_PATTERNS: RegExp[] = [
    /^v?\d+\.\d+\.\d+(-\w+\.\d+)?$/,
    /^(chore|docs?|test|ci|build|style|revert)(\([^)]*\))?!?:/i,
    /^\[(test|docs?|ci)\]/i,
    /dependabot/i,
    /^Update .*\.(md|mdx|txt|json)$/i,
    /^Upgrade React from /i,
    /\bunflake\b/i,
    /\bbump\b .*\bversion\b/i,
    /^Merge branch /i,
    /\btypo\b/i,
]

export function isNoise(title: string, extra: RegExp[] = []): boolean {
    return [...NOISE_PATTERNS, ...extra].some(pattern => pattern.test(title))
}

export function filterCommits(
    commits: Commit[],
    extra: RegExp[] = []
): {
    dropped: number
    kept: Commit[]
} {
    const seen = new Set<number>()
    const kept: Commit[] = []

    for (const commit of commits) {
        if (isNoise(commit.title, extra)) continue

        if (commit.prNumber !== null) {
            if (seen.has(commit.prNumber)) continue
            seen.add(commit.prNumber)
        }

        kept.push(commit)
    }

    return { dropped: commits.length - kept.length, kept }
}
