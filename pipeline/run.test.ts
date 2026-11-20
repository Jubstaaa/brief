import {
    afterEach,
    beforeEach,
    describe,
    expect,
    mock,
    spyOn,
    test,
} from 'bun:test'

import { type Brief, briefSchema } from '@/lib/brief'
import { REPOS } from '@/lib/repos'
import * as commits from '@/pipeline/github/commits'
import * as releases from '@/pipeline/github/releases'

import * as draft from './draft'
import * as enrich from './enrich'
import * as publish from './publish'
import { run } from './run'
import * as triage from './triage'

const briefWindow = {
    since: '2026-11-10T06:00:00.000Z',
    until: '2026-11-17T06:00:00.000Z',
    week: '2026-11-17',
}

let published: Brief[] = []

beforeEach(() => {
    published = []
    spyOn(commits, 'fetchCommits').mockImplementation(async config => ({
        dropped: 0,
        kept: [
            {
                prNumber: 1,
                sha: 'a',
                title: 'Fix a thing (#1)',
                url: `https://github.com/${config.owner}/${config.repo}/commit/a`,
            },
        ],
        label: config.label,
        total: 1,
    }))
    spyOn(releases, 'fetchReleases').mockResolvedValue([])
    spyOn(triage, 'triage').mockResolvedValue({ picks: [] })
    spyOn(enrich, 'enrich').mockResolvedValue([])
    spyOn(draft, 'draft').mockResolvedValue([])
    spyOn(publish, 'publishBrief').mockImplementation(async brief => {
        published.push(brief)
    })
})

afterEach(() => {
    mock.restore()
})

describe('run', () => {
    test('a dry run fetches commits only and publishes nothing', async () => {
        await run(briefWindow, true)

        expect(commits.fetchCommits).toHaveBeenCalledTimes(REPOS.length)
        expect(releases.fetchReleases).not.toHaveBeenCalled()
        expect(triage.triage).not.toHaveBeenCalled()
        expect(publish.publishBrief).not.toHaveBeenCalled()
    })

    test('publishes a quiet week that the site accepts when nothing is picked', async () => {
        await run(briefWindow, false)

        expect(published).toHaveLength(1)
        const [brief] = published
        expect(brief?.quiet).toBe(true)
        expect(brief?.items).toEqual([])
        expect(briefSchema.safeParse(brief).success).toBe(true)
    })

    test('lets a publish failure fail the run', async () => {
        spyOn(publish, 'publishBrief').mockRejectedValue(new Error('denied'))

        await expect(run(briefWindow, false)).rejects.toThrow('denied')
    })
})
