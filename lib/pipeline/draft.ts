import { compact } from 'es-toolkit'

import { DRAFT_MAX_TOKENS, DRAFT_MODEL } from '../constants/inference.constants'
import { complete } from '../inference/client'
import { DRAFT_SYSTEM, draftUser } from '../inference/prompts/draft.prompt'
import { draftSchema } from '../schemas/draft.schema'
import type { Triage } from '../schemas/triage.schema'
import type {
    BriefHighlight,
    BriefTheme,
    BriefThemePull,
    PullDetail,
} from '../types/brief.types'

export interface DraftResult {
    highlights: BriefHighlight[]
    themes: BriefTheme[]
}

function toThemePull(detail: PullDetail): BriefThemePull {
    return {
        number: detail.number,
        repo: detail.label,
        title: detail.title,
        url: detail.url,
    }
}

export async function draft(
    triaged: Triage,
    details: PullDetail[]
): Promise<DraftResult> {
    const byPr = new Map(details.map(detail => [detail.number, detail]))

    const result = await complete({
        maxTokens: DRAFT_MAX_TOKENS,
        model: DRAFT_MODEL,
        schema: draftSchema,
        system: DRAFT_SYSTEM,
        user: draftUser(triaged, byPr),
    })

    const highlights = compact(
        result.highlights.map(item => {
            const detail = byPr.get(item.pr)

            if (!detail) return undefined

            return {
                pr: item.pr,
                repo: detail.label,
                title: detail.title,
                url: detail.url,
                what: item.what,
                why: item.why,
            }
        })
    )

    const themes: BriefTheme[] = result.themes.map(theme => ({
        prs: compact(theme.prs.map(pr => byPr.get(pr))).map(toThemePull),
        summary: theme.summary,
        title: theme.title,
    }))

    return { highlights, themes }
}
