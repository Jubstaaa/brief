import { Command } from 'commander'
import { consola } from 'consola'

import { resolveWindow } from '@/lib/window'
import { run } from '@/pipeline/run'

new Command()
    .name('generate')
    .description(
        'Fetch a week of commits, write the brief and publish it to Spaces'
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
