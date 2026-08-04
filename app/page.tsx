import type { Metadata } from 'next'

import JsonLd from '@/components/json-ld/json-ld'
import { REPOS } from '@/lib/constants/repos.constants'
import {
    SITE_DESCRIPTION,
    SITE_FRAMEWORKS,
    SITE_NAME,
    SITE_URL,
} from '@/lib/constants/site.constants'
import { readArchive } from '@/lib/storage/archive'
import LandingView from '@/views/landing/landing'

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
        types: { 'application/rss+xml': '/feed.xml' },
    },
    description: SITE_DESCRIPTION,
    title: `${SITE_NAME} — ${SITE_FRAMEWORKS} haftalık özeti`,
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
                        'url': `${SITE_URL}/${config.slug}`,
                    })),
                    'inLanguage': 'tr',
                    'name': SITE_NAME,
                    'url': SITE_URL,
                }}
            />
            <LandingView entries={entries} />
        </>
    )
}
