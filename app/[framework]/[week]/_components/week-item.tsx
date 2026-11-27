import { toMarkdown } from 'mdast-util-to-markdown'

import type { BriefItem, BriefKind } from '@/lib/brief'

import Prose from './prose'

const KIND_LABELS: Record<BriefKind, string> = {
    breaking: 'Kırılma',
    feature: 'Yeni',
    fix: 'Düzeltme',
    performance: 'Performans',
    security: 'Güvenlik',
}

export interface WeekItemProps {
    item: BriefItem
    ordinal: number
}

export default function WeekItem({ item, ordinal }: WeekItemProps) {
    return (
        <article className="border-line border-t py-10 first:border-t-0 sm:py-12">
            <div className="mb-5 flex items-baseline gap-3 font-mono text-xs">
                <span className="text-accent tabular-nums">
                    {String(ordinal).padStart(2, '0')}
                </span>
                <span className="chip py-0.5 font-sans">
                    {KIND_LABELS[item.kind]}
                </span>
            </div>

            <h2 className="mb-5 text-2xl leading-tight font-medium tracking-tight sm:text-3xl">
                {item.headline}
            </h2>

            <Prose content={item.detail} />

            {item.code && (
                <Prose
                    content={toMarkdown({
                        lang: item.code.lang,
                        type: 'code',
                        value: item.code.snippet,
                    })}
                />
            )}

            <div className="text-muted mt-6 flex gap-2.5 text-sm">
                <span className="text-accent shrink-0">→</span>
                <Prose content={item.action} muted />
            </div>
        </article>
    )
}
