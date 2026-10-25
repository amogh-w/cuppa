/* gallery.js: gallery-only chrome (theme panel, section nav, variant captions, demo helpers).
   Component behaviours (segments, tabs, dialogs, menus, toasts, icons) come from ../ui.js. */
"use strict";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const svg = (n, c) => UI.icon(n, c);

/* ---- theme panel (theme.js provides store, applyTheme, ACCENTS) ---- */
$("#swatches").innerHTML = ACCENTS.map((a) => `<button data-accent="${a}" aria-label="${a}" style="background:var(--ctp-${a})" class="size-8 rounded-full ring-text ring-offset-2 ring-offset-mantle"></button>`).join("");
$("#themeBtn").onclick = () => { const p = $("#themePanel"); p.hidden = !p.hidden; };
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-flavor],[data-accent],[data-radius]");
  if (!b) return;
  if (b.dataset.flavor) store.set("ui-flavor", b.dataset.flavor);
  if (b.dataset.accent) store.set("ui-accent", b.dataset.accent);
  if (b.dataset.radius) store.set("ui-radius", b.dataset.radius);
  applyTheme();
});
applyTheme();

/* ---- section nav ---- */
$("#secnav").innerHTML = $$("main > section").map((s) => `<a href="#${s.id}" class="chip shrink-0">${s.dataset.title}</a>`).join("");

/* ---- variant captions ---- */
$$(".variant").forEach((v) => {
  v.classList.add("rounded-card", "border", "border-surface0", "bg-base", "p-4");
  const cap = document.createElement("div");
  cap.className = "t-cap mt-4 text-overlay1";
  cap.textContent = v.dataset.name;
  v.append(cap);
});

/* ---- demo-only helpers: stepper, loading button, toast buttons, motion replay ---- */
$$("[data-stepper]").forEach((s) => s.addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  const c = s.parentElement.querySelector("[data-count]");
  c.textContent = Math.max(0, Number(c.textContent) + Number(b.dataset.step));
}));
$$("[data-loading]").forEach((b) => b.addEventListener("click", () => {
  if (b.dataset.busy) return;
  b.dataset.busy = 1;
  const l = $("[data-label]", b), old = l.textContent;
  l.textContent = "Loading";
  const sp = document.createElement("span");
  sp.className = "spin-ring !size-4 !border-2 !border-crust/30 !border-t-crust";
  b.prepend(sp);
  b.disabled = true;
  setTimeout(() => { sp.remove(); l.textContent = old; b.disabled = false; delete b.dataset.busy; }, 1600);
}));
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-toast]");
  if (t) UI.toast({ info: "Syncing library", success: "Saved to library", error: "Couldn't connect" }[t.dataset.toast], t.dataset.toast);
  const rp = e.target.closest("[data-replay]");
  if (rp) { const el = document.getElementById(rp.dataset.replay); el.classList.remove("anim"); void el.offsetWidth; el.classList.add("anim"); }
});
