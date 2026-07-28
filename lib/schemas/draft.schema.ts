import { z } from 'zod'

export const draftSchema = z.object({
    items: z.array(
        z.object({
            action: z.string().min(1),
            code: z
                .object({
                    lang: z.string().min(1),
                    snippet: z.string().min(1),
                })
                .nullish(),
            detail: z.string().min(1),
            headline: z.string().min(1),
            pr: z.number().int().positive(),
        })
    ),
})

export type Draft = z.infer<typeof draftSchema>
