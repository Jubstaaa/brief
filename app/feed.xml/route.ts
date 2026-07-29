import { readArchive } from '@/lib/storage/archive'
import { buildSiteFeed } from '@/lib/utils/feed'

export const dynamic = 'force-static'

export async function GET() {
    return new Response(buildSiteFeed(await readArchive()), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    })
}
