import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'

import JsonLd from '@/components/json-ld'
import { readBrief, readWeekParams } from '@/lib/archive'
import type { Release } from '@/lib/brief'
import { OG_SIZE, ogImagePath } from '@/lib/og'
import { findRepoBySlug } from '@/lib/repos'
import type { RepoConfig } from '@/lib/repos'
import { pageUrl, SITE_NAME } from '@/lib/site'
import { formatRange } from '@/lib/window'

import WeekItem from './_components/week-item'
import WeekReleases from './_components/week-releases'

function releasesFor(releases: Release[], label: string): Release[] {
    return releases.filter(release => release.label === label)
}

export interface WeekPageProps {
    params: Promise<{ framework: string; week: string }>
}

// Only weeks listed in the index exist; anything else is a 404, in dev too.
export const dynamicParams = false

export function generateStaticParams() {
    return readWeekParams()
}

async function load(params: WeekPageProps['params']) {
    const { framework, week } = await params
    const config = findRepoBySlug(framework)

    if (!config) return undefined

    const brief = await readBrief(week)

    const items = brief.items.filter(item => item.repo === config.label)

    if (!items.length) return undefined

    return { brief, config, items }
}

function describe(config: RepoConfig, range: string, count: number): string {
    return `${range} arasında ${config.locative} değişen ve bizi ilgilendiren ${count} şey.`
}

export async function generateMetadata({
    params,
}: WeekPageProps): Promise<Metadata> {
    const loaded = await load(params)

    if (!loaded) return {}

    const { brief, config, items } = loaded
    const range = formatRange(brief.since, brief.until)
    const path = `/${config.slug}/${brief.week}`

    return {
        alternates: { canonical: path },
        description: describe(config, range, items.length),
        openGraph: {
            description: describe(config, range, items.length),
            images: [
                {
                    ...OG_SIZE,
                    url: ogImagePath(config.slug, brief.week),
                },
            ],
            title: `${config.title} · ${range}`,
            type: 'article',
            url: path,
        },
        title: `${config.title} · ${range} · ${SITE_NAME}`,
    }
}

export default async function WeekPage({ params }: WeekPageProps) {
    const loaded = await load(params)

    if (!loaded) notFound()

    const { brief, config, items } = loaded
    const range = formatRange(brief.since, brief.until)
    const scanned =
        brief.counts.find(count => count.label === config.label)?.total ?? 0

    return (
        <>
            <JsonLd
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'TechArticle',
                    'about': config.title,
                    'datePublished': brief.generatedAt,
                    'description': describe(config, range, items.length),
                    'headline': `${config.title} · ${range}`,
                    'inLanguage': 'tr',
                    'isPartOf': {
                        '@type': 'CollectionPage',
                        'url': pageUrl(config.slug),
                    },
                    'url': pageUrl(config.slug, brief.week),
                }}
            />
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
