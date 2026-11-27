import { TZDate } from '@date-fns/tz'
import {
    addDays,
    addHours,
    format,
    isAfter,
    isTuesday,
    previousTuesday,
    startOfDay,
    subWeeks,
} from 'date-fns'
import { tr } from 'date-fns/locale'
import { z } from 'zod'

export interface BriefWindow {
    since: string
    until: string
    week: string
}

const TIME_ZONE = 'Europe/Istanbul'

const ANCHOR_HOUR = 9

export function resolveWindow(now: Date): BriefWindow {
    const local = inZone(now)
    const anchored =
        isTuesday(local) && local.getHours() >= ANCHOR_HOUR
            ? local
            : previousTuesday(local)
    const until = addHours(startOfDay(anchored), ANCHOR_HOUR)
    const since = subWeeks(until, 1)

    return {
        since: toUtcIso(since),
        until: toUtcIso(until),
        week: format(until, 'yyyy-MM-dd'),
    }
}

function inZone(date: Date): TZDate {
    return new TZDate(date, TIME_ZONE)
}

function toUtcIso(date: Date): string {
    return new Date(date.getTime()).toISOString()
}

const isoInstant = z.iso
    .datetime({ offset: true })
    .transform(value => toUtcIso(new Date(value)))

const windowOptionsSchema = z
    .object({
        since: isoInstant.optional(),
        until: isoInstant.optional(),
        week: z.iso.date().optional(),
    })
    .refine(
        options =>
            (options.since === undefined) === (options.until === undefined),
        { error: '--since and --until must be passed together' }
    )

const MAX_WINDOW_DAYS = 14

export type WindowOptions = z.input<typeof windowOptionsSchema>

export function formatRange(since: string, until: string): string {
    const firstDay = inZone(new Date(since))
    const lastDay = inZone(new Date(new Date(until).getTime() - 1))

    return `${format(firstDay, 'd MMMM', { locale: tr })} – ${format(lastDay, 'd MMMM', { locale: tr })}`
}

export function windowFromOptions(
    options: WindowOptions,
    now: Date
): BriefWindow {
    const parsed = windowOptionsSchema.safeParse(options)

    if (!parsed.success) throw new Error(z.prettifyError(parsed.error))

    const resolved = resolveWindow(now)
    const since = parsed.data.since ?? resolved.since
    const until = parsed.data.until ?? resolved.until

    const week = format(inZone(new Date(until)), 'yyyy-MM-dd')

    if (since >= until) {
        throw new Error(`since must be before until (${since} >= ${until})`)
    }

    if (isAfter(new Date(until), addDays(new Date(since), MAX_WINDOW_DAYS))) {
        throw new Error(
            `the window is longer than ${MAX_WINDOW_DAYS} days (${since} -> ${until})`
        )
    }

    if (new Date(until) > now) {
        throw new Error(`until ${until} is in the future`)
    }

    if (parsed.data.week !== undefined && parsed.data.week !== week) {
        throw new Error(
            `week ${parsed.data.week} does not match the window ending ${week}`
        )
    }

    return { since, until, week }
}
