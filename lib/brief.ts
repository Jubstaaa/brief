import { z } from 'zod'

export const BRIEF_KINDS = [
    'breaking',
    'feature',
    'fix',
    'performance',
    'security',
] as const

export type BriefKind = (typeof BRIEF_KINDS)[number]

// The archive lives in a public bucket and its links end up in href
// attributes. Every stored link comes from the GitHub API, so anything else
// means the bucket was tampered with.
const githubUrl = z.url({ hostname: /^github\.com$/, protocol: /^https$/ })

// The language is spliced into a Markdown code fence; a newline or backtick
// would end the fence early.
export const codeLangSchema = z.string().regex(/^[\w#+.-]{1,20}$/)

// Slugs become route segments of the static export.
const slugSchema = z.string().regex(/^[a-z0-9-]+$/)

const releaseSchema = z.object({
    label: z.string(),
    publishedAt: z.iso.datetime(),
    tag: z.string(),
    url: githubUrl,
})

export type Release = z.infer<typeof releaseSchema>

const briefItemSchema = z.object({
    action: z.string(),
    code: z.object({ lang: codeLangSchema, snippet: z.string() }).nullable(),
    detail: z.string(),
    headline: z.string(),
    kind: z.enum(BRIEF_KINDS),
    pr: z.number().int().positive(),
    repo: z.string(),
})

export type BriefItem = z.infer<typeof briefItemSchema>

const briefUsageSchema = z.object({
    calls: z.number().int().nonnegative(),
    costUsd: z.number().nonnegative().optional(),
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
})

export type BriefUsage = z.infer<typeof briefUsageSchema>

export const briefSchema = z.object({
    commits: z.array(
        z.object({ repo: z.string(), title: z.string(), url: githubUrl })
    ),
    counts: z.array(
        z.object({
            kept: z.number().int().nonnegative(),
            label: z.string(),
            total: z.number().int().nonnegative(),
        })
    ),
    generatedAt: z.iso.datetime(),
    items: z.array(briefItemSchema),
    model: z.string(),
    quiet: z.boolean(),
    releases: z.array(releaseSchema),
    since: z.iso.datetime(),
    until: z.iso.datetime(),
    usage: briefUsageSchema,
    week: z.iso.date(),
})

export type Brief = z.infer<typeof briefSchema>

const archiveFrameworkSchema = z.object({
    itemCount: z.number().int().nonnegative(),
    slug: slugSchema,
})

export type ArchiveFramework = z.infer<typeof archiveFrameworkSchema>

export const archiveSchema = z.array(
    z.object({
        frameworks: z.array(archiveFrameworkSchema),
        itemCount: z.number().int().nonnegative(),
        since: z.iso.datetime(),
        total: z.number().int().nonnegative(),
        until: z.iso.datetime(),
        week: z.iso.date(),
    })
)

export type ArchiveEntry = z.infer<typeof archiveSchema>[number]

// Names the bucket key in the error, so a failed build or run points at the
// file to fix.
export function parseStored<T extends z.ZodType>(
    schema: T,
    key: string,
    value: unknown
): z.infer<T> {
    const result = schema.safeParse(value)

    if (!result.success) {
        throw new Error(`${key}: ${z.prettifyError(result.error)}`)
    }

    return result.data
}

export function parseStoredJson<T extends z.ZodType>(
    schema: T,
    key: string,
    text: string
): z.infer<T> {
    let value: unknown

    try {
        value = JSON.parse(text)
    } catch (error) {
        throw new Error(`${key}: invalid JSON`, { cause: error })
    }

    return parseStored(schema, key, value)
}
