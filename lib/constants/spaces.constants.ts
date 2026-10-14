export const SPACES_REGION = process.env.SPACES_REGION ?? 'fra1'

export const SPACES_BUCKET = process.env.SPACES_BUCKET ?? 'brief-weekly'

export const SPACES_ENDPOINT =
    process.env.SPACES_ENDPOINT ??
    `https://${SPACES_REGION}.digitaloceanspaces.com`

export const SPACES_PUBLIC_BASE_URL =
    process.env.SPACES_PUBLIC_BASE_URL ??
    `https://${SPACES_BUCKET}.${SPACES_REGION}.digitaloceanspaces.com`

export const WEEK_KEY_PREFIX = 'weeks/'

export const INDEX_KEY = 'index.json'
