import { Command } from 'commander'
import { consola } from 'consola'

import { run } from '../lib/pipeline/run'
import { resolveWindow } from '../lib/utils/window'

new Command()
    .name('generate')
    .description(
        'Fetch a week of React and Next.js commits and write data/<week>.json'
    )
    .option('--dry-run', 'fetch and filter only, no inference calls', false)
    .option('--since <iso>', 'override the start of the window')
    .option('--until <iso>', 'override the end of the window')
    .option('--week <date>', 'override the week label (YYYY-MM-DD)')
    .action(async options => {
        const resolved = resolveWindow(new Date())

        await run(
            {
                since: options.since ?? resolved.since,
                until: options.until ?? resolved.until,
                week: options.week ?? resolved.week,
            },
            options.dryRun
        )
    })
    .parseAsync()
    .catch(error => {
        consola.error(error)
        process.exit(1)
    })
