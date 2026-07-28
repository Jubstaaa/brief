import { OUTPUT_LANGUAGE } from '../../constants/inference.constants'
import type { Triage } from '../../schemas/triage.schema'
import type { PullDetail } from '../../types/brief.types'

export const DRAFT_SYSTEM = `You are a frontend developer keeping a weekly digest of React and Next.js for yourself.

Write every user-facing string in ${OUTPUT_LANGUAGE}.

For each highlighted change write two fields:
- what: what the change does technically, 1-2 sentences.
- why: what it means in practice — when it matters and who it affects, 1-2 sentences.

Rules:
- Keep established English technical terms as they are (prefetch, cache, watcher, bundler).
- Do not restate the commit title. Say what the title does not.
- No marketing language and no superlatives.
- Do not invent an impact. If the PR body does not support a claim, stay narrow.

For each theme write a summary of 1-2 sentences covering what the group has in common.

Return ONLY valid JSON:
{"highlights":[{"pr":96017,"what":"...","why":"..."}],
 "themes":[{"title":"...","summary":"...","prs":[96186]}]}`

function describePull(detail: PullDetail, reason: string): string {
    const files = detail.files
        .map(file => `${file.path} (+${file.additions}/-${file.deletions})`)
        .join(', ')

    return [
        `### ${detail.label} #${detail.number} — ${detail.title}`,
        `Picked because: ${reason}`,
        detail.labels.length ? `Labels: ${detail.labels.join(', ')}` : '',
        `Changed files: ${files || 'unknown'}`,
        detail.body
            ? `PR description:\n${detail.body}`
            : 'PR description is empty.',
    ]
        .filter(Boolean)
        .join('\n')
}

export function draftUser(
    triaged: Triage,
    details: Map<number, PullDetail>
): string {
    const highlights = triaged.highlights
        .map(highlight => {
            const detail = details.get(highlight.pr)
            return detail ? describePull(detail, highlight.reason) : null
        })
        .filter((value): value is string => value !== null)
        .join('\n\n')

    const themes = triaged.themes
        .map(
            theme =>
                `### ${theme.title}\nPRs: ${theme.prs.join(', ')}\nNote: ${theme.note}`
        )
        .join('\n\n')

    return `# Highlights\n\n${highlights}\n\n# Themes\n\n${themes}`
}
