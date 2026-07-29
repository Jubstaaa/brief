import Link from 'next/link'

import { formatRange } from '@/lib/utils/window'

import type { FrameworkViewProps } from './framework.types'

export default function FrameworkView({ config, entries }: FrameworkViewProps) {
    return (
        <>
            <Link
                className="text-muted mb-7 inline-block text-sm no-underline"
                href="/">
                ← tüm kategoriler
            </Link>
            <h1 className="page-title">{config.title}</h1>
            <p className="page-subtitle">
                {config.title}&rsquo;de hafta hafta ne değişti.
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
                                    href={`/${config.slug}/${entry.week}`}>
                                    <span>
                                        {formatRange(entry.since, entry.until)}
                                    </span>
                                    <small className="text-muted text-sm whitespace-nowrap">
                                        {entry.frameworks.find(
                                            item => item.slug === config.slug
                                        )?.itemCount ?? 0}{' '}
                                        madde
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
