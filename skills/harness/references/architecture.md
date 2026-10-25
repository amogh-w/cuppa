# Architecture of the family

Both projects are Windows daemons that serve a phone web app (PWA) and talk to it over one WebSocket.

```
phone (PWA)  --- HTTP + WebSocket, LAN, paired cookie --->  daemon (Rust, axum)
                                                              |-- OpenRemote: injects mouse/keyboard/media on this PC
                                                              |-- Kai Remote: relays to the Stremio webmod over /bridge
```

## What is shared, and where it comes from

| Thing | Master | Why shared |
|---|---|---|
| cuppa-ui kit (`kit.css`, `palette.css`, `ui.js`, `icons.mjs`, optional `theme.js`) | `skills/cuppa-ui/assets` | One look for every app |
| `pairing.rs` | `shared/` | One-time offers (6-digit code, QR secret, link token), per-device keys (only hashes stored), lockout, rename, remove all, pause |
| `pairroutes.rs`, `pair-client.js`, `pair-screen.html` | `shared/` | The phone's side: `POST /pair`, `/pair/status`, `/pair/forget` and the code screen (kept between `cuppa:pair-screen` markers in the page) |
| `admin.rs`, `admin.html`, `admin.js` | `shared/` | The loopback-only dashboard: add (named offers), rename, remove, pause pairing, autostart, restart |
| `shell.rs`, `autostart.rs` | `shared/` | The tray (Open dashboard, Pair a phone, Copy phone link, Pause pairing, Start with Windows, Open log folder, Restart, Exit), single instance, restart, console attach, message boxes |
| `netguard.rs` | `shared/` | Host and Origin checks that stop DNS rebinding and cross-site requests |
| `sleeptimer.rs` | `shared/` | The sleep timer (set, cancel, end of episode, push to phones). Each app supplies a `Host`: what is playing, how to suspend, the reply key. To add a module like it: `new-shared-module.md` |
| `applog.rs` | `shared/` | Small rotating file log; the only record in a GUI release build |
| `remote-client.js` | `shared/` | The phone's WebSocket link: backoff, reconnect on return, silent-link detection |
| `rustfmt.toml` | `shared/` | Width 120, `use_small_heuristics = "Max"` |

Each project sets only what differs: `PAIRING_COOKIE` and `APP_NAME` in `lib.rs`, the two trait impls (`PairHost`, `AdminHost`) on its state type, its tray icon bytes and the log folder.

## Pairing, dashboard and tray

One offer carries three ways in: the 6-digit code a person types on the phone's pair screen (no camera needed), a QR, and a link whose secret is the token. Offers last 5 minutes and work once; 5 wrong tries lock pairing for 5 minutes. The PC side is the dashboard at `/admin` on loopback only (peer and `Host` must be loopback, every change needs `X-Admin: 1` and a matching `Origin`). The tray opens it, and also offers Pause pairing, Restart and Exit. Restart starts a fresh copy with `--restarted` (it waits for the old one's lock and port); `--startup` is written by Start with Windows and keeps the dashboard from opening at login. One copy runs per port: a second launch opens the dashboard of the first.

## One look, one behavior

Both apps load the same `theme.js`, so flavor, accent (default lavender) and corner radius are chosen the same way, stored under `ui-flavor`, `ui-accent`, `ui-radius`, and survive in the same controls (`data-flavor`, `data-accent`, `data-radius`). App data keys use the app prefix (`or_`, `kai_`). What each app adds on top (touchpad, keyboard, media bar, Stremio screens) uses kit tokens only; a widget needed by both moves into the kit.

## What is deliberately not shared

- The protocol enums and their validation (`Msg` in OpenRemote, `Cmd` in Kai Remote). They differ in shape and rules; each has a contract fixture instead (`tests/fixtures/protocol.json`) checked by a Rust test and a Node test against the phone page.
- Error handling style, settings storage and CLI flags.
- HTTPS: not used; the apps run on the user's LAN.

## Guarantees the checks give

- `harness.mjs status` proves projects hold exact copies of the masters.
- `harness.mjs lint` proves each project's own markup, script and stylesheet follow the cuppa-ui rules: no hex or CDN, motion on the 150/200/260-500 ms scale with transform and opacity only, kit radii and type scale, icons that exist, no unescaped `innerHTML`, `theme.js` as the only theme implementation, `<app>_` storage keys. The scope is each project's `ui.sources` in `harness.json`; the vendored kit and generated css are not scanned.
- Each project's `check.ps1` proves fmt, clippy (warnings are errors), unit and integration tests, and that the phone page sends only messages the server accepts.
