import Prose from '@/components/prose'

import { KIND_LABELS } from './week.constants'
import type { WeekItemProps } from './week.types'

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

            <h3 className="mb-5 text-2xl leading-tight font-medium tracking-tight sm:text-3xl">
                {item.headline}
            </h3>

            <Prose content={item.detail} />

            {item.code && (
                <Prose
                    content={[
                        '```' + item.code.lang,
                        item.code.snippet,
                        '```',
                    ].join('\n')}
                />
            )}

            <div className="text-muted mt-6 flex gap-2.5 text-sm">
                <span className="text-accent shrink-0">→</span>
                <Prose muted content={item.action} />
            </div>
        </article>
    )
}
