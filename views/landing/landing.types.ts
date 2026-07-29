import type { ArchiveEntry } from '@/lib/types/brief.types'

export interface LandingViewProps {
    entries: ArchiveEntry[]
}

export interface LatestWeek {
    entry: ArchiveEntry
    itemCount: number
}
