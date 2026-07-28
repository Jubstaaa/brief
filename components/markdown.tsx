import Markdown from 'react-markdown'

import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export interface ProseProps {
    content: string
    muted?: boolean
}

export default function Prose({ content, muted = false }: ProseProps) {
    return (
        <div
            className={muted ? 'prose-brief prose-brief-muted' : 'prose-brief'}>
            <Markdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}>
                {content}
            </Markdown>
        </div>
    )
}
