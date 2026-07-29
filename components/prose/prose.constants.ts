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

export const PROSE_CLASS = PROSE_BASE

export const PROSE_MUTED_CLASS = `${PROSE_BASE} prose-p:text-muted prose-p:text-sm`
