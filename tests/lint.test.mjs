// node --test "tests/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { lintSource } from "../scripts/lint.mjs";

const icons = new Set(["check", "search"]);
const rules = (text, opts = {}) => lintSource("t.html", text, { icons, prefix: "app", ...opts }).map((f) => f.rule);
const clean = (text, opts) => assert.deepEqual(rules(text, opts), [], text);
const flags = (text, rule, opts) => assert.ok(rules(text, opts).includes(rule), `expected [${rule}] for: ${text}`);

test("colors: hex, functions and white/black are findings; the theme-color meta and href anchors are not", () => {
  flags(`.a { color: #fff; }`, "color");
  flags(`.a { background: #1e1e2e; }`, "color");
  flags(`<path fill="#ff0000"/>`, "color");
  flags(`.a { color: rgb(1 2 3); }`, "color");
  flags(`<div class="bg-white">`, "color");
  clean(`<meta name="theme-color" content="#1e1e2e">`);
  clean(`<use href="#check"/> <a href="#add"></a> $('#pad'); #app { top: 0 }`);
  clean(`.a { color: var(--ctp-text); background: color-mix(in srgb, var(--accent) 20%, transparent); }`);
});

test("urls: external addresses fail, svg namespaces and comments do not", () => {
  flags(`<script src="https://cdn.example.com/x.js"></script>`, "url");
  flags(`.a { background: url(http://example.com/a.png); }`, "url");
  clean(`document.createElementNS('http://www.w3.org/2000/svg', 'svg')`);
  clean(`/* see https://lucide.dev */ // https://example.com`);
});

test("glyphs and icons: emoji fail, unknown sprite names fail, known ones pass", () => {
  flags(`<button>🔍</button>`, "glyph");
  flags(`<b>×</b>`, "glyph");
  flags(`<svg><use href="#nope"/></svg>`, "icon");
  flags(`b.appendChild(svg('nope', 'size-5'))`, "icon");
  clean(`<svg><use href="/icons.svg#search"/></svg> b.appendChild(svg('check', 'size-5')) setIcon(el, 'search')`);
});

test("motion: only transform/opacity/color, three durations, one easing", () => {
  clean(`.a { transition: transform 0.15s var(--ease), background-color 0.15s; }`);
  clean(`.a { transition: opacity 0.26s var(--ease), transform 0.4s var(--ease), visibility 0s linear 0.26s; }`);
  clean(`.a { animation: rise 0.32s var(--ease) both; } .b { animation: spin 1.3s linear infinite; }`);
  flags(`.a { transition: width 0.5s var(--ease); }`, "motion");
  flags(`.a { transition: box-shadow 0.26s var(--ease); }`, "motion");
  flags(`.a { transition: all 0.2s; }`, "motion");
  flags(`.a { transition: opacity 90ms var(--ease); }`, "motion");
  flags(`.a { animation: ripple 0.6s var(--ease); }`, "motion");
  flags(`.a { transition: transform 0.3s cubic-bezier(0.1, 0.2, 0.3, 0.4); }`, "motion");
  flags(`.a { animation: x 0.3s ease-out; }`, "motion");
  flags(`@keyframes grow { from { width: 0; } to { width: 100%; } }`, "motion");
  flags(`@keyframes pulse { 0% { box-shadow: 0 0 0 0 red; } }`, "motion");
  clean(`@keyframes pop { from { transform: scale(0.6); opacity: 0; } to { transform: none; } }`);
  flags(`<div class="duration-700 transition-opacity">`, "motion");
  flags(`<div class="transition-all duration-200">`, "motion");
  flags(`.a { @apply rounded-ctl px-1 transition; }`, "motion");
  clean(`<div class="transition-opacity duration-500 ease-ios">`);
});

test("radius and type: kit tokens and the type scale only", () => {
  clean(`<div class="rounded-ctl rounded-card rounded-sheet rounded-full rounded-none rounded-t-sheet">`);
  clean(`.a { border-radius: var(--r-card); } .b { border-radius: 50%; } .c { border-radius: calc(var(--r-card) - 2px); }`);
  flags(`<div class="rounded-lg">`, "radius");
  flags(`<div class="rounded">`, "radius");
  flags(`<div class="rounded-[10px]">`, "radius");
  flags(`.a { border-radius: 12px; }`, "radius");
  flags(`<div class="text-[15px]">`, "type");
  flags(`<div class="text-sm">`, "type");
  flags(`.a { font-size: 14px; }`, "type");
  clean(`.a { font-size: 13px; } <div class="t-sub text-xs text-base text-xl">`);
});

test("surface: sheets use sheet-grouped; kit surfaces are not recolored in project css", () => {
  clean(`<dialog class="sheet sheet-grouped max-h-[92dvh]"></dialog> <div class="card bg-base">`);
  flags(`<dialog class="sheet !bg-mantle"></dialog>`, "surface");
  flags(`<dialog id="d" class="sheet bg-base"></dialog>`, "surface");
  flags(`#sheet .group-list { @apply bg-mantle; }`, "surface");
  flags(`.card { background: var(--ctp-crust); }`, "surface");
  clean(`.wcard { @apply rounded-card bg-base; } .clipcard { @apply bg-base; } #sheet .row { @apply w-full; }`);
});

test("html: innerHTML takes literals, esc() and raw() interpolations, nothing else", () => {
  clean("el.innerHTML = '<b>x</b>'; el.innerHTML = ''; b.innerHTML = ico('check');");
  clean("b.innerHTML = `<i>${esc(t)}</i>${raw(trail)}${ico('check')}`;");
  flags("el.innerHTML = name;", "html");
  flags("el.innerHTML = `<i>${t}</i>`;", "html");
  flags("el.innerHTML = '<i>' + t + '</i>';", "html");
});

test("a11y: an icon-only button needs aria-label; a labelled or texted one does not", () => {
  flags(`<button class="btn"><svg><use href="#check"/></svg></button>`, "a11y");
  clean(`<button class="btn" aria-label="Done"><svg><use href="#check"/></svg></button>`);
  clean(`<button class="btn"><svg><use href="#check"/></svg>Done</button> <button>Other</button><svg></svg>`);
});

test("theme: only theme.js sets flavor, accent and radius; storage keys carry the app prefix", () => {
  flags(`root.style.setProperty('--accent', 'x')`, "theme");
  flags(`matchMedia('(prefers-color-scheme: dark)')`, "theme");
  flags(`root.classList.add(FLAVORS[0])`, "theme");
  flags(`localStorage.setItem('settings', '1')`, "storage");
  flags(`store.get("app-settings")`, "storage");
  clean(`localStorage.setItem('app_settings', '1'); store.set("ui-accent", "blue"); store.get('ui-flavor')`);
  clean(`store.get("old-key")`, { legacyKeys: ["old-key"] });
});

test("findings carry the file and a 1-based line number", () => {
  const found = lintSource("a.css", `.a {}\n.b { color: #abc; }\n`);
  assert.equal(found.length, 1);
  assert.equal(found[0].file, "a.css");
  assert.equal(found[0].line, 2);
});
