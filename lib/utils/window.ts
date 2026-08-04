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

import type { BriefWindow } from '../types/brief.types'

const TIME_ZONE = 'Europe/Istanbul'

// The weekly job fires Tuesdays at 09:00 Istanbul. The window is anchored to
// that hour rather than midnight so a commit landing on Tuesday morning makes
// it into the brief published the same day instead of waiting a week.
const ANCHOR_HOUR = 9

function inZone(date: Date): TZDate {
    return new TZDate(date, TIME_ZONE)
}

function toUtcIso(date: Date): string {
    return new Date(date.getTime()).toISOString()
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

export function formatRange(since: string, until: string): string {
    const firstDay = inZone(new Date(since))
    const lastDay = inZone(new Date(new Date(until).getTime() - 1))

    return `${format(firstDay, 'd MMMM', { locale: tr })} – ${format(lastDay, 'd MMMM', { locale: tr })}`
}
