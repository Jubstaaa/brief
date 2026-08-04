import type { RepoConfig } from '../types/brief.types'

const REACT_NATIVE_NOISE: RegExp[] = [
    /^translation auto-update/i,
    /^Deploy \d+\.\d+\.\d+ to xplat/i,
    /^Drop RCT_EXPORT_METHOD/i,
    /^xplat\/js\//i,
]

// `locative` is the title with its Turkish -de/-da suffix attached ("Expo'da
// hafta hafta ne değişti"). It is data rather than string math because the
// right suffix follows the name's pronunciation, which no code can derive.
export const REPOS: RepoConfig[] = [
    {
        label: 'react',
        locative: "React'te",
        owner: 'facebook',
        repo: 'react',
        slug: 'react',
        title: 'React',
    },
    {
        label: 'next.js',
        locative: "Next.js'te",
        owner: 'vercel',
        repo: 'next.js',
        slug: 'next-js',
        title: 'Next.js',
    },
    {
        label: 'react-native',
        locative: "React Native'de",
        noise: REACT_NATIVE_NOISE,
        owner: 'facebook',
        repo: 'react-native',
        slug: 'react-native',
        title: 'React Native',
    },
    {
        label: 'expo',
        locative: "Expo'da",
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
