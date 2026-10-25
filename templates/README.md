# {{name}}

One or two sentences: what it controls and how (a phone web app served by a small Windows program). Say what the
phone needs to install: nothing.

<!-- Optional, right under the intro: one screenshot. Use the mock-connection approach (fictional titles). -->

## Features

- **Name.** What it does for the person, in one line each. Group with bold labels if there are more than ten.

## Quick start

Requirements: Windows 10/11 and a [Rust](https://rustup.rs) toolchain.

```powershell
cargo run --release
```

1. A tray icon appears. Open the dashboard from it and choose *Add a device*.
2. On the phone, on the same Wi-Fi, open `http://<pc-ip>:<port>/` and type the code, scan the QR, or open the link.
3. Allow the program through Windows Firewall (Private networks) if prompted.

### Options

| Flag | Meaning |
|---|---|
| `--autostart` / `--no-autostart` | start with Windows for this user (also a toggle in the tray menu) |
| `--no-tray` | no tray icon; run in the foreground |

## Tray and dashboard

Same text in every project (see `references/readme.md`).

## Pairing

Same text in every project (see `references/readme.md`).

## Sleep timer

Same text in every project (see `references/readme.md`).

## Architecture

How the pieces fit: a diagram or a short list, then one paragraph per part worth knowing.

## Protocol

The messages the phone may send and the replies it gets (a table), or a pointer to `PROTOCOL.md`.

## Security

What is protected, what is not (plain HTTP on the LAN), and the rules that keep it that way.

## Project layout

```
src/        Rust server
web/        the phone app
tests/      end-to-end tests
```

## Development

```powershell
.\scripts\check.ps1     # fmt, clippy, tests, UI lint: same as CI
```

See `CLAUDE.md` for contributor conventions.

## Roadmap

**Next**
- [ ] One line each

**Not planned**: things you decided against.

## Third-party

Icons: [Lucide](https://lucide.dev) (ISC). Palette: [Catppuccin](https://catppuccin.com) (MIT).
