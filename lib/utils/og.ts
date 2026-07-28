export const OG_SIZE = { height: 630, width: 1200 }

export function ogImagePath(slug: string, week: string): string {
    return `/${slug}/${week}/og.png`
}
