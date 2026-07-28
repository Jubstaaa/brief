import Prose from '@/components/markdown'
import type { BriefHighlight } from '@/lib/types/brief.types'

export interface WeekHighlightProps {
    highlight: BriefHighlight
    ordinal: number
}

export default function WeekHighlight({
    highlight,
    ordinal,
}: WeekHighlightProps) {
    return (
        <article className="border-line border-t py-10 first:border-t-0 sm:py-12">
            <div className="text-muted mb-5 flex items-baseline gap-3 font-mono text-[12px] tracking-wide">
                <span className="text-accent tabular-nums">
                    {String(ordinal).padStart(2, '0')}
                </span>
                <span>{highlight.repo}</span>
                <a className="ml-auto no-underline" href={highlight.url}>
                    #{highlight.pr}
                </a>
            </div>

            <h3 className="mb-6 text-[22px] leading-[1.25] font-medium tracking-[-0.02em] sm:text-[26px]">
                {highlight.title}
            </h3>

            <Prose content={highlight.what} />

            {highlight.code && (
                <Prose
                    content={[
                        '```' + highlight.code.lang,
                        highlight.code.snippet,
                        '```',
                    ].join('\n')}
                />
            )}

            <div className="border-line mt-6 border-l-2 pl-5">
                <Prose muted content={highlight.why} />
            </div>
        </article>
    )
}
