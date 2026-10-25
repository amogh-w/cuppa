// UI lint for cuppa-ui projects: checks that a project's own sources (markup, script, stylesheet) follow the rules
// in skills/cuppa-ui (SKILL.md, references/motion.md, references/checklist.md). The vendored kit and the generated
// css are not scanned; they are the masters. Every finding fails the run.
//
//   lintSource(file, text, opts)  -> [{ file, line, rule, msg }]
//   lintProject(project)          -> findings for every source listed in project.ui.sources
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Durations (ms) the motion scale allows; 0 is for `visibility` flips. See references/motion.md. */
export const DURATIONS = (ms) => ms === 0 || ms === 150 || ms === 200 || (ms >= 260 && ms <= 500);
/** The kit type scale in px (t-cap 12, t-foot 13, t-sub 15, t-callout 16, t-body 17, t-title3 20, ...). */
export const TYPE_SCALE = [12, 13, 15, 16, 17, 20, 22, 28, 34];
const MOVE_OK = new Set(["transform", "opacity", "visibility", "display", "overlay", "background-color", "color", "border-color", "fill", "stroke", "outline-color", "text-decoration-color", "translate", "scale"]);
const KEYFRAME_OK = new Set(["transform", "opacity", "visibility", "animation-timing-function", "translate", "scale"]);
const ICON_OK_NS = /w3\.org\/(2000\/svg|1999\/xlink|1999\/xhtml)/;

/** Blank out comments, keeping every newline so line numbers still match. */
function stripComments(text) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank)
    .replace(/([;{}),])[ \t]+\/\/.*$/gm, (m, c) => c + m.slice(1).replace(/[^\n]/g, " "));
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const splitTop = (s, sep) => {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
};
const toMs = (tok) => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(tok); return m ? (m[2] === "s" ? Math.round(parseFloat(m[1]) * 1000) : parseFloat(m[1])) : null; };

/** Matches of `re` (global) as { index, groups } for text. */
const all = (text, re) => [...text.matchAll(re)];

export function lintSource(file, raw, { icons = null, prefix = null, legacyKeys = [] } = {}) {
  const text = stripComments(raw);
  const out = [];
  const add = (index, rule, msg) => out.push({ file, line: lineOf(text, index), rule, msg });

  // ---- color: only the theme-color meta may hold a hex value ----
  for (const m of all(text, /(?<=[:\s(,])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b(?![\w-])/g)) {
    add(m.index, "color", `hex color ${m[0]}: use a Catppuccin role (bg-base, var(--ctp-*))`);
  }
  for (const m of all(text, /\b(fill|stroke|color|stop-color|content)\s*=\s*["']#[0-9a-fA-F]{3,8}["']/g)) {
    if (m[1] === "content" && /name\s*=\s*["']theme-color["']/.test(text.slice(Math.max(0, m.index - 60), m.index))) continue;
    add(m.index, "color", `hex color in ${m[1]}=: use a Catppuccin role (currentColor, var(--ctp-*))`);
  }
  for (const m of all(text, /\b(rgba?|hsla?|hwb|oklch|lab)\(/g)) add(m.index, "color", `${m[1]}() color literal: use a Catppuccin role`);
  for (const m of all(text, /(?<![\w-])(bg|text|border|ring|from|to|via)-(white|black)\b/g)) add(m.index, "color", `${m[0]}: use a role token`);

  // ---- url: no network, no CDN ----
  for (const m of all(text, /https?:\/\/[^\s"'`)<>]+/g)) {
    if (ICON_OK_NS.test(m[0])) continue;
    add(m.index, "url", `external URL ${m[0]}: the page must work offline`);
  }

  // ---- glyph: no emoji or text glyphs as icons ----
  for (const m of all(text, /\p{Extended_Pictographic}|[←→↑↓↗↘↔⌫⏎✕✓✗×‹›▸▾]/gu)) add(m.index, "glyph", `glyph "${m[0]}": use a Lucide sprite icon`);

  // ---- icon: names must exist in icons.txt ----
  if (icons) {
    const names = [
      ...all(text, /<use\b[^>]*href\s*=\s*["'][^"'#]*#([a-z0-9-]+)["']/g),
      ...all(text, /\bdata-i\s*=\s*["']([a-z0-9-]+)["']/g),
      ...all(text, /\bsvg\(\s*['"]([a-z0-9-]+)['"]/g),
      ...all(text, /\bsetIcon\([^,()]+,\s*['"]([a-z0-9-]+)['"]/g),
    ];
    for (const m of names) if (!icons.has(m[1])) add(m.index, "icon", `icon "${m[1]}" is not in icons.txt`);
  }

  // ---- motion ----
  const checkDuration = (index, tok, what) => {
    const ms = toMs(tok);
    if (ms !== null && !DURATIONS(ms)) add(index, "motion", `${what} ${tok} is off the scale (150ms, 200ms, 260-500ms)`);
  };
  const checkEasing = (index, item) => {
    if (/cubic-bezier\(/.test(item)) add(index, "motion", "own cubic-bezier: use var(--ease)");
    if (/(^|\s)ease-(in|out|in-out)(\s|$)/.test(item)) add(index, "motion", "ease-in/out: use var(--ease)");
  };
  for (const m of all(text, /(?<![\w-])transition\s*[:=]\s*['"`]?([^;{}'"`]+)/g)) {
    for (const item of splitTop(m[1], ",")) {
      const toks = item.trim().split(/\s+(?![^(]*\))/);
      const prop = toks.find((t) => toMs(t) === null && !/^(var\(--ease|linear|ease|steps|cubic|allow-discrete|normal)/.test(t));
      if (prop && !MOVE_OK.has(prop)) add(m.index, "motion", `transition on "${prop}": animate transform and opacity (or color)`);
      const time = toks.find((t) => toMs(t) !== null);
      if (time) checkDuration(m.index, time, "transition");
      checkEasing(m.index, item);
    }
  }
  for (const m of all(text, /(?<![\w-])animation\s*[:=]\s*['"`]?([^;{}'"`]+)/g)) {
    if (/\binfinite\b/.test(m[1]) || /^\s*none\b/.test(m[1])) continue;
    for (const item of splitTop(m[1], ",")) {
      const time = item.trim().split(/\s+(?![^(]*\))/).find((t) => toMs(t) !== null);
      if (time) checkDuration(m.index, time, "animation");
      checkEasing(m.index, item);
    }
  }
  for (const m of all(text, /@keyframes\s+[\w-]+\s*\{/g)) {
    let depth = 1, i = m.index + m[0].length;
    const start = i;
    while (i < text.length && depth) { if (text[i] === "{") depth++; else if (text[i] === "}") depth--; i++; }
    for (const d of all(text.slice(start, i), /([a-z-]+)\s*:/g)) {
      if (!KEYFRAME_OK.has(d[1])) add(m.index, "motion", `@keyframes animates "${d[1]}": only transform and opacity`);
    }
  }
  for (const m of all(text, /(?<![\w-])duration-(\d+)\b/g)) if (!DURATIONS(+m[1])) add(m.index, "motion", `duration-${m[1]} is off the scale`);
  for (const m of all(text, /(?<![\w-])(transition-(all|shadow|\[[^\]]*\])|ease-(in|out|in-out)|transition(?=[\s"';}]))(?![\w:-])/g)) {
    if (m[1] === "transition" && /:/.test(text[m.index + 10] ?? "")) continue;
    add(m.index, "motion", `"${m[1]}": use transition-colors, transition-opacity or transition-transform with var(--ease)`);
  }

  // ---- radius ----
  for (const m of all(text, /(?<![\w-])rounded(?:-[trblse]{1,2})?(?:-(\[[^\]]*\]|sm|md|lg|xl|2xl|3xl))?(?![\w-])/g)) {
    if (m[1] === undefined && !/^rounded(-[trblse]{1,2})?$/.test(m[0])) continue;
    add(m.index, "radius", `${m[0]}: use rounded-ctl|card|sheet|full or var(--r-*)`);
  }
  for (const m of all(text, /border-radius\s*:\s*([^;}]+)/g)) {
    const v = m[1].trim();
    if (/var\(/.test(v) || /^(0|50%|100%|9999px|999px|inherit)(\s|$)/.test(v)) continue;
    add(m.index, "radius", `border-radius ${v}: use var(--r-ctl|card|sheet) or 9999px`);
  }

  // ---- type scale ----
  for (const m of all(text, /(?<![\w-])text-\[(\d+(?:\.\d+)?)(px|rem)\]/g)) add(m.index, "type", `${m[0]}: use the t-* scale (t-cap 12, t-foot 13, t-sub 15, t-callout 16, t-body 17)`);
  for (const m of all(text, /(?<![\w-])text-(sm|lg|[2-9]xl)\b/g)) add(m.index, "type", `${m[0]} is off the kit type scale`);
  for (const m of all(text, /font-size\s*:\s*(\d+(?:\.\d+)?)px/g)) {
    if (!TYPE_SCALE.includes(+m[1])) add(m.index, "type", `font-size ${m[1]}px is off the scale (${TYPE_SCALE.join(", ")})`);
  }

  // ---- surface: the layer order is the kit's (page mantle, card base, control surface0) ----
  for (const m of all(text, /class\s*=\s*["']([^"']*)["']/g)) {
    const cls = m[1].split(/\s+/);
    if (cls.includes("sheet") && cls.some((c) => /^!?bg-(mantle|crust|base|surface\d)$/.test(c))) {
      add(m.index, "surface", "a sheet sets its own background: use sheet-grouped (mantle ground, base cards)");
    }
  }
  for (const m of all(text, /(^|[}\s,])([^{}@\/]*\.(?:group-list|card|sheet|row)\b[^{}]*)\{([^{}]*)\}/gm)) {
    if (/@apply[^;]*(?<![\w-])!?bg-(mantle|crust|base|surface\d)\b|background(-color)?\s*:\s*var\(--ctp-(mantle|crust|base|surface\d)\)/.test(m[3])) {
      add(m.index + m[1].length, "surface", `"${m[2].trim()}" recolors a kit surface: keep the kit's layers (mantle, base, surface0)`);
    }
  }

  // ---- html: untrusted text never goes through innerHTML ----
  for (const m of all(text, /\.(?:innerHTML|outerHTML)\s*=\s*([^;\n]*)|insertAdjacentHTML\([^,]+,\s*([^)\n]*)/g)) {
    const rhs = (m[1] ?? m[2] ?? "").trim();
    if (/^(?:'[^'$]*'|"[^"$]*"|`[^`$]*`)$/.test(rhs)) continue; // a literal
    if (/^ico\(/.test(rhs)) continue; // the kit's icon helper returns trusted markup
    if (/^`/.test(rhs) && [...rhs.matchAll(/\$\{([^}]*)\}/g)].every((x) => /^\s*(esc|ico|raw)\(/.test(x[1]))) continue;
    add(m.index, "html", "innerHTML with a non-literal value: use textContent, build nodes, or wrap each ${} in esc() (text) or raw() (trusted markup)");
  }

  // ---- a11y: icon-only buttons need a label ----
  for (const m of all(text, /<button\b([^>]*)>\s*(?:<svg\b(?:(?!<\/svg>)[\s\S])*<\/svg>|<i\b[^>]*>(?:<\/i>)?)\s*<\/button>/g)) {
    if (!/aria-label\s*=/.test(m[1])) add(m.index, "a11y", "icon-only button without aria-label");
  }

  // ---- theme: one implementation, from theme.js ----
  for (const m of all(text, /setProperty\(\s*['"]--(accent|r-scale)['"]/g)) add(m.index, "theme", `sets --${m[1]} itself: the kit's theme.js owns it`);
  for (const m of all(text, /matchMedia\(\s*['"]\(prefers-color-scheme/g)) add(m.index, "theme", "reads the color scheme itself: theme.js owns it");
  for (const m of all(text, /classList\.(?:add|remove|toggle)\([^)]*\b(?:FLAVORS|latte|mocha|frappe|macchiato)\b/g)) add(m.index, "theme", "switches the flavor class itself: theme.js owns it");

  // ---- storage keys ----
  const keyRe = /(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*['"]([^'"]+)['"]|\bstore\.(?:get|set|remove)\(\s*['"]([^'"]+)['"]|(?<![\w.])(?:get|set|remove)Item\(\s*['"]([^'"]+)['"]/g;
  for (const m of all(text, keyRe)) {
    const key = m[1] ?? m[2] ?? m[3];
    const ok = legacyKeys.includes(key) || /^ui-(flavor|accent|radius)$/.test(key) || (prefix && new RegExp(`^${prefix}_`).test(key));
    if (!ok) add(m.index, "storage", `storage key "${key}": use "${prefix ?? "<app>"}_..." (ui-* is reserved for theme.js)`);
  }
  return out;
}

/** Icon names from icons.txt (one per line, # comments). */
export function readIcons(path) {
  return new Set(readFileSync(path, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#")));
}

export function lintProject(project) {
  const ui = project.ui;
  if (!ui) return { skipped: true, findings: [] };
  const findings = [];
  const icons = ui.icons && existsSync(join(project.root, ui.icons)) ? readIcons(join(project.root, ui.icons)) : null;
  for (const rel of ui.sources ?? []) {
    const path = join(project.root, rel);
    if (!existsSync(path)) { findings.push({ file: rel, line: 0, rule: "config", msg: "source listed in harness.json not found" }); continue; }
    findings.push(...lintSource(rel, readFileSync(path, "utf8"), { icons, prefix: ui.prefix, legacyKeys: ui.legacyKeys ?? [] }));
  }
  if (ui.themeRef) {
    const p = join(project.root, ui.themeRef.file);
    if (!existsSync(p) || !readFileSync(p, "utf8").includes(ui.themeRef.needle)) {
      findings.push({ file: ui.themeRef.file, line: 0, rule: "theme", msg: `does not load the kit's theme.js (expected "${ui.themeRef.needle}")` });
    }
  }
  if (!(project.kit?.files ?? []).includes("theme.js")) findings.push({ file: "harness.json", line: 0, rule: "theme", msg: "kit.files must include theme.js" });
  return { skipped: false, findings };
}
