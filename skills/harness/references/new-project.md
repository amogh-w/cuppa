# Bring a new project into the family

1. Create the project (Rust crate with `src/lib.rs` plus `src/main.rs`, a `web` folder for the PWA).
2. Scaffold the gates: `node C:\Users\Amogh\Projects\cuppa\scripts\harness.mjs init <project-dir> --id <id>`.
   This writes `scripts\check.ps1`, `.github\workflows\ci.yml`, `rustfmt.toml` and a `CLAUDE.md` skeleton, and never overwrites an existing file without `--force`.
3. Add the project to `harness.json` in the plugin repo:
   ```json
   {
     "id": "<id>", "name": "<Name>", "root": "C:/Users/Amogh/Projects/<dir>",
     "kit": { "dir": "web/ui", "files": ["kit.css", "palette.css", "ui.js", "icons.mjs", "theme.js"] },
     "shared": { "remote-client.js": "web/remote-client.js", "pair-client.js": "web/pair-client.js",
                 "admin.html": "web/admin.html", "admin.js": "web/admin.js",
                 "applog.rs": "src/applog.rs", "pairing.rs": "src/pairing.rs", "netguard.rs": "src/netguard.rs",
                 "pairroutes.rs": "src/pairroutes.rs", "admin.rs": "src/admin.rs",
                 "shell.rs": "src/shell.rs", "autostart.rs": "src/autostart.rs" },
     "ui": { "sources": ["web/index.html"], "icons": "web/ui/icons.txt", "prefix": "<id>",
             "themeRef": { "file": "web/index.html", "needle": "/theme.js" } },
     "check": "scripts/check.ps1"
   }
   ```
   `theme.js` is required: every project uses the kit's theme script (flavor, accent, corner radius), with lavender as the default accent. `ui.sources` lists the project's own markup, script and stylesheet files (not the vendored kit or generated css); `harness.mjs lint <id>` checks them.
4. Add `"regions": { "pair-screen.html": { "file": "web/index.html", "marker": "pair-screen" } }` to the project's entry and put `<!-- cuppa:pair-screen:start -->` and `<!-- cuppa:pair-screen:end -->` on two lines in the page, then run `harness.mjs sync --write`. Add `pub mod admin; pub mod applog; pub mod autostart; pub mod netguard; pub mod pairing; pub mod pairroutes; pub mod shell;`, `pub const PAIRING_COOKIE: &str = "<id>_key";` and `pub const APP_NAME: &str = "<Name>";` to `src/lib.rs`. Implement `pairroutes::PairHost` and `admin::AdminHost` for the app state (see `src/lib.rs` in Kai Remote), merge `pairroutes::routes()` and `admin::routes()` into the router and let the guard pass `pairroutes::PUBLIC_PATHS` and `admin::is_admin_path`. `main.rs` calls `shell::single_instance`, `shell::run_tray` and handles `--startup` and `--restarted` (copy Kai Remote's).
5. Follow the cuppa-ui skill for the Tailwind build (`npm run build`), the page and the icons.
6. Add `tests/fixtures/protocol.json`, `tests/protocol.rs` and `tests/frontend_protocol.test.mjs`; copy them from OpenRemote or Kai Remote and adapt the names and the page scan.
7. `harness.mjs lint <id>` and `harness.mjs check <id>` must pass before the first commit.
