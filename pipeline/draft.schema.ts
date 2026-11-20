import { z } from 'zod'

import { codeLangSchema } from '@/lib/brief'

export const draftItemSchema = z.object({
    action: z.string().min(1),
    // A code sample the site cannot render is dropped rather than failing the
    // item, so one odd language name does not cost the whole draft.
    code: z
        .object({
            lang: codeLangSchema,
            snippet: z.string().min(1),
        })
        .nullish()
        .catch(null),
    detail: z.string().min(1),
    headline: z.string().min(1),
})
