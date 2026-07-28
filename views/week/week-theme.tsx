import type { BriefTheme } from '@/lib/types/brief.types'

export interface WeekThemeProps {
    theme: BriefTheme
}

export default function WeekTheme({ theme }: WeekThemeProps) {
    return (
        <section className="border-line mb-6 border-l-2 py-0.5 pl-[18px]">
            <h3 className="mb-2.5 text-[17px] leading-tight tracking-[-0.01em]">
                {theme.title}
            </h3>
            <p className="text-muted mb-2.5 text-[15px]">{theme.summary}</p>
            {theme.prs.length > 0 && (
                <ul className="list-disc pl-[18px] text-sm">
                    {theme.prs.map(pull => (
                        <li key={pull.url} className="mb-1">
                            <a href={pull.url}>#{pull.number}</a> {pull.title}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
