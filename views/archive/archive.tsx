import Link from 'next/link'

import type { ArchiveEntry } from '@/lib/types/brief.types'
import { formatRange } from '@/lib/utils/window'

export interface ArchiveViewProps {
    entries: ArchiveEntry[]
}

export default function ArchiveView({ entries }: ArchiveViewProps) {
    return (
        <>
            <h1 className="page-title">brief</h1>
            <p className="page-subtitle">
                React ve Next.js&rsquo;te hafta hafta ne değişti.
            </p>

            {entries.length === 0 ? (
                <div className="callout">Henüz hafta yok.</div>
            ) : (
                <>
                    <h2 className="section-heading">Haftalar</h2>
                    <ul className="m-0 list-none p-0">
                        {entries.map(entry => (
                            <li
                                key={entry.week}
                                className="border-line border-b">
                                <Link
                                    className="text-ink hover:text-accent flex flex-col items-baseline gap-1 px-0.5 py-4 no-underline sm:flex-row sm:justify-between sm:gap-4"
                                    href={`/w/${entry.week}`}>
                                    <span>
                                        {formatRange(entry.since, entry.until)}
                                    </span>
                                    <small className="text-muted text-[13px] whitespace-nowrap">
                                        {entry.highlightCount} öne çıkan ·{' '}
                                        {entry.total} commit
                                    </small>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <footer className="page-footer">
                Her Salı GitHub commit geçmişinden yeniden üretilir.
            </footer>
        </>
    )
}
