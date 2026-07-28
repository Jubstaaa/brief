import { z } from 'zod'

export const draftItemSchema = z.object({
    action: z.string().min(1),
    code: z
        .object({
            lang: z.string().min(1),
            snippet: z.string().min(1),
        })
        .nullish(),
    detail: z.string().min(1),
    headline: z.string().min(1),
})

export type DraftItem = z.infer<typeof draftItemSchema>
