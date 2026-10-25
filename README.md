# cuppa

A personal Claude Code plugin: the cuppa-ui kit (Tailwind v4 + Catppuccin) as a skill, plus the harness that keeps the phone-remote projects (OpenRemote, Kai Remote) in step.

- `skills/cuppa-ui`: the UI kit and how to use it.
- `skills/harness`: how to sync, check and extend the projects.
- `shared/`: masters of the code the projects share.
- `scripts/harness.mjs`: `status`, `sync --write`, `lint`, `check`, `init`. `scripts/lint.mjs` holds the UI rules.
- `harness.json`: which projects are managed and where their copies live.

## Install

```
/plugin marketplace add C:\Users\Amogh\Projects\cuppa
/plugin install cuppa@cuppa
```

To try it without installing: `claude --plugin-dir C:\Users\Amogh\Projects\cuppa`.

## Working on it

Edit in this folder, not in `~/.claude/plugins/cache`, which is a managed snapshot. After a change run `node scripts/harness.mjs sync --write` to push it into the projects, then bump `version` in `.claude-plugin/plugin.json` and `/plugin update cuppa`.

Tests: `node --test "tests/*.test.mjs" "shared/*.test.mjs"`.

## What "consistent" means here

- The kit files are identical in every project (`status`).
- The projects' own code follows the cuppa-ui rules (`lint`): one theme implementation, one motion scale, kit radii and type sizes, no hex or CDN.
- Both run inside each project's `scripts\check.ps1` (the lint step is skipped, with a notice, where this repo is absent, such as CI).
