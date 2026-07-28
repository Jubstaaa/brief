export const NOISE_PATTERNS: RegExp[] = [
    /^v?\d+\.\d+\.\d+(-\w+\.\d+)?$/,
    /^(chore|docs?|test|ci|build|style|revert)(\([^)]*\))?!?:/i,
    /^\[(test|docs?|ci)\]/i,
    /dependabot/i,
    /^Update .*\.(md|mdx|txt|json)$/i,
    /^Upgrade React from /i,
    /\bunflake\b/i,
    /\bbump\b .*\bversion\b/i,
    /^Merge branch /i,
    /\btypo\b/i,
]

export const PR_BODY_LIMIT = 1400

export const MAX_FILES_PER_PR = 12

export const PATCH_LIMIT = 450

export const MAX_PATCHED_FILES = 2
