import type { ArchiveEntry, RepoConfig } from '@/lib/types/brief.types'

export interface FrameworkViewProps {
    config: RepoConfig
    entries: ArchiveEntry[]
}
