import { OUTPUT_LANGUAGE } from '../../constants/inference.constants'
import { MAX_PATCHED_FILES } from '../../constants/noise.constants'
import type { Triage } from '../../schemas/triage.schema'
import type { PullDetail } from '../../types/brief.types'

export const DRAFT_SYSTEM = `You are a frontend developer keeping a weekly digest of React and Next.js for yourself.

Write every user-facing string in ${OUTPUT_LANGUAGE}.

For each highlighted change write two fields. Both are **Markdown**.
- what: what the change does technically, 1-2 sentences.
- why: what it means in practice — when it matters and who it affects, 1-2 sentences.

Markdown you may use inside what and why, only where it earns its place:
- Backtick-wrapped inline code for identifiers, flags, config keys and file paths. Use it liberally.
- **bold** for the one term that matters most in a sentence. No headings, tables, images, or fenced code blocks.

Separately, add a "code" field to a highlight when a few lines make the change concrete — the before/after of an API, the shape of a new option, the call that now behaves differently. Put the plain code in "snippet" with real newlines and no backticks or fences, and the language in "lang" (one of: diff, ts, tsx, js, rust, json, bash). When you are showing a before/after taken straight from the diff, keep the leading - and + markers and set "lang" to "diff"; when you are showing a single clean shape, strip the markers and use the real language. Take it from the Diff section you were given; never invent code. At most three highlights may carry a "code" field — pick the ones where the code says something the prose cannot, and set "code" to null on every other highlight. Most highlights should have null.

For each theme write a summary of 1-2 sentences covering what the group has in common.

Return ONLY valid JSON:
{"highlights":[{"pr":96017,"what":"...","why":"...","code":{"lang":"ts","snippet":"const x = 1"}},
               {"pr":96018,"what":"...","why":"...","code":null}],
 "themes":[{"title":"...","summary":"...","prs":[96186]}]}`

function describePull(detail: PullDetail, reason: string): string {
    const files = detail.files
        .map(file => `${file.path} (+${file.additions}/-${file.deletions})`)
        .join(', ')

    const patches = detail.files
        .filter(file => file.patch)
        .slice(0, MAX_PATCHED_FILES)
        .map(file => `--- ${file.path}\n${file.patch}`)
        .join('\n\n')

    return [
        `### ${detail.label} #${detail.number} — ${detail.title}`,
        `Picked because: ${reason}`,
        detail.labels.length ? `Labels: ${detail.labels.join(', ')}` : '',
        `Changed files: ${files || 'unknown'}`,
        detail.body
            ? `PR description:\n${detail.body}`
            : 'PR description is empty.',
        patches ? `Diff:\n${patches}` : '',
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
