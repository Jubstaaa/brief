import { NOISE_PATTERNS } from '../constants/noise.constants'
import type { Commit } from '../types/brief.types'

export function isNoise(title: string): boolean {
    return NOISE_PATTERNS.some(pattern => pattern.test(title))
}

export function filterCommits(commits: Commit[]): {
    dropped: number
    kept: Commit[]
} {
    const seen = new Set<number>()
    const kept: Commit[] = []

    for (const commit of commits) {
        if (isNoise(commit.title)) continue

        if (commit.prNumber !== null) {
            if (seen.has(commit.prNumber)) continue
            seen.add(commit.prNumber)
        }

        kept.push(commit)
    }

    return { dropped: commits.length - kept.length, kept }
}
