#!/usr/bin/env node
// The cuppa harness: keeps the vendored cuppa-ui kit and the shared code identical in every project listed in
// harness.json, runs each project's checks, and scaffolds new projects.
//
//   node harness.mjs status              report drift (exit 1 if anything differs)
//   node harness.mjs sync [--write]      same report; with --write, copy the masters over and write KIT_VERSION
//   node harness.mjs lint [id]           check each project's own UI sources against the cuppa-ui rules (exit 1 on any finding)
//   node harness.mjs check [id]          run scripts/check.ps1 of every project (or one), then the plugin's own tests
//   node harness.mjs init <dir> --id <id> [--force]   scaffold check script, CI, rustfmt.toml, CLAUDE.md and README.md
//
// The masters are skills/cuppa-ui/assets (the kit) and shared/ (code). Both are found relative to this file, so
// the script behaves the same from the source repo and from the plugin cache. Edit masters in the source repo.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lintProject } from "./lint.mjs";

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Where each kit file comes from, relative to skills/cuppa-ui/assets. Keys are the file names in a project's kit. */
export const KIT_MASTERS = {
  "kit.css": "src/kit.css",
  "palette.css": "src/palette.css",
  "ui.js": "ui.js",
  "icons.mjs": "scripts/icons.mjs",
  "theme.js": "theme.js",
};
/** The files that define a kit version (theme.js is optional per project). */
const KIT_CORE = ["kit.css", "palette.css", "ui.js", "icons.mjs"];

// CRLF checkouts must not count as drift.
const norm = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);

export function loadProjects(root = PLUGIN_ROOT) {
  const projects = JSON.parse(readFileSync(join(root, "harness.json"), "utf8")).projects;
  for (const p of projects) p.root = resolve(p.root);
  return projects;
}

export function kitVersion(root = PLUGIN_ROOT) {
  const assets = join(root, "skills", "cuppa-ui", "assets");
  const palette = norm(join(assets, KIT_MASTERS["palette.css"])).match(/palette v([\d.]+)/i)?.[1] ?? "?";
  const hash = sha(KIT_CORE.map((f) => norm(join(assets, KIT_MASTERS[f]))).join("\n"));
  return `cuppa-ui kit ${hash} (catppuccin palette ${palette})\n`;
}

/** The text between `<!-- cuppa:NAME:start -->` and `<!-- cuppa:NAME:end -->` in a file, or null without markers. */
export function readRegion(text, name) {
  const start = `<!-- cuppa:${name}:start -->`;
  const end = `<!-- cuppa:${name}:end -->`;
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b < a) return null;
  return { head: text.slice(0, a + start.length), inner: text.slice(a + start.length, b), tail: text.slice(b) };
}

/** Every file the harness manages in one project: { label, src, dst, state }. Regions are shared snippets kept
 *  between marker comments inside a project's own file (a page that cannot include files at build time). */
export function inspect(project, root = PLUGIN_ROOT) {
  const assets = join(root, "skills", "cuppa-ui", "assets");
  const items = [];
  for (const f of project.kit?.files ?? []) {
    items.push({ label: `kit/${f}`, src: join(assets, KIT_MASTERS[f]), dst: join(project.root, project.kit.dir, f) });
  }
  for (const [f, rel] of Object.entries(project.shared ?? {})) {
    items.push({ label: f, src: join(root, "shared", f), dst: join(project.root, rel) });
  }
  for (const [f, spec] of Object.entries(project.regions ?? {})) {
    items.push({ label: `${f} in ${spec.file}`, src: join(root, "shared", f), dst: join(project.root, spec.file), region: spec.marker });
  }
  for (const it of items) {
    if (!existsSync(it.dst)) it.state = "missing";
    else if (it.region) {
      const r = readRegion(norm(it.dst), it.region);
      it.state = !r ? "no markers" : r.inner.trim() === norm(it.src).trim() ? "same" : "differs";
    } else it.state = norm(it.dst) === norm(it.src) ? "same" : "differs";
  }
  return items;
}

/** Report (and with `write`, repair) drift in every project. Returns { drift, lines }. */
export function sync(projects, { write = false, root = PLUGIN_ROOT } = {}) {
  const lines = [];
  let drift = 0;
  const version = kitVersion(root);
  for (const project of projects) {
    if (!existsSync(project.root)) {
      lines.push(`error  ${project.name}: project folder not found: ${project.root}`);
      drift++;
      continue;
    }
    for (const it of inspect(project, root)) {
      if (it.state === "same") continue;
      drift++;
      lines.push(`${write ? "update" : "drift "} ${project.name}: ${it.label}${it.state === "same" ? "" : ` (${it.state})`}`);
      if (write && it.region) {
        const raw = readFileSync(it.dst, "utf8");
        const crlf = raw.includes("\r\n");
        const r = readRegion(raw.replace(/\r\n/g, "\n"), it.region);
        if (!r) { lines.push(`error  ${project.name}: add <!-- cuppa:${it.region}:start --> and <!-- cuppa:${it.region}:end --> to ${it.label.split(" in ")[1]} first`); continue; }
        const text = `${r.head}\n${norm(it.src).trim()}\n${r.tail}`;
        writeFileSync(it.dst, crlf ? text.replace(/\n/g, "\r\n") : text);
      } else if (write) {
        mkdirSync(dirname(it.dst), { recursive: true });
        copyFileSync(it.src, it.dst);
      }
    }
    if (write && project.kit) writeFileSync(join(project.root, project.kit.dir, "KIT_VERSION"), version);
  }
  return { drift, lines };
}

/** Lint every project's UI sources. Returns { findings, lines }. */
export function lint(projects, only) {
  const lines = [];
  let findings = 0;
  for (const p of projects.filter((x) => !only || x.id === only)) {
    const r = lintProject(p);
    if (r.skipped) { lines.push(`skip   ${p.name}: no "ui" section in harness.json`); continue; }
    for (const f of r.findings) lines.push(`${p.name}: ${f.file}${f.line ? ":" + f.line : ""} [${f.rule}] ${f.msg}`);
    findings += r.findings.length;
  }
  return { findings, lines };
}

/** Run each project's check script, then the plugin's own node tests. Returns the number of failures. */
export function check(projects, only, root = PLUGIN_ROOT) {
  let failures = 0;
  for (const p of projects.filter((x) => !only || x.id === only)) {
    console.log(`\n=== ${p.name} ===`);
    const script = join(p.root, p.check ?? "scripts/check.ps1");
    const r = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script], { stdio: "inherit" });
    if (r.status !== 0) failures++;
  }
  if (!only) {
    console.log("\n=== cuppa plugin tests ===");
    const r = spawnSync(process.execPath, ["--test", "tests/*.test.mjs", "shared/*.test.mjs"], { cwd: root, stdio: "inherit" });
    if (r.status !== 0) failures++;
  }
  return failures;
}

/** Copy templates/ into a new project, filling {{id}} and {{name}}. Never overwrites without `force`. */
export function init(dir, id, { force = false, root = PLUGIN_ROOT } = {}) {
  const made = [];
  const fill = (s) => s.replaceAll("{{id}}", id).replaceAll("{{name}}", id);
  const put = (rel, text) => {
    const dst = join(dir, rel);
    if (existsSync(dst) && !force) return made.push(`skip   ${rel} (exists, use --force)`);
    mkdirSync(dirname(dst), { recursive: true });
    writeFileSync(dst, text);
    made.push(`create ${rel}`);
  };
  const tpl = join(root, "templates");
  const map = { "check.ps1": "scripts/check.ps1", "ci.yml": ".github/workflows/ci.yml", "CLAUDE.md": "CLAUDE.md", "README.md": "README.md" };
  for (const [from, to] of Object.entries(map)) put(to, fill(readFileSync(join(tpl, from), "utf8")));
  put("rustfmt.toml", readFileSync(join(root, "shared", "rustfmt.toml"), "utf8"));
  return made;
}

function main(argv) {
  const [cmd, ...rest] = argv;
  const flag = (f) => rest.includes(f);
  const value = (f) => (rest.includes(f) ? rest[rest.indexOf(f) + 1] : undefined);
  console.log(`cuppa harness (plugin root: ${PLUGIN_ROOT})`);
  switch (cmd) {
    case "status":
    case "sync": {
      const write = cmd === "sync" && flag("--write");
      const { drift, lines } = sync(loadProjects(), { write });
      lines.forEach((l) => console.log(l));
      console.log(
        drift ? (write ? `${drift} file(s) updated.` : `${drift} file(s) differ. Run: node harness.mjs sync --write`) : "Everything matches the masters.",
      );
      return !write && drift ? 1 : 0;
    }
    case "lint": {
      const { findings, lines } = lint(loadProjects(), rest.find((a) => !a.startsWith("--")));
      lines.forEach((l) => console.log(l));
      console.log(findings ? `${findings} UI finding(s).` : "UI lint clean.");
      return findings ? 1 : 0;
    }
    case "check":
      return check(loadProjects(), rest.find((a) => !a.startsWith("--"))) ? 1 : 0;
    case "init": {
      const dir = rest.find((a) => !a.startsWith("--") && a !== value("--id"));
      const id = value("--id");
      if (!dir || !id) return console.error("usage: harness.mjs init <dir> --id <id> [--force]") ?? 2;
      init(resolve(dir), id, { force: flag("--force") }).forEach((l) => console.log(l));
      console.log(`Next: add "${id}" to harness.json (see skills/harness/references/new-project.md), then run status.`);
      return 0;
    }
    default:
      console.error("usage: harness.mjs status | sync [--write] | lint [id] | check [id] | init <dir> --id <id> [--force]");
      return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
