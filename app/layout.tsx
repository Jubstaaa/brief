import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiGithub } from '@icons-pack/react-simple-icons'

import {
    SITE_DESCRIPTION,
    SITE_LOCALE,
    SITE_NAME,
    SITE_REPO_URL,
    SITE_URL,
} from '@/lib/site'

import './globals.css'

// A static export has no server to mint nonces, and Next inlines its bootstrap
// scripts, so scripts and styles need 'unsafe-inline'. The policy still pins
// every fetch, image, font and script source to this origin, plus the Web
// Analytics beacon Cloudflare injects at the edge. Headers that a meta
// tag cannot carry (HSTS, frame-ancestors, nosniff) belong to the proxy.
const CONTENT_SECURITY_POLICY = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
].join('; ')

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
    referrer: 'strict-origin-when-cross-origin',
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
            <head>
                {process.env.NODE_ENV === 'production' && (
                    <meta
                        content={CONTENT_SECURITY_POLICY}
                        httpEquiv="Content-Security-Policy"
                    />
                )}
            </head>
            <body>
                <a
                    className="bg-panel text-ink sr-only rounded-md px-3 py-2 text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-5 focus:z-10"
                    href="#main">
                    İçeriğe geç
                </a>
                <div className="relative mx-auto max-w-3xl px-5 pt-12 pb-24">
                    <a
                        aria-label="Kaynak kodu GitHub'da"
                        className="text-muted hover:text-ink absolute top-4 right-5 transition-colors"
                        href={SITE_REPO_URL}
                        rel="noreferrer noopener"
                        target="_blank">
                        <SiGithub size={20} />
                    </a>
                    <main id="main">{children}</main>
                </div>
            </body>
        </html>
    )
}
