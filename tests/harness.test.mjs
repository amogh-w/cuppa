// node --test "tests/*.test.mjs"
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { KIT_MASTERS, inspect, init, kitVersion, loadProjects, readRegion, sync } from "../scripts/harness.mjs";

let dir, root, proj, project;

const put = (path, text) => {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, text);
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "cuppa-test-"));
  root = join(dir, "plugin"); // a miniature plugin root with its own masters
  proj = join(dir, "proj");
  const assets = join(root, "skills", "cuppa-ui", "assets");
  for (const [name, rel] of Object.entries(KIT_MASTERS)) put(join(assets, rel), `/* palette v1.8.0 */ master ${name}\n`);
  put(join(root, "shared", "applog.rs"), "// master applog\n");
  put(join(root, "shared", "rustfmt.toml"), "max_width = 120\n");
  for (const f of ["check.ps1", "ci.yml", "CLAUDE.md", "README.md"]) put(join(root, "templates", f), `template ${f} for {{name}}\n`);
  project = {
    id: "p",
    name: "P",
    root: proj,
    kit: { dir: "ui", files: ["kit.css", "ui.js"] },
    shared: { "applog.rs": "src/applog.rs" },
  };
  mkdirSync(proj, { recursive: true });
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

test("missing files are reported, and --write creates them with a KIT_VERSION", () => {
  const before = sync([project], { root });
  assert.equal(before.drift, 3);
  assert.ok(before.lines.every((l) => l.includes("(missing)")), before.lines.join("\n"));
  assert.equal(existsSync(join(proj, "ui", "kit.css")), false, "a report alone writes nothing");

  const done = sync([project], { root, write: true });
  assert.equal(done.drift, 3);
  assert.equal(readFileSync(join(proj, "src", "applog.rs"), "utf8"), "// master applog\n");
  assert.equal(readFileSync(join(proj, "ui", "KIT_VERSION"), "utf8"), kitVersion(root));
  assert.equal(sync([project], { root }).drift, 0, "after a sync nothing differs");
});

test("an edited project copy counts as drift and is repaired", () => {
  sync([project], { root, write: true });
  writeFileSync(join(proj, "src", "applog.rs"), "// edited in the project\n");
  const states = Object.fromEntries(inspect(project, root).map((i) => [i.label, i.state]));
  assert.equal(states["applog.rs"], "differs");
  assert.equal(states["kit/kit.css"], "same");
  sync([project], { root, write: true });
  assert.equal(readFileSync(join(proj, "src", "applog.rs"), "utf8"), "// master applog\n");
});

test("line endings alone are not drift", () => {
  sync([project], { root, write: true });
  writeFileSync(join(proj, "src", "applog.rs"), "// master applog\r\n");
  assert.equal(sync([project], { root }).drift, 0);
});

test("the kit version changes when a kit master changes", () => {
  const a = kitVersion(root);
  writeFileSync(join(root, "skills", "cuppa-ui", "assets", "src", "kit.css"), "/* palette v1.8.0 */ changed\n");
  assert.notEqual(kitVersion(root), a);
  assert.match(a, /^cuppa-ui kit [0-9a-f]{12} \(catppuccin palette 1\.8\.0\)\n$/);
});

test("a missing project folder is an error, not a silent pass", () => {
  const gone = { ...project, root: join(dir, "nope") };
  const r = sync([gone], { root });
  assert.equal(r.drift, 1);
  assert.match(r.lines[0], /project folder not found/);
});

test("a missing harness.json says how to create one", () => {
  assert.throws(() => loadProjects(join(dir, "nowhere")), /Copy harness\.example\.json to harness\.json/);
});

test("init scaffolds the gates, fills the name and never overwrites without force", () => {
  const out = join(dir, "new");
  const first = init(out, "demo", { root });
  assert.ok(first.every((l) => l.startsWith("create")), first.join("\n"));
  assert.equal(readFileSync(join(out, "CLAUDE.md"), "utf8"), "template CLAUDE.md for demo\n");
  assert.equal(readFileSync(join(out, "rustfmt.toml"), "utf8"), "max_width = 120\n");
  assert.equal(readFileSync(join(out, "README.md"), "utf8"), "template README.md for demo\n");
  writeFileSync(join(out, "CLAUDE.md"), "mine\n");
  const second = init(out, "demo", { root });
  assert.ok(second.every((l) => l.startsWith("skip")));
  assert.equal(readFileSync(join(out, "CLAUDE.md"), "utf8"), "mine\n");
  init(out, "demo", { root, force: true });
  assert.equal(readFileSync(join(out, "CLAUDE.md"), "utf8"), "template CLAUDE.md for demo\n");
});

test("a region is a shared snippet kept between marker comments in a project's own file", () => {
  put(join(root, "shared", "snippet.html"), "<p>master</p>\n");
  const withRegion = { ...project, regions: { "snippet.html": { file: "page.html", marker: "snip" } } };
  const page = join(proj, "page.html");
  const state = () => inspect(withRegion, root).find((i) => i.region).state;

  writeFileSync(page, "<body>no markers</body>\n");
  assert.equal(state(), "no markers");
  const refused = sync([withRegion], { root, write: true });
  assert.ok(refused.lines.some((l) => l.startsWith("error")), refused.lines.join("\n"));
  assert.equal(readFileSync(page, "utf8"), "<body>no markers</body>\n", "a page without markers is left alone");

  writeFileSync(page, "<body>\n<!-- cuppa:snip:start -->\nold\n<!-- cuppa:snip:end -->\n<footer/></body>\n");
  assert.equal(state(), "differs");
  sync([withRegion], { root, write: true });
  assert.equal(readFileSync(page, "utf8"), "<body>\n<!-- cuppa:snip:start -->\n<p>master</p>\n<!-- cuppa:snip:end -->\n<footer/></body>\n");
  assert.equal(state(), "same");
  assert.equal(readRegion("x", "snip"), null);

  // CRLF pages stay CRLF and still count as in step
  writeFileSync(page, "<body>\r\n<!-- cuppa:snip:start -->\r\nold\r\n<!-- cuppa:snip:end -->\r\n</body>\r\n");
  sync([withRegion], { root, write: true });
  assert.ok(readFileSync(page, "utf8").includes("<p>master</p>\r\n<!-- cuppa:snip:end -->"));
  assert.equal(state(), "same");
});
