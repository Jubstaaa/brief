import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'

import JsonLd from '@/components/json-ld'
import { readArchive } from '@/lib/archive'
import { findRepoBySlug, REPOS } from '@/lib/repos'
import { pageUrl, SITE_NAME } from '@/lib/site'
import { formatRange } from '@/lib/window'

export interface FrameworkPageProps {
    params: Promise<{ framework: string }>
}

export const dynamicParams = false

export default async function FrameworkPage({ params }: FrameworkPageProps) {
    const { framework } = await params
    const config = findRepoBySlug(framework)

    if (!config) notFound()

    const entries = (await readArchive()).filter(entry =>
        entry.frameworks.some(item => item.slug === config.slug)
    )

    return (
        <>
            <JsonLd
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    'description': describe(config.title),
                    'inLanguage': 'tr',
                    'isPartOf': { '@type': 'WebSite', 'url': pageUrl() },
                    'name': `${config.title} haftalık özet`,
                    'url': pageUrl(config.slug),
                }}
            />
            <Link
                className="text-muted mb-7 inline-block text-sm no-underline"
                href="/">
                ← tüm kategoriler
            </Link>
            <h1 className="page-title">{config.title}</h1>
            <p className="page-subtitle">
                {config.locative} hafta hafta ne değişti.
            </p>

            {entries.length === 0 ? (
                <div className="callout">Henüz hafta yok.</div>
            ) : (
                <>
                    <h2 className="section-heading">Haftalar</h2>
                    <ul className="m-0 list-none p-0">
                        {entries.map(entry => (
                            <li
                                className="border-line border-b"
                                key={entry.week}>
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

export async function generateMetadata({
    params,
}: FrameworkPageProps): Promise<Metadata> {
    const { framework } = await params
    const config = findRepoBySlug(framework)

    if (!config) return {}

    return {
        alternates: {
            canonical: `/${config.slug}`,
            types: {
                'application/rss+xml': `/${config.slug}/feed.xml`,
            },
        },
        description: describe(config.title),
        title: `${config.title} haftalık özet · ${SITE_NAME}`,
    }
}

export function generateStaticParams() {
    return REPOS.map(config => ({ framework: config.slug }))
}

function describe(title: string): string {
    return `${title} deposunda her hafta ne değişti — kullanan bir ekip için seçilmiş, Türkçe özetlenmiş commit'ler.`
}
