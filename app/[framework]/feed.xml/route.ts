import { readArchive } from '@/lib/archive'
import { buildFrameworkFeed } from '@/lib/feed'
import { findRepoBySlug, REPOS } from '@/lib/repos'

export const dynamic = 'force-static'

export const dynamicParams = false

export function generateStaticParams() {
    return REPOS.map(config => ({ framework: config.slug }))
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ framework: string }> }
) {
    const { framework } = await params
    const config = findRepoBySlug(framework)

    if (!config) return new Response('Not found', { status: 404 })

    const entries = (await readArchive()).filter(entry =>
        entry.frameworks.some(item => item.slug === config.slug)
    )

    return new Response(buildFrameworkFeed(config, entries), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    })
}
