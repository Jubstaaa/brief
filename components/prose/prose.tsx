import Markdown from 'react-markdown'

import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { PROSE_CLASS, PROSE_MUTED_CLASS } from './prose.constants'
import type { ProseProps } from './prose.types'

export default function Prose({ content, muted = false }: ProseProps) {
    return (
        <div className={muted ? PROSE_MUTED_CLASS : PROSE_CLASS}>
            <Markdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}>
                {content}
            </Markdown>
        </div>
    )
}
