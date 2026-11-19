export interface JsonLdProps {
    schema: Record<string, unknown>
}

export default function JsonLd({ schema }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                // Escaped as Next's JSON-LD guide recommends, so a value can never
                // close the script tag.
                __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
            }}
        />
    )
}
