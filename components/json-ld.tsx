export interface JsonLdProps {
    schema: Record<string, unknown>
}

export default function JsonLd({ schema }: JsonLdProps) {
    return (
        <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            type="application/ld+json"
        />
    )
}
