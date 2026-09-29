# Sanjay S G: portfolio

My developer portfolio. It is also a project in its own right: every number on the site links to the file that proves it, and the test suite fails if a claim loses its source.

**Live:** LIVE_URL_PLACEHOLDER

## What it is

- A single page (hero, flagship project, work, skills, wins, design) plus one case study page per featured project.
- All copy lives in typed data files, not JSX. Numbers come from my project repos, pinned to the commit I read.
- A `/api/status` route pings each live project and the cards show a live status dot.

## Stack

| Layer     | Choice                                                         |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19                              |
| Language  | TypeScript, `strict` plus `noUncheckedIndexedAccess`           |
| Styling   | Tailwind CSS 4, no UI kit                                      |
| Fonts     | Newsreader and Geist through `next/font` (self-hosted, subset) |
| Tests     | Vitest with v8 coverage                                        |
| Quality   | ESLint (Next core web vitals + TypeScript rules), Prettier     |
| CI        | GitHub Actions: typecheck, lint, format check, coverage, build |
| Hosting   | Vercel                                                         |

## Architecture

```
src/
  content/
    types.ts            Project, Metric {value, label, source}, Todo, Diagram, CaseStudy
    tech.ts             registry of every technology; an unknown one is a compile error
    projects.ts         all project copy, metrics with pinned source links, diagrams
    risk-atlas.ts       RISK//ATLAS tables and headline, computed from its evaluation report
    data/               verbatim copy of Riskops docs/evaluation.json (commit 925aefa)
    profile.ts          hero, facts, wins, design work
    skills.ts           "Shipped with", derived from project stacks
  lib/
    status.ts           checkUrl / checkAll: pure, injected fetch and clock
    status-client.ts    one shared fetch of /api/status for every dot, as an external store
    diagram-layout.ts   grid positions to SVG coordinates, tested without a DOM
    content-walk.ts     walks all copy for tests and the TODO script
  app/
    page.tsx            static home page
    projects/[slug]/    case studies, generated at build time
    api/status/route.ts cached for 5 minutes
  components/           server components, plus two small client ones (theme toggle, status dot)
scripts/list-todos.ts   npm run todos
```

### How the status check works

```
visitor ──> page (static HTML) ──> StatusDot ──fetch──> /api/status (cached, 5 min)
                                                              │
                                                  checkAll: every live URL in parallel
                                                  8 s deadline, one retry on timeout, GET, body not downloaded
                                                              │
                                                  up | down | timeout
```

- The route uses `dynamic = 'force-static'` with `revalidate = 300`. It is prerendered at build and regenerated in the background at most every 5 minutes, so a visitor never waits on a ping or triggers one.
- Pings use `cache: 'no-store'`. Next caches `fetch` by default, and a cached ping would replay an old latency as if it were new.
- `timeout` is its own state. A serverless project waking from a cold start is slow, not broken. This is not hypothetical: the Voice Detection API took more than 10 s to answer its first request while I was planning this site.
- A timeout gets exactly one retry. After the first deploy the Voice API timed out on every check, because checks 5 minutes apart always found it asleep; awake, it answers in about 0.3 s. The first request wakes it, the retry measures it, and the dot says "2nd try" so the cold start stays visible. Other failures are not retried.
- The deadline is raced against the request, so a fetch that ignores its abort signal still times out.
- The client validates the JSON (`isStatusResponse`) before trusting it. If the route cannot be reached, the dot says so.

## Run it

Requires Node 22 or newer.

```bash
npm ci
npm run dev          # http://localhost:3000, TODO markers visible
npm test             # Vitest
npm run coverage     # tests with a coverage report
npm run todos        # every piece of copy I still have to write
npm run check        # typecheck, lint, format check, tests
npm run build && npm start   # production build, TODO markers hidden
```

## What the tests enforce

143 tests. Coverage: COVERAGE_PLACEHOLDER.

- Every project has a repo link (or, for private code, a live URL), a non-empty stack, and one to three metrics or TODOs.
- Every metric and table has an https source, pinned to a 40-character commit SHA so the link cannot silently change.
- No em dash and no banned buzzword ("passionate", "cutting-edge", "leveraging" and others) anywhere in the copy.
- Skills only appear if a project uses them. TypeScript and Node.js stay under "Learning now".
- RISK//ATLAS tables match the project README exactly, and are computed from its evaluation report.
- Diagrams only connect nodes that exist, and box text fits its box.
- Screenshots declare the real size of the image file, so `next/image` never shifts layout.
- The status logic: up, down (HTTP and network failure), timeout, a fetch that ignores abort, parallel checks, response validation.

## Lighthouse

LIGHTHOUSE_PLACEHOLDER

## Decisions

- **Content is typed data.** One `Project` interface, one file. Pages render it; tests audit it.
- **Numbers are derived where possible.** The RISK//ATLAS headline ("0.005 recall, F1 1.00, zero false campaigns across 4,573 benign events") is computed from a verbatim copy of the evaluation report, not typed by hand. The Riskops README still says 4,484 from an earlier run; the report is the source of truth.
- **TODOs are values, not comments.** `todo('...')` marks copy only I can write. It shows with a dashed outline in development, disappears in production, and `npm run todos` lists every one.
- **Diagrams are data drawn as SVG on the server.** A diagram library would ship hundreds of kilobytes of JavaScript to draw a few boxes.
- **CSS is inlined.** Visitors are almost all first-time and the stylesheet is about 7 KB, so a cacheable file buys little and blocks rendering.
- **One serif, weight axis only.** Newsreader's optical-size axis quadrupled the font file (132 KB to 58 KB when removed) for a barely visible gain.
- **Theme without a flash.** A tiny inline script sets the theme before paint. Both icons render and CSS picks one, so server and client markup match. With JavaScript off, the OS setting still applies.
- **Tiers.** RISK//ATLAS is the flagship. Projects with a full case study get cards; the rest get one line. Moving a project up is a one-word change to its `tier`.

## Content sources

Every project description was written after cloning and reading the repo. Metric links point at the exact lines, at these commits:

| Project       | Repo                                                                   | Commit    |
| ------------- | ---------------------------------------------------------------------- | --------- |
| RISK//ATLAS   | [Riskops](https://github.com/Sanjay2408/Riskops)                       | `925aefa` |
| IntelliCredit | [intelli-credit](https://github.com/Sanjay2408/intelli-credit)         | `f01878b` |
| 2ASK Ledger   | [Nitte_2ask](https://github.com/Sanjay2408/Nitte_2ask)                 | `9143cf0` |
| DoseWise      | [DoseWise](https://github.com/Sanjay2408/DoseWise)                     | `3bf3b78` |
| Voice API     | [AI-voice-detection](https://github.com/Sanjay2408/AI-voice-detection) | `471f34b` |
| Cine-NLP      | [Cine-NLP](https://github.com/Sanjay2408/Cine-NLP)                     | `b9d3157` |
| S45 Lens      | private repo; stack read from the live bundle                          |           |
