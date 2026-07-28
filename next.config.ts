import type { NextConfig } from 'next'

const config: NextConfig = {
    images: { unoptimized: true },
    output: 'export',
    trailingSlash: true,
}

export default config
