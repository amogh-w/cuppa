# {{name}}

A phone-remote daemon in the cuppa family: Rust (axum) serving an embedded PWA, paired phones, shared code from the
`cuppa` plugin. Fill in what this project controls and how it is laid out.

## Commands

- Check everything (same as CI): `.\scripts\check.ps1`.
- Keep the shared code and the cuppa-ui kit in step with the masters:
  `node C:\Users\Amogh\Projects\cuppa\scripts\harness.mjs status` (add `sync --write` to repair drift).
- Use PowerShell with `$env:USERPROFILE\.cargo\bin` on PATH. Rust formatting is `rustfmt.toml` (width 120).

## Shared with the other projects (do not edit here)

- `src/pairing.rs`, `src/pairroutes.rs`, `src/admin.rs`, `src/shell.rs`, `src/autostart.rs`, `src/netguard.rs`, `src/applog.rs`, the
  phone-side `remote-client.js`, `pair-client.js`, the dashboard `admin.html` / `admin.js` and the kit in the `ui` folder are
  copies of masters in `C:\Users\Amogh\Projects\cuppa`. Change the master, then run `harness.mjs sync --write`.
- Set `PAIRING_COOKIE` and `APP_NAME` in `src/lib.rs`. Phones are managed in the dashboard (tray > Open dashboard): add with a
  typed code, QR or link, rename, remove, pause pairing.

## Security rules

- Never trust the phone. Validate and clamp every message; drop what does not parse.
- The guard (Host and Origin checks, pairing cookie) must front every route.
- Never log keys, pairing secrets, stream links or other private data (`applog` is for events only).
- Every `unsafe` block gets a `// SAFETY:` comment.

## Adding a protocol message

1. Add the variant and its checks in the Rust protocol module, with a unit test.
2. Add valid and invalid examples to `tests/fixtures/protocol.json` and the name to `name()`/`ALL` in `tests/protocol.rs`.
3. Add the UI. `scripts\check.ps1` fails if the page sends something the fixture lacks.

## Gotchas

- Redirecting cargo's stderr in PowerShell prints a harmless `NativeCommandError`.
- Commit only when asked.
- `README.md` follows `C:\Users\Amogh\Projects\cuppa\skills\harness\references\readme.md`: same sections in the same order, and the Tray and dashboard, Pairing and Sleep timer sections use the shared wording. Update it in the same change as the behavior.
