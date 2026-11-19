import { readArchive } from '@/lib/archive'
import { buildSiteFeed } from '@/lib/feed'

export const dynamic = 'force-static'

export async function GET() {
    return new Response(buildSiteFeed(await readArchive()), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    })
}
