import { OUTPUT_LANGUAGE } from '../../constants/inference.constants'
import { MAX_PATCHED_FILES } from '../../constants/noise.constants'
import type { Triage } from '../../schemas/triage.schema'
import type { PullDetail } from '../../types/brief.types'

export const DRAFT_SYSTEM = `You are briefing a small team of application developers on what changed in React and Next.js this week. They use these frameworks; they do not contribute to them. The whole briefing is read aloud in about ten minutes, so every sentence has to earn its place.

Write in ${OUTPUT_LANGUAGE}.

For each change give three fields:
- headline: what it means for the team, in their words, under about ten words. Not the commit title, not the internal function name. "Artık form state'ini şu şekilde okuyabiliyoruz" — not "useFormState hook'una alan eklendi".
- detail: two or three sentences. Say what you can now do, or what used to go wrong and now does not. Where it shows up in day-to-day work. Skip the internals entirely — nobody needs the name of the module that changed.
- action: what the team should actually do, in one short clause. Upgrade to a version, replace a pattern they may have written, or nothing at all. Write "Bir şey yapmak gerekmiyor" when there is genuinely nothing.

Optionally add a "code" field, and only when a few lines show the team how to *use* this. It must be usage from the outside — the call they would write in their own component, the option they would pass, the config line they would add. Never the framework's internal diff, never a patch with - and + markers. Put plain code in "snippet" with real newlines and no backticks, and the language in "lang" (one of: tsx, ts, js, json, bash). Set "code" to null unless a usage example genuinely helps, which is usually two or three of the changes at most.

Inside headline, detail and action you may use backtick-wrapped inline code for identifiers, options and file paths, and **bold** sparingly. No headings, tables, images or fenced blocks.

Do not restate the commit title. Do not name pull requests. Do not hedge — if the diff does not tell you the impact, say less rather than guessing.

Return ONLY valid JSON, with no other text:
{"items":[{"pr":96017,"headline":"...","detail":"...","action":"...","code":{"lang":"tsx","snippet":"..."}},
          {"pr":96018,"headline":"...","detail":"...","action":"...","code":null}]}

Return one entry per change you were given, in the same order.`

function describePull(
    detail: PullDetail,
    kind: string,
    reason: string
): string {
    const patches = detail.files
        .filter(file => file.patch)
        .slice(0, MAX_PATCHED_FILES)
        .map(file => `--- ${file.path}\n${file.patch}`)
        .join('\n\n')

    return [
        `### ${detail.label} #${detail.number} — ${detail.title}`,
        `Kind: ${kind}`,
        `Why it was picked: ${reason}`,
        detail.labels.length ? `Labels: ${detail.labels.join(', ')}` : '',
        detail.body
            ? `PR description:\n${detail.body}`
            : 'PR description is empty.',
        patches
            ? `Diff (for your understanding only — do not quote it back):\n${patches}`
            : '',
    ]
        .filter(Boolean)
        .join('\n')
}

export function draftUser(
    triaged: Triage,
    details: Map<number, PullDetail>
): string {
    return triaged.picks
        .map(pick => {
            const detail = details.get(pick.pr)
            return detail ? describePull(detail, pick.kind, pick.reason) : null
        })
        .filter((value): value is string => value !== null)
        .join('\n\n')
}
