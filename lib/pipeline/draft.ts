import { consola } from 'consola'
import { compact } from 'es-toolkit'

import {
    DRAFT_MAX_TOKENS,
    DRAFT_MODEL,
    DRAFT_REASONING_EFFORT,
    MAX_CODE_BLOCKS,
} from '../constants/inference.constants'
import { complete } from '../inference/client'
import { DRAFT_SYSTEM, draftUser } from '../inference/prompts/draft.prompt'
import { draftItemSchema } from '../schemas/draft.schema'
import type { Triage, TriagePick } from '../schemas/triage.schema'
import type { BriefItem, PullDetail } from '../types/brief.types'

async function draftOne(
    pick: TriagePick,
    detail: PullDetail
): Promise<BriefItem | undefined> {
    try {
        const written = await complete({
            maxTokens: DRAFT_MAX_TOKENS,
            model: DRAFT_MODEL,
            reasoningEffort: DRAFT_REASONING_EFFORT,
            schema: draftItemSchema,
            system: DRAFT_SYSTEM,
            user: draftUser(pick, detail),
        })

        return {
            action: written.action,
            code: written.code ?? null,
            detail: written.detail,
            headline: written.headline,
            kind: pick.kind,
            pr: pick.pr,
            repo: pick.repo,
        }
    } catch (error) {
        consola.warn(`drafting ${pick.repo}#${pick.pr} failed, skipping`, error)
        return undefined
    }
}

export async function draft(
    triaged: Triage,
    details: PullDetail[]
): Promise<BriefItem[]> {
    const byPr = new Map(details.map(detail => [detail.number, detail]))

    const items = compact(
        await Promise.all(
            compact(
                triaged.picks.map(pick => {
                    const detail = byPr.get(pick.pr)
                    return detail ? { detail, pick } : undefined
                })
            ).map(({ detail, pick }) => draftOne(pick, detail))
        )
    )

    let codeBlocks = 0
    for (const item of items) {
        if (!item.code) continue
        codeBlocks += 1
        if (codeBlocks > MAX_CODE_BLOCKS) item.code = null
    }

    return items
}
