export interface JsonLdProps {
    schema: Record<string, unknown>
}

export default function JsonLd({ schema }: JsonLdProps) {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
            }}
            type="application/ld+json"
        />
    )
}
