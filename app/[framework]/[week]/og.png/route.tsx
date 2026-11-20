import { ImageResponse } from 'next/og'

import { readBrief, readWeekParams } from '@/lib/archive'
import { OG_SIZE } from '@/lib/og'
import { findRepoBySlug } from '@/lib/repos'
import { SITE_NAME } from '@/lib/site'
import { formatRange } from '@/lib/window'

export const dynamic = 'force-static'

// Only weeks listed in the index exist; anything else is a 404, in dev too.
export const dynamicParams = false

export function generateStaticParams() {
    return readWeekParams()
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ framework: string; week: string }> }
) {
    const { framework, week } = await params
    const config = findRepoBySlug(framework)

    if (!config) return new Response('Not found', { status: 404 })

    const brief = await readBrief(week)

    const count = brief.items.filter(item => item.repo === config.label).length

    return new ImageResponse(
        <div
            style={{
                background: '#131211',
                color: '#eceae5',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                padding: '80px',
                width: '100%',
            }}>
            <div style={{ color: '#9a948a', display: 'flex', fontSize: 34 }}>
                {SITE_NAME}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 96,
                        fontWeight: 600,
                    }}>
                    {config.title}
                </div>
                <div
                    style={{
                        color: '#9a948a',
                        display: 'flex',
                        fontSize: 44,
                    }}>
                    {formatRange(brief.since, brief.until)}
                </div>
            </div>
            <div style={{ color: '#e08a5f', display: 'flex', fontSize: 38 }}>
                {`${count} madde`}
            </div>
        </div>,
        OG_SIZE
    )
}
