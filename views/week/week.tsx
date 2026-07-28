import Link from 'next/link'

import type { Brief } from '@/lib/types/brief.types'
import { formatRange } from '@/lib/utils/window'

import WeekItem from './week-item'
import WeekReleases from './week-releases'
import WeekStats from './week-stats'

export interface WeekViewProps {
    brief: Brief
}

export default function WeekView({ brief }: WeekViewProps) {
    return (
        <>
            <Link
                className="text-muted mb-7 inline-block text-[13px] no-underline"
                href="/">
                ← tüm haftalar
            </Link>
            <h1 className="page-title">{brief.week}</h1>
            <p className="page-subtitle">
                {formatRange(brief.since, brief.until)}
            </p>

            <WeekStats counts={brief.counts} />

            {brief.quiet ? (
                <div className="callout">
                    Sakin bir hafta — bizi ilgilendiren bir değişiklik yok.
                </div>
            ) : (
                <>
                    <WeekReleases releases={brief.releases} />

                    <div className="mt-14">
                        {brief.items.map((item, index) => (
                            <WeekItem
                                key={item.pr}
                                item={item}
                                ordinal={index + 1}
                            />
                        ))}
                    </div>
                </>
            )}

            <footer className="page-footer">
                {brief.counts.reduce((sum, count) => sum + count.total, 0)}{' '}
                commit tarandı, {brief.items.length} tanesi bizi ilgilendiriyor.
            </footer>
        </>
    )
}
