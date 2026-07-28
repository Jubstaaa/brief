import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
    description: 'React ve Next.js\u2019te hafta hafta ne değişti.',
    title: 'brief',
}

export interface RootLayoutProps {
    children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="tr">
            <body>
                <div className="mx-auto max-w-[820px] px-5 pt-12 pb-24">
                    {children}
                </div>
            </body>
        </html>
    )
}
