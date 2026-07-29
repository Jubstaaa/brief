import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import JsonLd from '@/components/json-ld/json-ld'
import { findRepoBySlug } from '@/lib/constants/repos.constants'
import { SITE_NAME, SITE_URL } from '@/lib/constants/site.constants'
import { readArchive, readBrief } from '@/lib/storage/archive'
import type { RepoConfig } from '@/lib/types/brief.types'
import { OG_SIZE, ogImagePath } from '@/lib/utils/og'
import { formatRange } from '@/lib/utils/window'
import WeekView from '@/views/week/week'

export interface WeekPageProps {
    params: Promise<{ framework: string; week: string }>
}

export async function generateStaticParams() {
    const entries = await readArchive()

    return entries.flatMap(entry =>
        entry.frameworks.map(framework => ({
            framework: framework.slug,
            week: entry.week,
        }))
    )
}

async function load(params: WeekPageProps['params']) {
    const { framework, week } = await params
    const config = findRepoBySlug(framework)

    if (!config) return undefined

    const brief = await readBrief(week)

    if (!brief) return undefined

    const items = brief.items.filter(item => item.repo === config.label)

    if (!items.length) return undefined

    return { brief, config, items }
}

function describe(config: RepoConfig, range: string, count: number): string {
    return `${range} arasında ${config.title}'de değişen ve bizi ilgilendiren ${count} şey.`
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
                        'url': `${SITE_URL}/${config.slug}`,
                    },
                    'url': `${SITE_URL}/${config.slug}/${brief.week}`,
                }}
            />
            <WeekView brief={brief} config={config} items={items} />
        </>
    )
}
