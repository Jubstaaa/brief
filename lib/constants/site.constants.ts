import { REPOS } from './repos.constants'

export const SITE_URL = (
    process.env.BRIEF_SITE_URL ?? 'https://brief.ilkerbalcilar.com'
).replace(/\/$/, '')

export const SITE_NAME = 'brief'

// Derived from REPOS so adding a framework never leaves the copy behind. In a
// Turkish list the case suffix sits on the last item and covers the whole
// enumeration, so the sentence ends with that repo's `locative`.
const titles = REPOS.map(repo => repo.title)
const locatives = REPOS.map(repo => repo.locative)

export const SITE_FRAMEWORKS =
    titles.length === 1
        ? titles.join('')
        : `${titles.slice(0, -1).join(', ')} ve ${titles.at(-1)}`

const framesWithSuffix =
    locatives.length === 1
        ? locatives.join('')
        : `${titles.slice(0, -1).join(', ')} ve ${locatives.at(-1)}`

export const SITE_DESCRIPTION = `${framesWithSuffix} hafta hafta ne değişti.`

export const SITE_LOCALE = 'tr_TR'

export const SITE_LOGO_PATH = '/logo.svg'

export const SITE_REPO_URL = 'https://github.com/Jubstaaa/brief'
