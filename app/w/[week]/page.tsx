import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { readArchive, readBrief } from '@/lib/storage/archive'
import { formatRange } from '@/lib/utils/window'
import WeekView from '@/views/week/week'

export interface WeekPageProps {
    params: Promise<{ week: string }>
}

export async function generateStaticParams() {
    const entries = await readArchive()

    return entries.map(entry => ({ week: entry.week }))
}

export async function generateMetadata({
    params,
}: WeekPageProps): Promise<Metadata> {
    const { week } = await params
    const brief = await readBrief(week)

    if (!brief) return { title: 'brief' }

    return {
        description: `${formatRange(brief.since, brief.until)} arasında React ve Next.js commit'leri.`,
        title: `${brief.week} · brief`,
    }
}

export default async function WeekPage({ params }: WeekPageProps) {
    const { week } = await params
    const brief = await readBrief(week)

    if (!brief) notFound()

    return <WeekView brief={brief} />
}
