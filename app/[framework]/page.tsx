import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import JsonLd from '@/components/json-ld/json-ld'
import { findRepoBySlug, REPOS } from '@/lib/constants/repos.constants'
import { SITE_NAME, SITE_URL } from '@/lib/constants/site.constants'
import { readArchive } from '@/lib/storage/archive'
import FrameworkView from '@/views/framework/framework'

export interface FrameworkPageProps {
    params: Promise<{ framework: string }>
}

export function generateStaticParams() {
    return REPOS.map(config => ({ framework: config.slug }))
}

function describe(title: string): string {
    return `${title} deposunda her hafta ne değişti — kullanan bir ekip için seçilmiş, Türkçe özetlenmiş commit'ler.`
}

export async function generateMetadata({
    params,
}: FrameworkPageProps): Promise<Metadata> {
    const { framework } = await params
    const config = findRepoBySlug(framework)

    if (!config) return {}

    return {
        alternates: { canonical: `/${config.slug}` },
        description: describe(config.title),
        title: `${config.title} haftalık özet · ${SITE_NAME}`,
    }
}

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
                    'isPartOf': { '@type': 'WebSite', 'url': SITE_URL },
                    'name': `${config.title} haftalık özet`,
                    'url': `${SITE_URL}/${config.slug}`,
                }}
            />
            <FrameworkView config={config} entries={entries} />
        </>
    )
}
