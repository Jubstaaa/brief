import type { BriefHighlight } from '@/lib/types/brief.types'

export interface WeekHighlightProps {
    highlight: BriefHighlight
}

export default function WeekHighlight({ highlight }: WeekHighlightProps) {
    return (
        <article className="panel mb-3.5 px-[22px] py-5">
            <div className="mb-3 flex items-center gap-2.5 text-[12.5px]">
                <span className="text-muted font-mono">{highlight.repo}</span>
                <a href={highlight.url}>#{highlight.pr}</a>
            </div>
            <h3 className="mb-2.5 text-[17px] leading-tight tracking-[-0.01em]">
                {highlight.title}
            </h3>
            <p className="mb-2.5">{highlight.what}</p>
            <p className="text-muted text-[15px]">{highlight.why}</p>
        </article>
    )
}
