import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { SiGithub } from '@icons-pack/react-simple-icons'

import {
    SITE_DESCRIPTION,
    SITE_LOCALE,
    SITE_NAME,
    SITE_REPO_URL,
    SITE_URL,
} from '@/lib/constants/site.constants'

import './globals.css'

export const metadata: Metadata = {
    alternates: {
        types: { 'application/rss+xml': '/feed.xml' },
    },
    description: SITE_DESCRIPTION,
    icons: { icon: '/logo.svg' },
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
                    <a
                        aria-label="Kaynak kodu GitHub'da"
                        className="text-muted hover:text-ink absolute top-4 right-5 transition-colors"
                        href={SITE_REPO_URL}
                        rel="noreferrer noopener"
                        target="_blank">
                        <SiGithub size={20} />
                    </a>
                    {children}
                </div>
            </body>
        </html>
    )
}
