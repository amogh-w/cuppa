---
name: cuppa-ui
description: "Consistent, modern Apple-style UI kit built on Tailwind v4 and the Catppuccin palette (Latte, Frappe, Macchiato, Mocha) with a runtime flavor, accent and radius switcher. Use when building or restyling any web app, page, dashboard, remote or settings screen, when the user wants their apps to look consistent, or mentions Apple/iOS look, Catppuccin theming, buttons, cards, modals, sheets, toasts, loaders, tab bars or icon sets. Offline-first, so no CDN, no webfonts, no UI framework."
---

# cuppa-ui

One small kit (CSS + about 2 KB gzipped of JS + an icon sprite) that gives every app the same look: iOS-style controls, grouped lists, sheets and toasts on Catppuccin colors. It is the single source of truth for how the user's apps look. Reuse it instead of inventing styles.

## What the kit is

- `assets/src/kit.css`: Tailwind v4 entry. Tokens, every component class, keyframes.
- `assets/src/palette.css`: Catppuccin v1.8.0, four flavors as `--ctp-*` variables.
- `assets/theme.js`: load in `<head>`. Sets flavor (Auto = Latte in light, Mocha in dark), accent and radius before first paint.
- `assets/ui.js`: load before `</body>`. Segmented thumb, tabs, chips, range fill, dialogs, menus, `UI.toast()`, icon helper.
- `assets/scripts/icons.mjs`: builds a Lucide SVG sprite from a list of icon names.
- `assets/app.css` and `assets/icons.svg`: prebuilt output, so the gallery works without installing anything.
- `assets/gallery/index.html`: the living style guide with every component and variant, plus a theme panel (flavor, accent, radius). Open it to see the look (see `references/setup.md`).
- `scripts/init.mjs`: copies the kit into a project.

## Workflow

1. New app or first use in a project: run `node <skill>/scripts/init.mjs <project-dir>` and follow the printed steps (`references/setup.md`).
2. Build screens from kit classes. Look up markup in the reference for the component you need (table below). Copy the snippet, change the text.
3. Use Tailwind utilities for layout and spacing only (flex, grid, gap, padding, width). Components get their look from kit classes.
4. Before finishing, run `references/checklist.md` and look at the result in Latte and Mocha.

## Core rules

- **One button radius.** Every `btn` uses `--r-ctl`, which follows the Corner radius control. No pill buttons, no per-button rounding.
- **Press, not lift.** Tappable cards (`card-tap`) and buttons scale down on press. No hover lift.
- **Class first.** Use `.btn .btn-filled`, `.card`, `.field`, not long utility strings. If a component exists in the kit, use it.
- **Tokens only.** Colors come from Catppuccin roles (`bg-base`, `text-subtext0`, `bg-accent`). Never hard-code hex. Allowed exceptions: the white switch knob and slider thumb.
- **Layers:** page `mantle`, card `base`, control `surface0`, pressed or raised `surface1`. Text on a solid accent or semantic color is `text-crust`.
- **One accent per screen.** `accent` is user-switchable. Use `green`, `red`, `yellow`, `blue` only for meaning (success, danger, warning, info).
- **Targets and type:** 44px minimum hit area, 17px body, system font stack (SF Pro on Apple, Segoe UI on Windows). No webfonts.
- **Icons:** Lucide only, from the sprite. No emoji as icons. Icon-only buttons need `aria-label`.
- **Motion:** only `transform` and `opacity`; durations 150ms, 200ms (opacity half of a fade) or 260-500ms; one easing curve. `references/motion.md` is the only place the numbers are written. Reduced motion is already honored.
- **Overlays:** native `<dialog>` and `popover`. No overlay libraries.
- **Offline:** no CDN scripts, fonts or images from third parties. Everything the page needs is built locally.
- **Both themes:** every screen must read well in Latte (light) and Mocha (dark).
- **One theme implementation.** Every app loads the kit's `theme.js` and uses its hooks (`data-flavor`, `data-accent`, `data-radius`) in the settings UI. The default accent is lavender. Never write a second flavor or accent switcher.
- **Storage keys:** the theme owns `ui-flavor`, `ui-accent`, `ui-radius`. App data uses an `<app>_` prefix (`or_`, `kai_`).
- **Only hex allowed:** the `<meta name="theme-color">` value, because a meta tag cannot read a CSS variable. Use the Mocha `mantle` or `base` hex.

## Kit or project

- A widget that appears in more than one app (or would be rebuilt if a second app needed it) belongs in the kit (`kit.css`), added in the skill repo and synced. Do not copy it into a project stylesheet.
- A project stylesheet (`app.src.css`) holds only what is specific to that app's screen: the touchpad, the on-screen keyboard, the media bar, the page shell. It uses kit tokens (`--r-ctl|card|sheet`, `--ease`, `--ctp-*`, `--accent`) and kit utilities, never its own radii, colors or timings.
- Shared shell numbers: 16px page gutters, 12px between cards, 8px between buttons, safe-area insets on top bars and tab bars, 44px minimum targets, page change 260ms, toast drops from the top, sheets rise from the bottom.
- `node <plugin>/scripts/harness.mjs lint` checks all of this in each registered project and runs inside each project's `scripts/check.ps1`.

## Pick the right variant

| Need | Use | Reference |
| --- | --- | --- |
| Primary, secondary, tertiary, destructive action | `btn-filled`, `btn-gray`, `btn-plain`, `btn-danger` | controls.md |
| Text input, search, select, validation | `field` (+ `field-outline`, `field-underline`) | controls.md |
| On/off, choose one, choose many, slider | `switch`, `radio`, `check`, `range` | controls.md |
| Switch view, filter, tab | `seg`, `tabs`, `chip` | controls.md |
| Group content | `card`, `group-list` + `row` | surfaces.md |
| Poster or media tile with title and progress | `card-tap poster` + `from-X to-X` | surfaces.md |
| Navigate | `tabbar`, `tabbar-float`, `side-item`, top bar | surfaces.md |
| Confirm, short form, picker, contextual choice | `alert-ios`, `modal`, `sheet`, action sheet, `menu` | overlays-feedback.md |
| Status, progress, loading, empty | `badge`, `alert`, `bar`, `spin-*`, `skel` | overlays-feedback.md |
| Colors, type, radius, shadows, override variables | tokens | tokens.md |

## Reference files

- `references/tokens.md`: surface and text roles, accent, flavors, radius, shadows, type scale, override variables.
- `references/controls.md`: buttons, fields, toggles, slider, segmented control, tabs, chips, stepper.
- `references/surfaces.md`: cards, lists, avatars, tables, accordion, all navigation patterns.
- `references/overlays-feedback.md`: dialogs, sheets, menus, toasts, tooltips, banners, badges, progress, loaders, skeletons, empty states.
- `references/motion.md`: durations, easing, keyframes, entrance recipes.
- `references/icons.md`: sprite build, usage, sizes, recommended icons.
- `references/setup.md`: init, build, serving (static, Vite, Rust embed), updating the kit, previewing the gallery.
- `references/checklist.md`: review checklist and anti-patterns.

## Sources

Official upstream docs. When the kit and an upstream source disagree, check upstream first, then update the kit.

**Catppuccin** (palette pinned at v1.8.0 in `assets/src/palette.css`)
- Palette and hex values: https://catppuccin.com/palette
- Palette data (source for `palette.css`): https://github.com/catppuccin/palette (release: https://github.com/catppuccin/palette/releases/tag/v1.8.0)
- Style guide (which color goes on which UI role): https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md
- Org and main repo: https://github.com/catppuccin/catppuccin
- Official Tailwind port, for comparison: https://github.com/catppuccin/tailwindcss

**Tailwind CSS** (v4.1.11, pinned in `assets/package.json`)
- Theme variables (`@theme`, `--color-*`): https://tailwindcss.com/docs/theme
- Directives and functions (`@layer`, `@apply`, `@source`): https://tailwindcss.com/docs/functions-and-directives
- How class names are detected (why `bg-${x}` fails): https://tailwindcss.com/docs/detecting-classes-in-source-files
- CLI install and build: https://tailwindcss.com/docs/installation/tailwind-cli
- Release notes for the pinned version: https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.1.11

**Lucide** (`lucide-static` 0.540.0, pinned in `assets/package.json`)
- Icon search: https://lucide.dev/icons
- Source repo: https://github.com/lucide-icons/lucide
- Package: https://www.npmjs.com/package/lucide-static

## When not to use

- A project with an established, different design system the user wants to keep.
- Marketing sites that need custom typography or brand colors: use the kit's tokens as a base, but ask first.
