import { HIGHLIGHT_TARGET } from '../../constants/inference.constants'
import type { RepoCommits } from '../../types/brief.types'

export const TRIAGE_SYSTEM = `You are an experienced frontend developer who follows the React and Next.js commit history closely.
You will be given one week of commit titles from a single repository. Do two things:

1. Pick the most notable changes, at most ${HIGHLIGHT_TARGET}. Prefer changes that alter behaviour, measurably affect performance, introduce an API, or close a class of bug. Skip pure internal refactors and one-off test fixes.
2. Group the remaining commits into meaningful themes (for example "Turbopack file watcher optimisations"). Do not create single-commit themes; each theme needs at least 2 commits.

Return ONLY valid JSON, with no other text:
{"highlights":[{"pr":96017,"reason":"one sentence on why it was picked"}],
 "themes":[{"title":"theme name","prs":[96186,96114],"note":"one sentence on what the theme is"}]}

The pr field is the (#12345) number from the commit title. Keep your reasoning brief.`

export function triageUser(repo: RepoCommits): string {
    const titles = repo.kept.map(commit => commit.title).join('\n')

    return `Repository: ${repo.label}\nCommits this week (${repo.kept.length}):\n\n${titles}`
}
