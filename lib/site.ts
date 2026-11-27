import { REPOS } from './repos'

export const SITE_URL = (
    process.env.BRIEF_SITE_URL ?? 'https://brief.ilkerbalcilar.com'
).replace(/\/$/, '')

export function pageUrl(...segments: string[]): string {
    return new URL(
        segments.map(segment => `${encodeURIComponent(segment)}/`).join(''),
        `${SITE_URL}/`
    ).href
}

export const SITE_NAME = 'brief'

const titles = REPOS.map(repo => repo.title)
const listFormat = new Intl.ListFormat('tr', { type: 'conjunction' })

export const SITE_FRAMEWORKS = listFormat.format(titles)

const framesWithSuffix = listFormat.format([
    ...titles.slice(0, -1),
    REPOS.at(-1)?.locative ?? '',
])

export const SITE_DESCRIPTION = `${framesWithSuffix} hafta hafta ne değişti.`

export const SITE_LOCALE = 'tr_TR'

export const SITE_LOGO_PATH = '/logo.svg'

export const SITE_REPO_URL = 'https://github.com/Jubstaaa/brief'
