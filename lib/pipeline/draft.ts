import { compact } from 'es-toolkit'

import {
    DRAFT_MAX_TOKENS,
    DRAFT_MODEL,
    DRAFT_REASONING_EFFORT,
    MAX_CODE_BLOCKS,
} from '../constants/inference.constants'
import { complete } from '../inference/client'
import { DRAFT_SYSTEM, draftUser } from '../inference/prompts/draft.prompt'
import { draftSchema } from '../schemas/draft.schema'
import type { Triage } from '../schemas/triage.schema'
import type { BriefItem, PullDetail } from '../types/brief.types'

export async function draft(
    triaged: Triage,
    details: PullDetail[]
): Promise<BriefItem[]> {
    if (!triaged.picks.length) return []

    const byPr = new Map(details.map(detail => [detail.number, detail]))
    const kindByPr = new Map(triaged.picks.map(pick => [pick.pr, pick.kind]))

    const result = await complete({
        maxTokens: DRAFT_MAX_TOKENS,
        model: DRAFT_MODEL,
        reasoningEffort: DRAFT_REASONING_EFFORT,
        schema: draftSchema,
        system: DRAFT_SYSTEM,
        user: draftUser(triaged, byPr),
    })

    const items = compact(
        result.items.map(item => {
            const detail = byPr.get(item.pr)
            const kind = kindByPr.get(item.pr)

            if (!detail || !kind) return undefined

            return {
                action: item.action,
                code: item.code ?? null,
                detail: item.detail,
                headline: item.headline,
                kind,
                pr: item.pr,
                repo: detail.label,
            }
        })
    )

    let codeBlocks = 0
    for (const item of items) {
        if (!item.code) continue
        codeBlocks += 1
        if (codeBlocks > MAX_CODE_BLOCKS) item.code = null
    }

    return items
}
