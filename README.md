# brief

A weekly digest of what changed in React, Next.js, React Native and Expo — [brief.ilkerbalcilar.com](https://brief.ilkerbalcilar.com)

I wanted to keep up with these repos without scrolling GitHub every few days, and
release notes were not enough: React ships releases rarely, so a release-driven digest says
"nothing new" for weeks while dozens of meaningful commits land. This reads the commit
history instead.

Every Tuesday it pulls the last seven days of commits, drops the noise, has a model pick out
what mattered, and builds a static site. The pages are in Turkish; everything else is in
English.

## How it works

```
commits     GitHub API — previous Tuesday 00:00 → this Tuesday 00:00 (UTC+3)
   ↓
filter      drops canary bumps, chore/docs/test/ci, dependabot, React sync commits and
   ↓         flake fixes; deduplicates repeated PR numbers
triage      ~110 titles in, the 9 most notable changes plus themes out
   ↓
enrich      PR body and changed-file list for the picked pull requests
   ↓
draft       per change: what it does, and what it means in practice
   ↓
publish     weeks/<week>.json + index.json → DigitalOcean Spaces
   ↓
next build  reads the published JSON over HTTPS, validates it, static export → out/
```

Model output lives as JSON in a Spaces bucket, and the pages are generated from it. Changing
the design later means re-running `next build`, not paying for inference again.

The split is deliberate: publishing needs write credentials, but the objects are public-read,
so `next build` fetches them over plain HTTPS with no credentials at all.

Neither side trusts the bucket. `index.json` and every week it lists are checked against the
schema in `lib/brief.ts` (dates, item kinds, `https://github.com` links only), and a missing or
invalid file fails the build instead of deploying a site with weeks missing, so a brand-new
bucket needs one `bun run generate` before the first deploy. `publish` checks the new week and
every stored week before it writes anything.

When a build or a weekly run fails on the archive, the error starts with the bucket key
(`weeks/2026-11-17.json: …`). Fix that object in the bucket, or delete it and run
`bun run generate` (or the weekly workflow) so `index.json` is rebuilt without it. If only the
deploy of a weekly run failed (for example a Spaces timeout), use "Re-run failed jobs": that
repeats the build and deploy without calling the model again.

## Commands

```bash
bun install

bun run generate -- --dry-run    # fetch and filter only, no model calls
bun run generate                 # full run for the current week → publishes to Spaces
bun run generate -- --since=2026-07-21T06:00:00Z --until=2026-07-28T06:00:00Z   # backfill

bun run dev                      # preview the pages locally
bun run build                    # static export → out/

bun test
bun run lint
bun run type-check
```

`--dry-run` is the fast loop for tuning the noise filter: it shows what survived without
spending a token.

`--since` and `--until` take ISO date-times with seconds and a `Z` or `±HH:MM` offset
(`2026-07-21T06:00:00Z`, `2026-07-21T09:00:00+03:00`) and are stored in UTC. A backfill passes both
together; leaving both out runs the current week. The window may be at most
14 days and cannot end in the future. The week label is always the Istanbul date the window
ends on; `--week` is optional and only has to match it, so a typo cannot overwrite another
week's file.

## Environment

| Variable                | Needed for  | Notes                                                 |
| ----------------------- | ----------- | ----------------------------------------------------- |
| `DO_INFERENCE_API_KEY`  | model calls | DigitalOcean Gradient model access key                |
| `DO_INFERENCE_BASE_URL` | model calls | defaults to `https://inference.do-ai.run/v1`          |
| `GITHUB_TOKEN`          | GitHub API  | optional locally; without it you get 60 requests/hour |
| `BRIEF_TRIAGE_MODEL`    | model calls | defaults to `glm-5.3-flash`                           |
| `BRIEF_DRAFT_MODEL`     | model calls | defaults to `kimi-k2.6`                               |
| `BRIEF_LANGUAGE`        | model calls | output language, defaults to `Turkish`                |
| `SPACES_KEY`            | publishing  | Spaces access key, scoped to the bucket               |
| `SPACES_SECRET`         | publishing  | Spaces secret key                                     |
| `SPACES_BUCKET`         | both        | defaults to `brief-weekly`                            |
| `SPACES_REGION`         | both        | defaults to `fra1`                                    |

## Deployment

Two workflows, and only one of them costs anything.

`deploy.yml` is the whole deployment: it runs the `ci.yml` gate, runs `next build` against
whatever is already in Spaces, and ships `out/` to the box where Caddy serves it through
`Jubstaaa/deploy-actions/static` (an atomic switch that rolls back if the site stops
answering). It runs
on every push to `main`, so a code change ships without regenerating a brief. Pull requests
get the checks and stop there. No container, no app server — just files.

`weekly.yml` runs the same gate, publishes that week's JSON to Spaces and then calls
`deploy.yml` to render and ship it. The build always happens on a runner, never on the box, which has under 300 MB of
RAM to spare.

The workflow has no `schedule` trigger. GitHub disables scheduled workflows after 60 days
without a commit and this repository can go quiet for longer than that, so the timer lives
on the server instead: a Cronicle event (`brief weekly`, Tuesdays 09:00 Europe/Istanbul,
dashboard at cron.webgooh.tech) runs an inline shell step that hits the
workflow-dispatch API. The fine-grained PAT lives encrypted in Cronicle's secret store
(global scope, exposed to jobs as `BRIEF_GH_TOKEN`) and has `actions: write` on this
repository only; the event retries twice and its run history shows the failure when the
PAT eventually expires.

Nothing is committed back to the repository.

Repository secrets: `DO_INFERENCE_API_KEY`, `SPACES_KEY`, `SPACES_SECRET`, `DEPLOY_SSH_KEY`,
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KNOWN_HOSTS`. They are not edited here: Infisical (project `brief-site`,
`prod` environment) is the source of truth and a secret sync pushes changes to this
repository's Actions secrets automatically.

## Layout

```
app/        routes (Next.js App Router); week-page parts live in app/[framework]/[week]/_components
components/ the JSON-LD tag, shared by every route
lib/        what the site imports: archive reads, feeds, URLs, repos, week windows
pipeline/   build-time generation: GitHub, model calls, schemas, publishing (needs secrets)
scripts/    the generate CLI
```

## Adding a repo

One entry in `REPOS` in `lib/repos.ts`:

```ts
{
    label: 'expo',          // matches the `repo` field the model writes
    locative: "Expo'da",    // title with its Turkish -de/-da suffix
    owner: 'expo',
    repo: 'expo',
    slug: 'expo',           // URL segment: lowercase letters, digits, hyphens
    title: 'Expo',
    noise: [/^some repo-specific noise/i], // optional
},
```

Worth checking `--dry-run` afterwards: every repo has its own commit conventions, and the
noise filter in `pipeline/filter.ts` is tuned against the current ones.

## Sponsorship

The site runs on a small box and the weekly brief costs a few cents of inference, so this is
cheap to keep alive — but not free. If it saves you a scroll through four commit logs every
week, you can support it on
[GitHub Sponsors](https://github.com/sponsors/Jubstaaa) or
[Buy Me a Coffee](https://buymeacoffee.com/jubstaa).
