import { z } from 'zod'

export const briefKindSchema = z.enum([
    'breaking',
    'feature',
    'fix',
    'performance',
    'security',
])

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

export type BriefKind = z.infer<typeof briefKindSchema>

export type RepoTriage = z.infer<typeof repoTriageSchema>

export interface TriagePick {
    kind: BriefKind
    pr: number
    reason: string
    repo: string
}

export interface Triage {
    picks: TriagePick[]
}
