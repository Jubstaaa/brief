import { z } from 'zod'

export const repoTriageSchema = z.object({
    highlights: z
        .array(
            z.object({
                pr: z.number().int().positive(),
                reason: z.string().min(1),
            })
        )
        .max(20),
    themes: z
        .array(
            z.object({
                note: z.string().min(1),
                prs: z.array(z.number().int().positive()),
                title: z.string().min(1),
            })
        )
        .max(12),
})

export type RepoTriage = z.infer<typeof repoTriageSchema>

export interface TriageHighlight {
    pr: number
    reason: string
    repo: string
}

export interface Triage {
    highlights: TriageHighlight[]
    themes: RepoTriage['themes']
}
