import { NOISE_PATTERNS } from '../constants/noise.constants'
import type { Commit } from '../types/brief.types'

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
