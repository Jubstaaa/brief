import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import RepoLink from '@/components/repo-link/repo-link'
import {
    SITE_DESCRIPTION,
    SITE_LOCALE,
    SITE_NAME,
    SITE_URL,
} from '@/lib/constants/site.constants'

import './globals.css'

export const metadata: Metadata = {
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
        description: SITE_DESCRIPTION,
        locale: SITE_LOCALE,
        siteName: SITE_NAME,
        title: SITE_NAME,
        type: 'website',
        url: '/',
    },
    title: SITE_NAME,
    twitter: {
        card: 'summary_large_image',
        description: SITE_DESCRIPTION,
        title: SITE_NAME,
    },
}

export interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="tr">
            <body>
                <div className="relative mx-auto max-w-3xl px-5 pt-12 pb-24">
                    <RepoLink />
                    {children}
                </div>
            </body>
        </html>
    )
}
