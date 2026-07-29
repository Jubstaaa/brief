import Link from 'next/link'

import type { Release } from '@/lib/types/brief.types'
import { formatRange } from '@/lib/utils/window'

import WeekItem from './week-item'
import WeekReleases from './week-releases'
import type { WeekViewProps } from './week.types'

function releasesFor(releases: Release[], label: string): Release[] {
    return releases.filter(release => release.label === label)
}

export default function WeekView({ brief, config, items }: WeekViewProps) {
    const scanned =
        brief.counts.find(count => count.label === config.label)?.total ?? 0

    return (
        <>
            <Link
                className="text-muted mb-7 inline-block text-sm no-underline"
                href={`/${config.slug}`}>
                ← {config.title} haftaları
            </Link>
            <h1 className="page-title">
                {config.title} · {brief.week}
            </h1>
            <p className="page-subtitle">
                {formatRange(brief.since, brief.until)}
            </p>

            <WeekReleases
                releases={releasesFor(brief.releases, config.label)}
            />

            <div className="mt-14">
                {items.map((item, index) => (
                    <WeekItem key={item.pr} item={item} ordinal={index + 1} />
                ))}
            </div>

            <footer className="page-footer">
                {scanned} commit tarandı, {items.length} tanesi bizi
                ilgilendiriyor.
            </footer>
        </>
    )
}
