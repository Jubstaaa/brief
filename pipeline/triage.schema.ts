import { z } from 'zod'

import { BRIEF_KINDS, type BriefKind } from '@/lib/brief'

const briefKindSchema = z.enum(BRIEF_KINDS)

export const repoTriageSchema = z.object({
    picks: z
        .array(
            z.object({
                kind: briefKindSchema,
                pr: z.number().int().positive(),
                reason: z.string().min(1),
            })
        )
        .max(12),
})

export interface Triage {
    picks: TriagePick[]
}

export interface TriagePick {
    kind: BriefKind
    pr: number
    reason: string
    repo: string
}
