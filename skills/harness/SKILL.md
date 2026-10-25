---
name: harness
description: The harness for the user's phone-remote projects (OpenRemote and Kai Remote, Rust + axum + PWA with the cuppa-ui kit). Use when syncing the shared code or the cuppa-ui kit between projects, running the projects' quality checks, changing code in shared/ (pairing, netguard, applog, sleeptimer, remote-client.js), adding a new shared module, adding a protocol message, or bringing a new project into the family. Triggers on "harness", "sync the kit", "shared code", "check both projects", "new remote project".
---

# cuppa harness

Two projects share a UI kit and some code. The `cuppa` plugin holds the masters and the tooling that keeps every project in step. This skill tells you how to work with it.

## The rule

**Masters live in the plugin's source repo (`C:\Users\Amogh\Projects\cuppa`), never in a project and never in the plugin cache.** Projects hold copies. If you find yourself editing `src/pairing.rs`, `src/netguard.rs`, `src/applog.rs`, `remote-client.js` or a file in a project's kit folder, stop and edit the master instead, then sync.

Masters:
- cuppa-ui kit: `skills/cuppa-ui/assets` (see the `cuppa-ui` skill).
- Shared code: `shared/` (`pairing.rs`, `pairroutes.rs`, `admin.rs`, `shell.rs`, `autostart.rs`, `netguard.rs`, `sleeptimer.rs`, `applog.rs`, `remote-client.js`, the dashboard and pair-screen web files, tests, `rustfmt.toml`).

## Commands

Run from anywhere; the script finds the masters relative to itself. `<h>` is `node C:\Users\Amogh\Projects\cuppa\scripts\harness.mjs`.

| Command | Does |
|---|---|
| `<h> status` | Reports drift between the masters and every project in `harness.json`. Exit 1 if any. |
| `<h> sync --write` | Copies the masters into the projects and writes each kit's `KIT_VERSION`. |
| `<h> lint [id]` | Checks each project's own UI sources against the cuppa-ui rules (tokens, motion scale, radii, type scale, icons, `innerHTML`, one theme, storage keys). Every finding fails. Also a step of each project's `check.ps1`. |
| `<h> check [id]` | Runs each project's `scripts\check.ps1` (fmt, clippy, tests, page-vs-server contract), then the plugin's own tests. |
| `<h> init <dir> --id <id>` | Scaffolds `scripts\check.ps1`, CI, `rustfmt.toml` and a `CLAUDE.md` for a new project. |

## Workflows

**Change shared code:** edit the file in `shared/`, run `node --test shared/*.test.mjs` if it is JS, `sync --write`, then `check`. Format Rust masters with the repo's `shared/rustfmt.toml` (`rustfmt --edition 2021 <file>`), otherwise each project's `cargo fmt --check` reports drift.

**Change the kit:** edit the cuppa-ui master (its SKILL.md says how), `sync --write`, rebuild each project's CSS (`npm run build`), bump the service worker only if the project says so, then `check`.

**Change a UI rule:** the rule lives once, in the cuppa-ui skill (`references/motion.md` for motion). Change it there, mirror the check in `scripts/lint.mjs` with a test in `tests/lint.test.mjs`, run `lint`, fix what it finds in the projects. Project docs point at the skill and never restate numbers.

**Add a protocol message:** follow the "Adding a protocol message" section of the project's `CLAUDE.md`. The contract fixture, the Rust test's exhaustive `match` and the page scan fail until all three agree.

**Add a shared module** (a feature both apps need, like the sleep timer): `references/new-shared-module.md`.

**Write or change a README:** `references/readme.md` (section order, the three texts shared by every project, style).

**New project:** `references/new-project.md`.

## After editing the plugin

The installed copy under `~/.claude/plugins/cache` is a snapshot. After changing the plugin, bump `version` in `.claude-plugin/plugin.json` and run `/plugin update cuppa` so Claude Code sees the change. The tooling itself always works from the source repo path above.

## More

`references/architecture.md` explains what is shared and why. Read it before moving code between the plugin and a project.
