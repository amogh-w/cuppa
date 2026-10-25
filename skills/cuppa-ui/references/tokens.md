# Tokens

All colors are Catppuccin v1.8.0 variables (`--ctp-*`). A flavor class on `<html>` (`latte`, `frappe`, `macchiato`, `mocha`) swaps every value, so nothing is rebuilt when the theme changes. Tailwind utilities point at the live variables.

## Surface layers (deepest to most raised)

| Role | Utility | Use |
| --- | --- | --- |
| page | `bg-mantle` | app background (set on `body` by the kit) |
| card | `bg-base` | cards, grouped lists, modals, sheets, menus |
| control | `bg-surface0` | inputs, gray buttons, segmented track, chips |
| pressed / raised | `bg-surface1` | pressed state, progress track, hairline fills |
| strong border | `border-surface2` | outlined fields, unchecked checkbox |
| deepest | `bg-crust` | text on solid accent, scrims, inner shadows |

Hairlines and dividers: `border-surface0` (subtle) or `border-surface1`.

## Text

| Utility | Use |
| --- | --- |
| `text-text` | body and headings |
| `text-subtext1` | secondary body (descriptions) |
| `text-subtext0` | captions, helper text, meta lines |
| `text-overlay1` | placeholders, chevrons, decorative icons |

On a solid accent or semantic fill use `text-crust`, never `text-text`. Do not use `overlay*` for anything a user must read.

## Accent and semantic colors

- Layers: page `mantle`, card and group-list `base`, control `surface0`, pressed or raised `surface1`. A sheet that holds grouped lists is `sheet sheet-grouped` (mantle ground, base cards on top); never put a darker card on a lighter sheet.
- `accent` is the user's chosen accent (`bg-accent`, `text-accent`, `bg-accent/15`, `ring-accent`). Default `lavender`. Available: rosewater, flamingo, pink, mauve, red, peach, yellow, green, teal, sky, blue, lavender.
- Meaning: `green` success, `yellow` warning, `red` danger, `blue` info. Also available as utilities: `peach`, `teal`, `sky`, `sapphire`, `maroon`, `lavender`, `pink`, `flamingo`, `rosewater` (use for icon tiles and avatars, not meaning).
- Opacity modifiers work on every color: `bg-accent/15`, `border-surface0/60`.
- Icon tiles in lists: `row-tile bg-blue`, `bg-peach`, `bg-red`, `bg-mauve`, `bg-green`, `bg-sky` with `text-crust` (the class sets it).

## Flavors, accent, radius (runtime)

`theme.js` keeps three values in `localStorage`: `ui-flavor` (auto, latte, frappe, macchiato, mocha), `ui-accent`, `ui-radius` (tight 0.55, apple 1, soft 1.5). Auto follows the OS (Latte in light, Mocha in dark). The switcher UI is the `#themePanel` block in `assets/gallery/index.html`; copy it into any app that needs a theme picker. Apps that do not need a picker still load `theme.js` so Auto works.

## Radius

`rounded-ctl` (controls, 12px), `rounded-card` (cards, 20px), `rounded-sheet` (modals and sheets, 28px), `rounded-full` (avatars, chips, switches; never buttons). All three scale with `--r-scale`.

## Shadows

`--shadow-1` hairline lift, `--shadow-2` raised cards and floating bars, `--shadow-3` modals and menus. Use as `shadow-[var(--shadow-2)]`. Prefer flat cards; use shadows only for things that float.

## Type scale

| Class | Size / weight | Use |
| --- | --- | --- |
| `t-large` | 34 / 700 | screen titles |
| `t-title1` | 28 / 700 | section headings |
| `t-title2` | 22 / 600 | card and dialog headings |
| `t-title3` | 20 / 600 | sub-headings |
| `t-headline` | 17 / 600 | row titles, button-like labels |
| `t-body` | 17 / 400 | body |
| `t-callout` | 16 | emphasized secondary |
| `t-sub` | 15 | descriptions |
| `t-foot` | 13 | meta, helper text |
| `t-cap` | 12 | captions |

Font: `font-sans` (system stack). Numbers that change: add `tabular-nums`.

## Spacing and layout

Use Tailwind spacing. Typical rhythm: 16px page gutter, 12px between cards (`.card` has `my-3`), 8px between buttons in a row, 14px section gaps inside cards. Phone-first apps cap content at `max-w-[480px] mx-auto`.

## Optional override variables

Components read these with sane defaults. Set them on `:root` for an app-wide tweak or on one element for a local one. Keep the defaults unless the user asks.

| Area | Variables |
| --- | --- |
| Buttons | `--btn-r --btn-h --btn-px --btn-fs --btn-w --btn-ls --press --tint` |
| Fields | `--field-h --field-r --field-fill --focus-ring` |
| Cards | `--card-r --card-p --card-bg --card-shadow --card-bc` |
| Lists | `--row-h --sep-left --sep-c` |
| Segmented | `--thumb-shadow` |
| Overlays | `--scrim --scrim-blur --modal-r --modal-from --modal-dur --modal-ease` |
| Motion | `--m-dur --m-ease` |
| Icons | `--icon-sw` (stroke width, default 2) |
| Global | `--accent --r-scale` |
