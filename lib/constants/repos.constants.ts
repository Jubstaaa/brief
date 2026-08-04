import type { RepoConfig } from '../types/brief.types'

const REACT_NATIVE_NOISE: RegExp[] = [
    /^translation auto-update/i,
    /^Deploy \d+\.\d+\.\d+ to xplat/i,
    /^Drop RCT_EXPORT_METHOD/i,
    /^xplat\/js\//i,
]

export const REPOS: RepoConfig[] = [
    {
        label: 'react',
        owner: 'facebook',
        repo: 'react',
        slug: 'react',
        title: 'React',
    },
    {
        label: 'next.js',
        owner: 'vercel',
        repo: 'next.js',
        slug: 'next-js',
        title: 'Next.js',
    },
    {
        label: 'react-native',
        noise: REACT_NATIVE_NOISE,
        owner: 'facebook',
        repo: 'react-native',
        slug: 'react-native',
        title: 'React Native',
    },
    {
        label: 'expo',
        owner: 'expo',
        repo: 'expo',
        slug: 'expo',
        title: 'Expo',
    },
]

export function findRepo(label: string): RepoConfig | undefined {
    return REPOS.find(repo => repo.label === label)
}

export function findRepoBySlug(slug: string): RepoConfig | undefined {
    return REPOS.find(repo => repo.slug === slug)
}
