# brief

A weekly digest of what changed in React and Next.js — [brief.ilkerbalcilar.com](https://brief.ilkerbalcilar.com)

I wanted to keep up with these two repos without scrolling GitHub every few days, and
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
next build  reads the published JSON over HTTPS, static export → out/
```

Model output lives as JSON in a Spaces bucket, and the pages are generated from it. Changing
the design later means re-running `next build`, not paying for inference again.

The split is deliberate: publishing needs write credentials, but the objects are public-read,
so `next build` fetches them over plain HTTPS with no credentials at all.

## Commands

```bash
bun install

bun run generate -- --dry-run    # fetch and filter only, no model calls
bun run generate                 # full run for the current week → publishes to Spaces
bun run generate -- --since=2026-07-20T21:00:00Z --until=2026-07-27T21:00:00Z --week=2026-07-28

bun run dev                      # preview the pages locally
bun run build                    # static export → out/

bun test
bun run lint
bun run type-check
```

`--dry-run` is the fast loop for tuning the noise filter: it shows what survived without
spending a token.

## Environment

| Variable                | Needed for  | Notes                                                 |
| ----------------------- | ----------- | ----------------------------------------------------- |
| `DO_INFERENCE_API_KEY`  | model calls | DigitalOcean Gradient model access key                |
| `DO_INFERENCE_BASE_URL` | model calls | defaults to `https://inference.do-ai.run/v1`          |
| `GITHUB_TOKEN`          | GitHub API  | optional locally; without it you get 60 requests/hour |
| `BRIEF_TRIAGE_MODEL`    | model calls | defaults to `router:software-engineering`             |
| `BRIEF_DRAFT_MODEL`     | model calls | defaults to `router:writing`                          |
| `BRIEF_LANGUAGE`        | model calls | output language, defaults to `Turkish`                |
| `SPACES_KEY`            | publishing  | Spaces access key, scoped to the bucket               |
| `SPACES_SECRET`         | publishing  | Spaces secret key                                     |
| `SPACES_BUCKET`         | both        | defaults to `brief-weekly`                            |
| `SPACES_REGION`         | both        | defaults to `fra1`                                    |

## Deployment

Two workflows, and only one of them costs anything.

`deploy.yml` is the whole deployment: it checks the code, runs `next build` against
whatever is already in Spaces, and rsyncs `out/` to the box where Caddy serves it. It runs
on every push to `main`, so a code change ships without regenerating a brief. Pull requests
get the checks and stop there. No container, no app server — just files.

`weekly.yml` publishes that week's JSON to Spaces and then calls `deploy.yml` to render and
ship it. The build always happens on a runner, never on the box, which has under 300 MB of
RAM to spare.

The workflow has no `schedule` trigger. GitHub disables scheduled workflows after 60 days
without a commit and this repository can go quiet for longer than that, so the timer lives
on the server instead: a Cronicle event (`brief weekly`, Tuesdays 09:00 Europe/Istanbul,
dashboard at cron.ilkerbalcilar.xyz) runs `/opt/cronicle/scripts/brief-weekly.sh`, which
hits the workflow-dispatch API with a fine-grained PAT read from the same directory. The
PAT has `actions: write` on this repository only; the event retries twice and its run
history shows the failure when the PAT eventually expires.

Nothing is committed back to the repository.

Repository secrets: `DO_INFERENCE_API_KEY`, `SPACES_KEY`, `SPACES_SECRET`, `DEPLOY_SSH_KEY`,
`DEPLOY_HOST`, `DEPLOY_USER`.

## Adding a repo

One entry in `lib/constants/repos.constants.ts`:

```ts
export const REPOS: RepoConfig[] = [
    { owner: 'facebook', repo: 'react', label: 'react' },
    { owner: 'vercel', repo: 'next.js', label: 'next.js' },
]
```

Worth checking `--dry-run` afterwards: every repo has its own commit conventions, and the
noise filter is tuned against these two.
