import Prose from '@/components/markdown'
import type { BriefItem } from '@/lib/types/brief.types'

const LABELS: Record<BriefItem['kind'], string> = {
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
            <div className="mb-5 flex items-baseline gap-3 font-mono text-[12px]">
                <span className="text-accent tabular-nums">
                    {String(ordinal).padStart(2, '0')}
                </span>
                <span className="chip py-0.5 font-sans">
                    {LABELS[item.kind]}
                </span>
                <span className="text-muted ml-auto">{item.repo}</span>
            </div>

            <h3 className="mb-5 text-[23px] leading-[1.25] font-medium tracking-[-0.02em] sm:text-[28px]">
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

            <div className="text-muted mt-6 flex gap-2.5 text-[14px]">
                <span className="text-accent shrink-0">→</span>
                <Prose muted content={item.action} />
            </div>
        </article>
    )
}
