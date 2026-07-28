import type { BriefCommit } from '@/lib/types/brief.types'

export interface WeekCommitsProps {
    commits: BriefCommit[]
}

export default function WeekCommits({ commits }: WeekCommitsProps) {
    if (!commits.length) return null

    return (
        <>
            <h2 className="section-heading">Geri kalanı</h2>
            <details className="panel px-[18px] py-3.5">
                <summary className="text-muted text-sm">
                    tüm {commits.length} commit
                </summary>
                <ol className="text-muted mt-3.5 list-decimal pl-[22px] text-[13.5px] leading-loose">
                    {commits.map(commit => (
                        <li key={commit.url}>
                            <a href={commit.url}>{commit.repo}</a>{' '}
                            {commit.title}
                        </li>
                    ))}
                </ol>
            </details>
        </>
    )
}
