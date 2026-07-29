import type { JsonLdProps } from './json-ld.types'

export default function JsonLd({ schema }: JsonLdProps) {
    return (
        <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            type="application/ld+json"
        />
    )
}
