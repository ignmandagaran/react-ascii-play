# react-ascii-play

React port of [play.core](https://github.com/ertdfgcvb/play.core): a component that runs an ASCII "program" per cell, per frame, and renders the grid to a `<pre>` (text) or `<canvas>`.

## Layout

- `packages/react-ascii-play/` — the published library.
  - `src/ReactAsciiPlay.tsx` — the component: session (renderer, buffer, `boot`) and run (frame loop) effects.
  - `src/core/` — renderers (`canvasrenderer.js`, `textrenderer.js`), frame cap (`framecap.ts`), FPS counter.
  - `src/modules/*.js` — public helpers, published as `react-ascii-play/modules/<name>`. Each has a **hand-written** `.d.ts` next to it.
  - `src/types/index.ts` — public types.
  - `test/` — bun tests; `test/fixtures/` holds frozen copies of earlier implementations used as test oracles.
- `apps/examples/` — Vite demo app (renders `src/examples/torus.ts`). `src/programs/**` holds ported play.core programs that are **not wired in** and mostly don't resolve; don't use them as a reference.

## Commands

Bun is the package manager and test runner. Run from the repo root unless noted.

| Purpose | Command |
|---|---|
| Install | `bun install` |
| Dev (library watch + demo on :3000) | `bun run dev` |
| Build | `bun run build` |
| Typecheck (sources, tests, and the built package as a consumer sees it) | `bun run typecheck` |
| Tests | `bun run test` (or `bun test` inside `packages/react-ascii-play`) |
| Lint | `bun run lint` |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build. Run all four before committing.

## Rules

- **Rendering output must stay identical.** Performance work is only accepted if it draws the same thing. `test/canvasrenderer.test.ts` compares the canvas renderer against the frozen original (`test/fixtures/canvasrenderer.original.js`) with a recording 2D context; `test/sdf.test.ts` requires bit-identical SDF results (`Object.is`). Don't edit the fixtures to make a test pass.
- **Canvas renderer invariants** (each one is tested):
  - Whitespace cells still set `fillStyle`. An invalid color on a later cell leaves the previous fill in place, so skipping it changes output.
  - Resize the canvas only when the assigned size changes. Compare against the last assigned value, not `canvas.width`, which truncates.
  - Without a resize there is no automatic clear or state reset, so clear, and reset `fillStyle` to black, before filling the background (an invalid background color must not inherit the last cell's color).
- **Module declarations must match the JS.** When you add, rename or remove an export in `src/modules/*.js`, update its `.d.ts`. `test/module-exports.test.ts` and `test/types/consumer.tsx` (run by `typecheck`) fail otherwise.
- **Text renderer writes `innerHTML`.** Cell chars and style values are escaped. `beginHTML`/`endHTML` are written raw on purpose and must stay trusted-only.
- **Lifecycle semantics** (tested in `test/ReactAsciiPlay.test.tsx`):
  - Changing `program`, settings (compared two levels deep) or `loop` starts a new session and runs `boot`.
  - Pausing (hidden tab, scrolled out of view) keeps buffer, frame count and `userData`.
  - Callbacks held by an external `loop` after a run stops must do nothing.
- Hot paths run per cell per frame (thousands of calls): avoid allocating in helpers that programs call from `main`.
- No `any`. Prefer `unknown` and narrow.

## Releases

Changesets. Add one per user-facing library change: `bunx changeset`. Behaviour changes are `minor` while the package is 0.x. The base branch is `main`.

## Git

Conventional commits (`feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `chore:`, `docs:`, `ci:`), one logical change per commit.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
