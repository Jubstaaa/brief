import { REPOS } from './repos.constants'

export const SITE_URL = (
    process.env.BRIEF_SITE_URL ?? 'https://brief.ilkerbalcilar.com'
).replace(/\/$/, '')

export const SITE_NAME = 'brief'

// Derived from REPOS so adding a framework never leaves the copy behind. In a
// Turkish list the case suffix sits on the last item and covers the whole
// enumeration, so the sentence ends with that repo's `locative`.
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
