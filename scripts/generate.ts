import { Command } from 'commander'
import { consola } from 'consola'

import { windowFromOptions } from '@/lib/window'
import { run } from '@/pipeline/run'

new Command()
    .name('generate')
    .description(
        'Fetch a week of commits, write the brief and publish it to Spaces'
    )
    .option('--dry-run', 'fetch and filter only, no inference calls', false)
    .option(
        '--since <iso>',
        'start of the window, ISO date-time with Z or offset'
    )
    .option(
        '--until <iso>',
        'end of the window, ISO date-time with Z or offset; at most 14 days after --since, not in the future'
    )
    .option(
        '--week <date>',
        'expected week label (YYYY-MM-DD); must be the Istanbul date --until falls on'
    )
    .action(async options => {
        const briefWindow = windowFromOptions(
            { since: options.since, until: options.until, week: options.week },
            new Date()
        )

        await run(briefWindow, options.dryRun)
    })
    .parseAsync()
    .catch(error => {
        consola.error(error)
        process.exit(1)
    })
