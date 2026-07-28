import { consola } from 'consola'

import { DRAFT_MODEL, TRIAGE_MODEL } from '../constants/inference.constants'
import { REPOS } from '../constants/repos.constants'
import { fetchCommits } from '../github/commits'
import { fetchReleases } from '../github/releases'
import { usageTotals } from '../inference/client'
import { publishBrief } from '../storage/publish'
import type {
    Brief,
    BriefItem,
    BriefWindow,
    RepoCommits,
} from '../types/brief.types'

import { draft } from './draft'
import { enrich } from './enrich'
import { triage } from './triage'

const NO_ITEMS: BriefItem[] = []

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

async function summarise(repos: RepoCommits[]): Promise<BriefItem[]> {
    const kept = repos.reduce((total, repo) => total + repo.kept.length, 0)

    if (kept === 0) return NO_ITEMS

    consola.start('triaging')
    const triaged = await triage(repos)
    consola.success(`picked ${triaged.picks.length} relevant changes`)

    consola.start('fetching pull request detail')
    const details = await enrich(triaged, repos)
    consola.success(`fetched ${details.length} pull requests`)

    consola.start('writing')
    const written = await draft(triaged, details)
    consola.success(`wrote ${written.length} items`)

    return written
}

const INPUT_USD_PER_TOKEN = 0.07 / 1_000_000

const OUTPUT_USD_PER_TOKEN = 0.49 / 1_000_000

function buildUsage() {
    const totals = usageTotals()

    return {
        ...totals,
        costUsd:
            totals.inputTokens * INPUT_USD_PER_TOKEN +
            totals.outputTokens * OUTPUT_USD_PER_TOKEN,
    }
}

function assemble(
    window: BriefWindow,
    repos: RepoCommits[],
    releases: Brief['releases'],
    written: BriefItem[]
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
        items: written,
        model: `${TRIAGE_MODEL} + ${DRAFT_MODEL}`,
        quiet: written.length === 0,
        releases,
        since: window.since,
        until: window.until,
        usage: buildUsage(),
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
    consola.info(
        `inference: ${brief.usage.calls} calls, ${brief.usage.inputTokens} in / ${brief.usage.outputTokens} out, ~$${brief.usage.costUsd.toFixed(4)}`
    )
    consola.success(
        `published ${brief.week} to Spaces — run \`bun run build\` to render the site`
    )
}
