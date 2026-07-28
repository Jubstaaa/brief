import Link from 'next/link'

import type { Brief } from '@/lib/types/brief.types'
import { formatRange } from '@/lib/utils/window'

import WeekCommits from './week-commits'
import WeekHighlight from './week-highlight'
import WeekReleases from './week-releases'
import WeekStats from './week-stats'
import WeekTheme from './week-theme'

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
                    Sakin bir hafta — sadece bakım commit&rsquo;leri geldi.
                </div>
            ) : (
                <>
                    <WeekReleases releases={brief.releases} />

                    {brief.highlights.length > 0 && (
                        <h2 className="section-heading">Öne çıkanlar</h2>
                    )}
                    {brief.highlights.map((highlight, index) => (
                        <WeekHighlight
                            key={highlight.url}
                            highlight={highlight}
                            ordinal={index + 1}
                        />
                    ))}

                    {brief.themes.length > 0 && (
                        <h2 className="section-heading">Temalar</h2>
                    )}
                    {brief.themes.map(theme => (
                        <WeekTheme key={theme.title} theme={theme} />
                    ))}
                </>
            )}

            <WeekCommits commits={brief.commits} />

            <footer className="page-footer">
                {brief.generatedAt.slice(0, 10)} tarihinde {brief.model} ile
                üretildi.
            </footer>
        </>
    )
}
