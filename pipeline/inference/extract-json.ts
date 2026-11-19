// Models are asked for JSON only but still wrap it in fences or prose; the
// DigitalOcean endpoint does not enforce response_format for every model.
export function extractJson(raw: string): unknown {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const candidate = fenced ? fenced[1]! : raw
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')

    if (start === -1 || end <= start)
        throw new Error('no JSON object found in response')

    return JSON.parse(candidate.slice(start, end + 1))
}
