import type {
    Brief,
    BriefItem,
    Release,
    RepoConfig,
} from '@/lib/types/brief.types'

export interface WeekViewProps {
    brief: Brief
    config: RepoConfig
    items: BriefItem[]
}

export interface WeekItemProps {
    item: BriefItem
    ordinal: number
}

export interface WeekReleasesProps {
    releases: Release[]
}
