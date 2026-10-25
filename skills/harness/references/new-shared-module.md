# Adding a shared module

Use this when a feature exists (or is about to exist) in both OpenRemote and Kai Remote: a Rust module, a phone-side script or a page snippet. The sleep timer (`shared/sleeptimer.rs`) is the worked example.

## 1. Decide if it belongs in `shared/`

Share it when the behavior must be the same in both apps and only the surroundings differ. Keep it in the project when the behavior is tied to one app's protocol or platform code (OpenRemote's input injection, Kai's mpv bridge). If the two copies already differ, first decide which behavior is right: sharing makes them identical, so a quirk in one becomes a quirk in both.

## 2. Shape it as a module with a small trait

The shared file must not name anything from a project (no `crate::relay`, no `Injector`). Everything that differs goes behind a trait the app implements:

- What the app knows: `fn media(&self) -> Option<Media>`.
- What the app does: `fn suspend(&self)`.
- How the app talks: defaults for the optional ones, so a simple app implements two methods (`notify` does nothing, `key()` is `"t"`).

Keep the wire format out of the module where the apps differ. Here the reply carries no type tag of its own; `Host::key()` names the field (`t` in OpenRemote, `k` in Kai Remote) and the module sets `{key: "sleep"}`.

Put the unit tests in the same file, against a mock of the trait. They run in each project, so a bad change shows up in both.

## 3. Write the master

1. Create `shared/<name>.rs` (or `.js`, `.html`). Start it with a doc comment saying it is shared and where to edit it (copy the first lines of `sleeptimer.rs`).
2. Format Rust with the repo config, from `shared/`: `rustfmt --edition 2021 --config-path rustfmt.toml <name>.rs`. Otherwise each project's `cargo fmt --check` reports drift.
3. JS files get a `<name>.test.mjs` next to them (`node --test "shared/*.test.mjs"`).

## 4. Map it into the projects

In `harness.json`, add one line to each project's `shared` object: `"<name>.rs": "src/<name>.rs"` (web files go under the project's UI folder, for example `"admin.js": "assets/ui/admin.js"`). A page snippet that sits inside a project's own file goes under `regions` instead (see `new-project.md`, step 4).

If a project should not have it yet, leave it out of that project; `status` only checks what is mapped.

Then:

```
node C:\Users\Amogh\Projects\cuppa\scripts\harness.mjs sync --write
node C:\Users\Amogh\Projects\cuppa\scripts\harness.mjs status
```

## 5. Wire it into each project

1. `src/lib.rs`: add `pub mod <name>;`.
2. Implement the trait on something the app already owns, in the app's own file (`relay.rs` in Kai Remote, `command.rs` in OpenRemote). Keep this adapter thin: it translates, it does not decide.
3. Replace the old inline code. Delete what the module now owns, including its tests and constants.
4. If clients need the result pushed to every phone, send it through the app's broadcast channel (Kai Remote: `to_phones`; OpenRemote: `Dispatcher::subscribe`, which each connection listens to).
5. Match the UI: the two apps have different markup, but the same choices (presets, labels, error messages) and the same message names. Add the message to `tests/fixtures/protocol.json` and `tests/protocol.rs` in each project (see "Adding a protocol message" in each `CLAUDE.md`).

## 6. Check and record

1. `<h> check` runs formatting, clippy, tests and the UI lint for both projects, then the plugin's tests.
2. Add the file to the "Shared with the other projects" lists in both projects' `CLAUDE.md`, to the table in `references/architecture.md`, and to the masters list in `SKILL.md`.
3. If you added a new kind of file mapping or a new `harness.mjs` behavior, add a test in `tests/harness.test.mjs`.
4. Bump `version` in `.claude-plugin/plugin.json` and run `/plugin update cuppa@cuppa` so the installed copy matches.

## Mistakes to avoid

- Editing the project copy: the next `sync --write` overwrites it. Edit `shared/`.
- Putting app-specific names in the shared file. If you need one, it is a trait method or a constant the app supplies.
- Sharing the logic but leaving the two UIs different. Same options, same wording.
- Forgetting the Windows-only parts: gate them with `#[cfg(windows)]` in the app's adapter, not in the shared logic, so the shared tests run anywhere.
