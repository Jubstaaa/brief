import type { Release } from '@/lib/types/brief.types'

export interface WeekReleasesProps {
    releases: Release[]
}

export default function WeekReleases({ releases }: WeekReleasesProps) {
    if (!releases.length) return null

    return (
        <>
            <h2 className="section-heading">Sürümler</h2>
            <ul className="flex list-none flex-wrap gap-2 p-0">
                {releases.map(release => (
                    <li key={release.url}>
                        <a
                            className="border-line bg-chip rounded-md border px-[11px] py-[5px] font-mono text-[13px] no-underline"
                            href={release.url}>
                            {release.label} {release.tag}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    )
}
