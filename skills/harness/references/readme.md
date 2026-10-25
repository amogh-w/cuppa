# README convention

Every project in the family has a `README.md` with the same sections in the same order, so a reader who knows one knows the other. `templates/README.md` is the starting point (`harness.mjs init` copies it). `CLAUDE.md` is for contributors and the assistant; the README is for people who want to use or understand the app. Do not duplicate between them: the README says what and why, `CLAUDE.md` says how to change it.

## Sections, in this order

| # | Section | Required | Holds |
|---|---|---|---|
| 1 | `# Name` + intro | yes | What it controls and how, in two sentences. Says the phone installs nothing. |
| - | Screenshot | no | One, right under the intro. Mock connection, fictional titles, host `Desktop-PC`. |
| 2 | `## Features` | yes | One bold name and one line each. Group with bold labels past ten items. |
| 3 | `## Quick start` | yes | Requirements, the run command, the numbered first-run steps (tray, dashboard, pair the phone, firewall), then `### Options` (flag table) and `### Install as an app` if relevant. |
| 4 | `## Tray and dashboard` | yes | Shared text, below. |
| 5 | `## Pairing` | yes | Shared text, below. |
| 6 | `## Sleep timer` | if the app has it | Shared text, below. |
| 7 | `## Architecture` | yes | How the parts fit. A diagram or short list, then a paragraph per part. |
| 8 | `## Protocol` | yes | A table of phone messages and replies, or one line pointing at `PROTOCOL.md`. |
| 9 | `## Security` | yes | What is protected and what is not. |
| 10 | `## Project layout` | yes | A tree with one line per entry. |
| 11 | `## Development` | yes | `.\scripts\check.ps1` first, then the app's own commands. Points at `CLAUDE.md`. |
| 12 | `## Roadmap` | yes | `Next`, `Planned`, `Not planned`. Checkboxes. |
| 13 | `## Third-party` | yes | Licenses of what is bundled. |

App-specific extras (OpenRemote's "Input on UAC prompts and the lock screen") go between Protocol and Security. Add a section for them; do not fold them into the ones above.

## Shared text

The three shared sections describe behavior that comes from shared code, so the wording is identical in every project. Only the name, port and default values change. If the behavior changes, change it in both READMEs in the same edit.

**Tray and dashboard**

> The tray icon (near the clock) opens the dashboard and has Pair a phone, Copy phone link, Pause pairing, Start with Windows, Open log folder, Restart and Exit. The dashboard is at `http://127.0.0.1:<port>/admin` and opens only on the PC itself. It lists paired devices, adds a device (with an optional name), renames and removes devices, and pauses pairing. Only one copy runs per port: starting it again opens the dashboard of the running one. Start with Windows launches it quietly (no dashboard). Closing the console or launcher window does not stop it; use Exit in the tray.

**Pairing**

> A phone pairs once, then stays paired until it is removed. The dashboard shows one offer with three ways in: a 6-digit code to type (no camera needed), a QR code, and a link. An offer lasts 5 minutes and works once. Five wrong codes in a row pause pairing for 5 minutes. Each phone gets its own key; only a hash of it is kept on the PC. Pause pairing stops new phones without disconnecting the paired ones.

**Sleep timer**

> Choose 10 sec (a test), 15, 30 or 45 min, 1 or 2 hours, or the end of the episode. The PC keeps the countdown, so it still sleeps if the phone disconnects, and every connected phone shows the same timer. An end-of-episode timer waits while the episode is still playing (paused, for example). It can be cancelled at any time.

## Style

- Plain hyphens and plain punctuation (the `dashfix` skill applies).
- Do not mention or link any other product the app resembles.
- No real window titles, emails, hostnames or app lists in text or screenshots.
- Commands go in fenced `powershell` blocks. Paths and flags in backticks.
- Describe what is true now. Planned work lives only in the Roadmap.
- Update the README in the same change as the behavior: the protocol table, the flag table, the features and the roadmap.
