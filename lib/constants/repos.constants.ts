import type { RepoConfig } from '../types/brief.types'

export const REPOS: RepoConfig[] = [
    { label: 'react', owner: 'facebook', repo: 'react' },
    { label: 'next.js', owner: 'vercel', repo: 'next.js' },
]

export function findRepo(label: string): RepoConfig | undefined {
    return REPOS.find(repo => repo.label === label)
}
