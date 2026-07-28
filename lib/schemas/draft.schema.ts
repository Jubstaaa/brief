import { z } from 'zod'

export const draftSchema = z.object({
    highlights: z.array(
        z.object({
            code: z
                .object({ lang: z.string().min(1), snippet: z.string().min(1) })
                .nullish(),
            pr: z.number().int().positive(),
            what: z.string().min(1),
            why: z.string().min(1),
        })
    ),
    themes: z.array(
        z.object({
            prs: z.array(z.number().int().positive()),
            summary: z.string().min(1),
            title: z.string().min(1),
        })
    ),
})

export type Draft = z.infer<typeof draftSchema>
