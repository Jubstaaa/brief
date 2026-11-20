import { consola } from 'consola'
import { compact } from 'es-toolkit'

import { type BriefItem, codeLangSchema } from '@/lib/brief'
import { findRepo } from '@/lib/repos'
import type { PullDetail } from '@/pipeline/github/pulls'
import { complete } from '@/pipeline/inference/client'
import {
    DRAFT_MAX_TOKENS,
    DRAFT_MODEL,
    DRAFT_REASONING_EFFORT,
    MAX_CODE_BLOCKS,
} from '@/pipeline/inference/config'
import {
    DRAFT_SYSTEM,
    draftUser,
} from '@/pipeline/inference/prompts/draft.prompt'

import { draftItemSchema } from './draft.schema'
import type { Triage, TriagePick } from './triage.schema'

// The site splices the language into a code fence, so it only takes a plain
// token. A sample that does not fit is dropped, not the item, and the warning
// keeps a prompt or model change that breaks every sample from going unseen.
function renderableCode(
    pick: TriagePick,
    code: BriefItem['code'] | undefined
): BriefItem['code'] {
    if (!code) return null

    if (!codeLangSchema.safeParse(code.lang).success) {
        consola.warn(
            `${pick.repo}#${pick.pr}: code language "${code.lang}" cannot be rendered, dropping the sample`
        )
        return null
    }

    return code
}

async function draftOne(
    pick: TriagePick,
    detail: PullDetail
): Promise<BriefItem | undefined> {
    const framework = findRepo(pick.repo)?.title ?? pick.repo

    try {
        const written = await complete({
            maxTokens: DRAFT_MAX_TOKENS,
            model: DRAFT_MODEL,
            reasoningEffort: DRAFT_REASONING_EFFORT,
            schema: draftItemSchema,
            system: DRAFT_SYSTEM,
            user: draftUser(pick, detail, framework),
        })

        return {
            action: written.action,
            code: renderableCode(pick, written.code),
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

function capCodeBlocks(items: BriefItem[]): void {
    const used = new Map<string, number>()

    for (const item of items) {
        if (!item.code) continue

        const count = (used.get(item.repo) ?? 0) + 1
        used.set(item.repo, count)

        if (count > MAX_CODE_BLOCKS) item.code = null
    }
}

export async function draft(
    triaged: Triage,
    details: PullDetail[]
): Promise<BriefItem[]> {
    // PR numbers repeat across repos, so a detail is found by repo and number.
    const byPull = new Map(
        details.map(detail => [`${detail.label}#${detail.number}`, detail])
    )

    const items = compact(
        await Promise.all(
            compact(
                triaged.picks.map(pick => {
                    const detail = byPull.get(`${pick.repo}#${pick.pr}`)

                    if (!detail) {
                        consola.warn(
                            `${pick.repo}#${pick.pr} has no pull request detail, skipping`
                        )
                        return undefined
                    }

                    return { detail, pick }
                })
            ).map(({ detail, pick }) => draftOne(pick, detail))
        )
    )

    // Same trap as triage: every draftOne failure is swallowed, so a broken
    // model would publish an empty brief. Picks without items means drafting
    // broke, not that the week was quiet.
    if (!items.length && triaged.picks.length) {
        throw new Error(
            `drafting failed for all ${triaged.picks.length} picks and produced no items`
        )
    }

    capCodeBlocks(items)

    return items
}
