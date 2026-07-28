import Prose from '@/components/markdown'
import type { BriefTheme } from '@/lib/types/brief.types'

export interface WeekThemeProps {
    theme: BriefTheme
}

export default function WeekTheme({ theme }: WeekThemeProps) {
    return (
        <section className="panel mb-3 px-6 py-5">
            <div className="mb-3 flex items-baseline gap-3">
                <h3 className="text-[15px] font-medium tracking-[-0.01em]">
                    {theme.title}
                </h3>
                <span className="text-muted ml-auto font-mono text-[12px]">
                    {theme.prs.length} PR
                </span>
            </div>

            <Prose muted content={theme.summary} />

            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-none p-0">
                {theme.prs.map(pull => (
                    <li
                        key={pull.url}
                        className="text-muted list-none font-mono text-[12px]">
                        <a href={pull.url}>#{pull.number}</a>
                    </li>
                ))}
            </ul>
        </section>
    )
}
