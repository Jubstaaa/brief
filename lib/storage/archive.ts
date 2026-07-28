import {
    INDEX_KEY,
    SPACES_PUBLIC_BASE_URL,
    WEEK_KEY_PREFIX,
} from '../constants/spaces.constants'
import type { ArchiveEntry, Brief } from '../types/brief.types'

async function fetchJson<T>(key: string): Promise<T | null> {
    const response = await fetch(`${SPACES_PUBLIC_BASE_URL}/${key}`, {
        cache: 'force-cache',
    })

    if (response.status === 404) return null
    if (!response.ok) {
        throw new Error(`${key}: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
}

export async function readArchive(): Promise<ArchiveEntry[]> {
    return (await fetchJson<ArchiveEntry[]>(INDEX_KEY)) ?? []
}

export async function readBrief(week: string): Promise<Brief | null> {
    return fetchJson<Brief>(`${WEEK_KEY_PREFIX}${week}.json`)
}
