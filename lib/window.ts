import { TZDate } from '@date-fns/tz'
import {
    addHours,
    format,
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

// The weekly job fires Tuesdays at 09:00 Istanbul. The window is anchored to
// that hour rather than midnight so a commit landing on Tuesday morning makes
// it into the brief published the same day instead of waiting a week.
const ANCHOR_HOUR = 9

// TZDate#toISOString keeps the zone offset; the published window is UTC.
function toUtcIso(date: Date): string {
    return new Date(date.getTime()).toISOString()
}

function inZone(date: Date): TZDate {
    return new TZDate(date, TIME_ZONE)
}

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

const isoInstant = z.iso
    .datetime({ offset: true })
    .transform(value => toUtcIso(new Date(value)))

// The week label becomes the bucket key weeks/<week>.json and a page URL, so
// it must be a plain date; overrides come from workflow_dispatch inputs.
const windowOptionsSchema = z.object({
    since: isoInstant.optional(),
    until: isoInstant.optional(),
    week: z.iso.date().optional(),
})

export type WindowOptions = z.input<typeof windowOptionsSchema>

export function windowFromOptions(
    options: WindowOptions,
    now: Date
): BriefWindow {
    const parsed = windowOptionsSchema.safeParse(options)

    if (!parsed.success) throw new Error(z.prettifyError(parsed.error))

    const resolved = resolveWindow(now)
    const window = {
        since: parsed.data.since ?? resolved.since,
        until: parsed.data.until ?? resolved.until,
        week: parsed.data.week ?? resolved.week,
    }

    if (window.since >= window.until) {
        throw new Error(
            `since must be before until (${window.since} >= ${window.until})`
        )
    }

    return window
}

export function formatRange(since: string, until: string): string {
    const firstDay = inZone(new Date(since))
    const lastDay = inZone(new Date(new Date(until).getTime() - 1))

    return `${format(firstDay, 'd MMMM', { locale: tr })} – ${format(lastDay, 'd MMMM', { locale: tr })}`
}
