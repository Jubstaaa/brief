export function extractJson(raw: string): unknown {
    const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(raw)
    const candidate = fenced?.[1] ?? raw
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')

    if (start === -1 || end <= start)
        throw new Error('no JSON object found in response')

    return JSON.parse(candidate.slice(start, end + 1))
}
