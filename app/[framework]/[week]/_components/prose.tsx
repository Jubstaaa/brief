import Markdown, { defaultUrlTransform } from 'react-markdown'

import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

const PROSE_BASE = [
    'prose prose-neutral dark:prose-invert max-w-none',
    'prose-headings:text-ink prose-strong:text-ink',
    'prose-code:bg-chip prose-code:border prose-code:border-line',
    'prose-code:rounded prose-code:px-1.5 prose-code:py-0.5',
    'prose-code:font-normal',
    'prose-code:before:content-none prose-code:after:content-none',
    'prose-pre:bg-panel prose-pre:border prose-pre:border-line',
    'prose-pre:text-ink',
].join(' ')

const PROSE_MUTED_CLASS = `${PROSE_BASE} prose-p:text-muted prose-p:text-sm`

// The text is written by a model from upstream pull requests and published
// without review, so a link it writes must at least be https.
function httpsOnly(url: string): string {
    const safe = defaultUrlTransform(url)

    return safe.startsWith('https://') ? safe : ''
}

export interface ProseProps {
    content: string
    muted?: boolean
}

export default function Prose({ content, muted = false }: ProseProps) {
    return (
        <div className={muted ? PROSE_MUTED_CLASS : PROSE_BASE}>
            <Markdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
                urlTransform={httpsOnly}>
                {content}
            </Markdown>
        </div>
    )
}
