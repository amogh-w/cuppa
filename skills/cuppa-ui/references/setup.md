# Setup

The kit is plain files plus a Tailwind build. Node is needed only at build time; the shipped result is static CSS, a sprite and two small scripts.

## 1. Add the kit to a project

```bash
node <skill-dir>/scripts/init.mjs <project-dir>
```

(`<skill-dir>` is the folder that holds this skill's `SKILL.md`: the `skills/cuppa-ui` folder of the `cuppa` plugin. Use its full path on Windows, for example `C:\Users\<you>\Projects\cuppa\skills\cuppa-ui\scripts\init.mjs` when working from the plugin source.) This copies `kit.css`, `palette.css`, `theme.js`, `ui.js`, `icons.mjs` and `icons.txt` into `<project>/ui/`. It never overwrites existing files unless you pass `--force`. Use `--ui <folder>` to pick a different folder name.

## 2. Install and build

```bash
npm i -D tailwindcss@4.1.11 @tailwindcss/cli@4.1.11 lucide-static@0.540.0
```

Add scripts to `package.json` (change `public/` to the folder your app serves):

```json
"icons": "node ui/icons.mjs --list ui/icons.txt --out public/icons.svg",
"css": "tailwindcss -i ui/kit.css -o public/app.css --minify",
"build": "npm run icons && npm run css"
```

Tailwind v4 scans the project for class names automatically. If your markup lives outside the project root, add `@source "../path";` to `ui/kit.css`. Class names must appear as complete strings in the scanned files; do not build them by string concatenation (`bg-${color}` will not be found unless the full class names exist somewhere in the sources). When classes really are generated from a list, safelist them in `ui/kit.css`, for example `@source inline("bg-{rosewater,mauve,blue}");`.

## 3. Wire the page

```html
<html lang="en" class="mocha">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="/app.css">
  <script src="/theme.js"></script>   <!-- sync, in <head>, prevents a theme flash -->
</head>
<body class="min-h-dvh px-4 pb-24">
  ...
  <script src="/ui.js"></script>
</body>
```

Copy `ui/theme.js` and `ui/ui.js` to the folder the app serves (or inline them). `kit.css` already sets the page background, font and text color on `html` and `body`. For a phone-first app on desktop, cap the width: `body class="mx-auto max-w-[480px]"` and make fixed bars `mx-auto max-w-[480px]` too.

## Serving options

- **Static folder or any framework:** serve `app.css`, `icons.svg`, `theme.js`, `ui.js` as normal static files.
- **Vite or similar:** put the outputs in `public/`, or import the CSS file; keep `theme.js` as a classic script in `<head>`.
- **Rust (axum) with embedded assets:** `const CSS: &str = include_str!("../web/app.css");` and serve it at `/app.css` with `content-type: text/css`; serve `icons.svg` as `image/svg+xml`. Commit the generated files so `cargo build` does not need Node. Regenerate with `npm run build` after changing markup.

Commit the generated `app.css` and `icons.svg` when the app is built without Node on the deploy side; otherwise ignore them and build in CI.

## Preview the kit

```bash
cd <skill-dir>/assets
python -m http.server 8800 --bind 127.0.0.1
# open http://localhost:8800/gallery/index.html
```

The prebuilt `app.css` and `icons.svg` are included, so no install is needed to look. To rebuild the gallery after editing the kit: `npm install && npm run build` in `assets/`, then delete `node_modules` again to keep the skill light.

## Updating the kit

The skill's `assets/src/kit.css` is the source of truth. To update a project: re-run `init.mjs --force` and review the diff (this overwrites local edits to the copied files). Put app-specific tweaks in the app's own stylesheet or in override variables (see `tokens.md`), not inside `ui/kit.css`, so updates stay easy.

## Rules that keep it light and portable

- No CDN, no webfonts, no runtime CSS-in-JS, no UI framework.
- Fonts are the system stack. SF Pro cannot be bundled; on Windows it falls back to Segoe UI. If an exact match across platforms is ever required, self-host Inter, but ask first.
- Only the icons in `icons.txt` ship. Only the utilities your files use are in `app.css`.
- Keep `theme.js` synchronous in `<head>` and `ui.js` last; both have no dependencies.
