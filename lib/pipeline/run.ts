import { consola } from 'consola'

import { DRAFT_MODEL, TRIAGE_MODEL } from '../constants/inference.constants'
import { REPOS } from '../constants/repos.constants'
import { fetchCommits } from '../github/commits'
import { fetchReleases } from '../github/releases'
import { publishBrief } from '../storage/publish'
import type { Brief, BriefWindow, RepoCommits } from '../types/brief.types'

import { draft, type DraftResult } from './draft'
import { enrich } from './enrich'
import { triage } from './triage'

const EMPTY_DRAFT: DraftResult = { highlights: [], themes: [] }

async function collectCommits(window: BriefWindow): Promise<RepoCommits[]> {
    const repos: RepoCommits[] = []

    for (const config of REPOS) {
        const result = await fetchCommits(config, window.since, window.until)
        consola.info(
            `${result.label}: ${result.total} commits, ${result.kept.length} kept, ${result.dropped} dropped`
        )
        repos.push(result)
    }

    return repos
}

async function summarise(repos: RepoCommits[]): Promise<DraftResult> {
    const kept = repos.reduce((total, repo) => total + repo.kept.length, 0)

    if (kept === 0) return EMPTY_DRAFT

    consola.start('triaging')
    const triaged = await triage(repos)
    consola.success(
        `picked ${triaged.highlights.length} highlights, ${triaged.themes.length} themes`
    )

    consola.start('fetching pull request detail')
    const details = await enrich(triaged, repos)
    consola.success(`fetched ${details.length} pull requests`)

    consola.start('writing')
    const written = await draft(triaged, details)
    consola.success(
        `wrote ${written.highlights.length} highlights, ${written.themes.length} themes`
    )

    return written
}

function assemble(
    window: BriefWindow,
    repos: RepoCommits[],
    releases: Brief['releases'],
    written: DraftResult
): Brief {
    return {
        commits: repos.flatMap(repo =>
            repo.kept.map(commit => ({
                repo: repo.label,
                title: commit.title,
                url: commit.url,
            }))
        ),
        counts: repos.map(repo => ({
            kept: repo.kept.length,
            label: repo.label,
            total: repo.total,
        })),
        generatedAt: new Date().toISOString(),
        highlights: written.highlights,
        model: `${TRIAGE_MODEL} + ${DRAFT_MODEL}`,
        quiet: written.highlights.length === 0 && written.themes.length === 0,
        releases,
        since: window.since,
        themes: written.themes,
        until: window.until,
        week: window.week,
    }
}

export function reportDryRun(repos: RepoCommits[]): void {
    for (const repo of repos) {
        consola.box(
            `${repo.label} — ${repo.kept.length} kept of ${repo.total}\n\n` +
                repo.kept
                    .map(
                        commit =>
                            `${String(commit.prNumber ?? '-').padStart(6)}  ${commit.title}`
                    )
                    .join('\n')
        )
    }
}

export async function run(window: BriefWindow, dryRun: boolean): Promise<void> {
    consola.info(
        `window ${window.since} -> ${window.until} (week ${window.week})`
    )

    const repos = await collectCommits(window)

    if (dryRun) {
        reportDryRun(repos)
        return
    }

    const releases = (
        await Promise.all(
            REPOS.map(config =>
                fetchReleases(config, window.since, window.until)
            )
        )
    ).flat()
    consola.info(`releases in window: ${releases.length || 'none'}`)

    const brief = assemble(window, repos, releases, await summarise(repos))

    await publishBrief(brief)
    consola.success(
        `published ${brief.week} to Spaces — run \`bun run build\` to render the site`
    )
}
