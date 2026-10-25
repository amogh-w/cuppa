#!/usr/bin/env node
// Copies the kit into a project:  node init.mjs <project-dir> [--ui ui]
// Result:  <project>/ui/{kit.css, palette.css, theme.js, ui.js, icons.mjs, icons.txt}
// then prints the exact build steps. Never overwrites an existing file unless --force is passed.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, "..", "assets");
const args = process.argv.slice(2);
const flag = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
const target = resolve(args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--ui") || ".");
const ui = flag("--ui", "ui");
const force = args.includes("--force");
const dest = join(target, ui);

const files = [
  ["src/kit.css", "kit.css"],
  ["src/palette.css", "palette.css"],
  ["theme.js", "theme.js"],
  ["ui.js", "ui.js"],
  ["scripts/icons.mjs", "icons.mjs"],
  ["icons.txt", "icons.txt"],
];

mkdirSync(dest, { recursive: true });
for (const [from, to] of files) {
  const out = join(dest, to);
  if (existsSync(out) && !force) { console.log(`skip   ${join(ui, to)} (exists, use --force to overwrite)`); continue; }
  copyFileSync(join(assets, from), out);
  console.log(`copied ${join(ui, to)}`);
}

console.log(`
Next steps (from ${target}):
  1. npm i -D tailwindcss@4.1.11 @tailwindcss/cli@4.1.11 lucide-static@0.540.0
  2. Add scripts to package.json:
       "icons": "node ${ui}/icons.mjs --list ${ui}/icons.txt --out public/icons.svg",
       "css":   "tailwindcss -i ${ui}/kit.css -o public/app.css --minify",
       "build": "npm run icons && npm run css"
     (use your own output folder instead of public/ if the app serves files from elsewhere)
  3. In your HTML <head>:  <link rel="stylesheet" href="/app.css"> then <script src="/theme.js"></script>
     (copy ${ui}/theme.js to the served folder, or inline it)
  4. Before </body>:       <script src="/ui.js"></script>
  5. npm run build, then follow SKILL.md and the references it links.
`);
