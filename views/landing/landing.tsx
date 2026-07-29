import Link from 'next/link'

import { REPOS } from '@/lib/constants/repos.constants'
import type { ArchiveEntry } from '@/lib/types/brief.types'
import { formatRange } from '@/lib/utils/window'

import type { LandingViewProps, LatestWeek } from './landing.types'

function latestFor(
    entries: ArchiveEntry[],
    slug: string
): LatestWeek | undefined {
    for (const entry of entries) {
        const framework = entry.frameworks.find(item => item.slug === slug)
        if (framework) return { entry, itemCount: framework.itemCount }
    }

    return undefined
}

export default function LandingView({ entries }: LandingViewProps) {
    return (
        <>
            <h1 className="page-title">brief</h1>
            <p className="page-subtitle">
                React, Next.js ve React Native&rsquo;de hafta hafta ne değişti.
            </p>

            {entries.length === 0 ? (
                <div className="callout">Henüz hafta yok.</div>
            ) : (
                <>
                    <h2 className="section-heading">Kategoriler</h2>
                    <ul className="m-0 list-none p-0">
                        {REPOS.map(config => {
                            const latest = latestFor(entries, config.slug)

                            return (
                                <li
                                    key={config.slug}
                                    className="border-line border-b">
                                    <Link
                                        className="text-ink hover:text-accent flex flex-col items-baseline gap-1 px-0.5 py-4 no-underline sm:flex-row sm:justify-between sm:gap-4"
                                        href={`/${config.slug}`}>
                                        <span>{config.title}</span>
                                        <small className="text-muted text-sm whitespace-nowrap">
                                            {latest
                                                ? `${formatRange(latest.entry.since, latest.entry.until)} · ${latest.itemCount} madde`
                                                : 'henüz madde yok'}
                                        </small>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}

            <footer className="page-footer">
                Her Salı GitHub commit geçmişinden yeniden üretilir.
            </footer>
        </>
    )
}
