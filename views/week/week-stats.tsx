import type { BriefCount } from '@/lib/types/brief.types'

export interface WeekStatsProps {
    counts: BriefCount[]
}

export default function WeekStats({ counts }: WeekStatsProps) {
    return (
        <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
            {counts.map(count => (
                <li key={count.label} className="chip">
                    <b className="text-ink font-semibold">{count.kept}</b>{' '}
                    {count.label} <span>/ {count.total}</span>
                </li>
            ))}
        </ul>
    )
}
