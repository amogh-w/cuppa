# Overlays, feedback and loaders

## Dialogs (native `<dialog>`)

Open with `data-open="id"` on any button; close with `data-close` on a button inside, or by clicking the backdrop (`ui.js` handles all three). Do not use JS overlay libraries. Gallery: **Modals A-D**, **Menus A**, **Toasts A**, **Tooltips A**.

| Pattern | Class | Use |
| --- | --- | --- |
| Alert | `alert-ios` | short confirmation with 2 buttons |
| Modal | `modal` | short form or detail in a centered card |
| Bottom sheet | `sheet` | mobile pickers, share, secondary flows |
| Action sheet | `sheet` + `!bg-transparent !shadow-none` | pick one of a few actions |

Alert (centered, hairline-divided buttons, destructive on the right):

```html
<button class="btn btn-gray" data-open="d-alert">Open alert</button>
<dialog id="d-alert" class="alert-ios">
  <div class="p-5 text-center"><div class="t-headline">Delete this item?</div><div class="t-foot mt-1 text-subtext1">This action can't be undone.</div></div>
  <div class="grid grid-cols-2 border-t border-surface1/60">
    <button class="h-11 border-r border-surface1/60 text-[17px] text-accent" data-close>Cancel</button>
    <button class="h-11 text-[17px] font-semibold text-red" data-close>Delete</button>
  </div>
</dialog>
```

Modal:

```html
<dialog id="d-modal" class="modal"><div class="p-5">
  <div class="flex items-center justify-between"><div class="t-title3">New collection</div>
    <button class="btn btn-icon btn-gray btn-sm" data-close aria-label="Close"><svg class="size-4"><use href="/icons.svg#x"/></svg></button></div>
  <div class="mt-4 space-y-3"><input class="field" placeholder="Name"></div>
  <div class="mt-5 flex gap-3"><button class="btn btn-gray flex-1" data-close>Cancel</button><button class="btn btn-filled flex-1" data-close>Create</button></div>
</div></dialog>
```

Bottom sheet (grabber on top, rises with the spring curve, drag down to dismiss):

```html
<dialog id="d-sheet" class="sheet"><div class="p-5 pb-8">
  <div class="sheet-grip -mx-5 -mt-5 px-5 pt-5 pb-3">
    <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-surface2"></div>
    <div class="t-title3">Share</div>
  </div>
  <button class="btn btn-gray btn-block mt-5" data-close>Done</button>
</div></dialog>
```

`ui.js` makes `.sheet-grip` draggable: pull the grabber or title row down (mouse, touch or pen) and the sheet follows the finger; past 30% of its height, or a quick flick, it closes, otherwise it springs back. When the sheet's content is scrolled to the top, pulling down on the content dismisses it too. Put the grabber and the title row inside the grip so the whole header is the handle. For sheets added to the page later, call `UI.sheetDrag(dialog)`. Tall sheets should also get `max-h-[90dvh] overflow-y-auto`.

Action sheet: same `sheet` class, but with `!bg-transparent !shadow-none` and two stacked groups inside: a `rounded-card bg-base` group of full-width 48px buttons separated by `border-t border-surface0` (destructive in `text-red`), and a separate Cancel button (`rounded-card bg-base`, semibold, accent).

Rules: Escape closes (native). Keep modals short; anything long becomes a page or a sheet. Always give a visible way to dismiss. Do not stack dialogs.

## Confirming an action: `UI.confirm`

```js
if (await UI.confirm({ icon: "power", danger: true, title: "Quit the player?", text: "This closes Stremio on the PC.", ok: "Quit" })) doIt();
```

One centered modal for every confirmation, so they all look and behave alike: icon in a tinted circle, title, one sentence, **Cancel** (`btn-gray`) and the primary button (`btn-filled`, or `btn-danger` when `danger: true`). It returns a `Promise<boolean>`; Escape and a click on the backdrop count as Cancel. Do not build one-off "tap again" confirmations.

Confirm when an action is **disruptive** (ends or interrupts what the user is doing, launches another program, starts something heavy) or **hard to undo** (quit, delete, reset). Name the thing that will be affected in the title or text ("S2 E1 will stop"). Do not confirm instant, reversible actions (seek, volume, toggles, presets); a confirmation on those trains people to tap through.

## Popover menu

```html
<button class="btn btn-gray" data-menu="m1">More<svg class="size-5"><use href="/icons.svg#ellipsis"/></svg></button>
<div id="m1" popover class="menu">
  <button class="menu-item" data-menu-close><svg class="size-5 text-subtext0"><use href="/icons.svg#pencil"/></svg>Edit</button>
  <div class="menu-sep"></div>
  <button class="menu-item text-red" data-menu-close><svg class="size-5"><use href="/icons.svg#trash-2"/></svg>Delete</button>
</div>
```

`ui.js` positions the menu under the trigger and keeps it on screen. Use it on desktop or for "more actions"; on phones prefer an action sheet.

## Toasts and tooltips

`UI.toast("Saved to library", "success")` (kinds: `info`, `success`, `error`). A pill drops in from the top, stays 2.6s, fades out. Use for confirmations that need no action. Errors that block work belong in an inline banner, not a toast.

Tooltip (hover and keyboard focus, desktop only): `<button class="btn btn-icon btn-gray tip" data-tip="Share this" aria-label="Share">...</button>`.

## Badges, chips, counts

Gallery: **Badges A**.

```html
<span class="badge badge-solid">New</span>
<span class="badge badge-tint">4K HDR</span>
<span class="badge badge-outline">PG-13</span>
<span class="count">12</span>
<span class="badge badge-tint" style="--accent:var(--ctp-green)"><i class="size-1.5 rounded-full bg-green"></i>Online</span>
```

`badge-sq` gives a rounded-square badge. To color a tinted badge by meaning, set `--accent` on it to a semantic color as shown.

## Banners

Gallery: tinted banners and left-bar callouts. Pick a tone class: `tone-info`, `tone-success`, `tone-warn`, `tone-danger`.

```html
<div class="alert tone-success"><svg class="size-5 shrink-0"><use href="/icons.svg#circle-check"/></svg><div>Saved successfully.</div></div>
<div class="alert alert-bar tone-warn"><svg class="size-5 shrink-0"><use href="/icons.svg#triangle-alert"/></svg><div><b>Heads up</b><div class="t-sub text-subtext1">Needs attention.</div></div></div>
```

Icons by tone: info `info`, success `circle-check`, warn `triangle-alert`, danger `circle-x`.

## Progress

Gallery: **Progress A**.

```html
<div class="bar"><i style="--v:.45"></i></div>
<div class="bar bar-thick"><i style="--v:.72"></i></div>
<div class="bar bar-indet"><i></i></div>
```

The fill is scaled, not resized: set `--v` to a value from 0 to 1 (`el.style.setProperty("--v", done / total)`). Never set `width` on `.bar > i`.

Ring: an SVG `viewBox="0 0 36 36"`, rotated -90deg, two circles `r="15.5"` with `stroke-width="3.5"`; the track is `stroke-surface1`, the value circle is `stroke-accent stroke-linecap="round"` with `stroke-dasharray="97.4"` and `stroke-dashoffset` = `97.4 * (1 - progress)`. Steps: a row of `h-1.5 flex-1 rounded-full` segments, `bg-accent` when done, `bg-surface1` otherwise. Use determinate progress when you know the percent, `bar-indet` when you do not.

## Loaders

Gallery: spinners and skeletons.

- `spin-ring`: default spinner for buttons and inline waits.
- `spin-ios`: the 12-spoke Apple spinner. Markup: `<div class="spin-ios text-subtext0"><i style="--n:1"></i> ... <i style="--n:12"></i></div>`.
- `spin-dots`: three bouncing dots: `<div class="spin-dots"><i></i><i></i><i></i></div>`.
- Skeleton: `skel` blocks shaped like the content (`skel size-12 !rounded-full`, `skel h-3.5 w-2/3`). Prefer skeletons for page and list loading, spinners for actions.

## Empty and error states

Gallery: **Empty states A**. Center an icon in a tinted circle, a headline, one line of help, and one action.

```html
<div class="rounded-card bg-base p-5 text-center">
  <div class="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-accent/15 text-accent"><svg class="size-7"><use href="/icons.svg#library"/></svg></div>
  <div class="t-headline">Nothing here yet</div><div class="t-sub mt-1 text-subtext0">Add something to get started.</div>
  <button class="btn btn-sm btn-filled mt-3">Add</button>
</div>
```

Error state: same layout with `bg-red/15 text-red`, a retry button (`btn-tinted` with `rotate-ccw`). Every list or data view needs loading, empty and error states.
