import { REPOS } from './repos.constants'

export const SITE_URL = (
    process.env.BRIEF_SITE_URL ?? 'https://brief.ilkerbalcilar.com'
).replace(/\/$/, '')

export const SITE_NAME = 'brief'

// Derived from REPOS so adding a framework never leaves the copy behind. The
// list is joined without a Turkish case suffix on purpose: the right suffix
// depends on the last title's vowels ("Expo'da" vs "Native'de"), and no
// framework name should be able to break the sentence.
const titles = REPOS.map(repo => repo.title)

export const SITE_FRAMEWORKS =
    titles.length === 1
        ? titles[0]
        : `${titles.slice(0, -1).join(', ')} ve ${titles.at(-1)}`

export const SITE_DESCRIPTION = `${SITE_FRAMEWORKS} — hafta hafta ne değişti.`

export const SITE_LOCALE = 'tr_TR'

export const SITE_LOGO_PATH = '/logo.svg'

export const SITE_REPO_URL = 'https://github.com/Jubstaaa/brief'
