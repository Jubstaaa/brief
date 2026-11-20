import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import JsonLd from '@/components/json-ld'
import { readArchive } from '@/lib/archive'
import type { ArchiveEntry } from '@/lib/brief'
import { REPOS } from '@/lib/repos'
import {
    pageUrl,
    SITE_DESCRIPTION,
    SITE_FRAMEWORKS,
    SITE_LOGO_PATH,
    SITE_NAME,
} from '@/lib/site'
import { formatRange } from '@/lib/window'

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
        types: { 'application/rss+xml': '/feed.xml' },
    },
    description: SITE_DESCRIPTION,
    title: `${SITE_NAME} — ${SITE_FRAMEWORKS} haftalık özeti`,
}

function latestFor(
    entries: ArchiveEntry[],
    slug: string
): { entry: ArchiveEntry; itemCount: number } | undefined {
    for (const entry of entries) {
        const framework = entry.frameworks.find(item => item.slug === slug)
        if (framework) return { entry, itemCount: framework.itemCount }
    }

    return undefined
}

export default async function HomePage() {
    const entries = await readArchive()

    return (
        <>
            <JsonLd
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    'description': SITE_DESCRIPTION,
                    'hasPart': REPOS.map(config => ({
                        '@type': 'CollectionPage',
                        'name': config.title,
                        'url': pageUrl(config.slug),
                    })),
                    'inLanguage': 'tr',
                    'name': SITE_NAME,
                    'url': pageUrl(),
                }}
            />
            <h1 className="page-title flex items-center gap-3">
                <Image
                    priority
                    alt=""
                    height={30}
                    src={SITE_LOGO_PATH}
                    width={30}
                />
                {SITE_NAME}
            </h1>
            <p className="page-subtitle">{SITE_DESCRIPTION}</p>

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
