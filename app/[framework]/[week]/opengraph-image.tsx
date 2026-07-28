import { ImageResponse } from 'next/og'

import { findRepoBySlug } from '@/lib/constants/repos.constants'
import { SITE_NAME } from '@/lib/constants/site.constants'
import { readArchive, readBrief } from '@/lib/storage/archive'
import { formatRange } from '@/lib/utils/window'

export const size = { height: 630, width: 1200 }

export const contentType = 'image/png'

export async function generateStaticParams() {
    const entries = await readArchive()

    return entries.flatMap(entry =>
        entry.frameworks.map(framework => ({
            framework: framework.slug,
            week: entry.week,
        }))
    )
}

export default async function Image({
    params,
}: {
    params: Promise<{ framework: string; week: string }>
}) {
    const { framework, week } = await params
    const config = findRepoBySlug(framework)
    const brief = await readBrief(week)

    const count =
        brief?.items.filter(item => item.repo === config?.label).length ?? 0
    const range = brief ? formatRange(brief.since, brief.until) : ''

    return new ImageResponse(
        <div
            style={{
                background: '#0b0b0c',
                color: '#f5f5f4',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                padding: '80px',
                width: '100%',
            }}>
            <div style={{ color: '#a1a1aa', display: 'flex', fontSize: 34 }}>
                {SITE_NAME}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 96,
                        fontWeight: 600,
                    }}>
                    {config?.title ?? framework}
                </div>
                <div
                    style={{
                        color: '#a1a1aa',
                        display: 'flex',
                        fontSize: 44,
                    }}>
                    {range}
                </div>
            </div>
            <div style={{ color: '#fb923c', display: 'flex', fontSize: 38 }}>
                {`${count} madde`}
            </div>
        </div>,
        size
    )
}
