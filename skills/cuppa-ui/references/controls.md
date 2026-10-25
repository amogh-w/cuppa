# Controls

Icon markup used below: `<svg class="size-5"><use href="/icons.svg#NAME"/></svg>`. With `ui.js` loaded, `<i data-i="NAME" class="size-5"></i>` is a shorter equivalent that is replaced at load.

## Buttons

Build a button from: `btn` + one style + optional shape + optional size.

| Style | Class | Use |
| --- | --- | --- |
| Filled | `btn-filled` | the one primary action per view |
| Tinted | `btn-tinted` | secondary action that should still read as accent |
| Gray | `btn-gray` | neutral secondary action (Cancel, Done) |
| Plain | `btn-plain` | tertiary, inline, toolbar text actions |
| Outline | `btn-outline` | quiet bordered action |
| Danger | `btn-danger` | destructive, confirmed |
| Danger tinted | `btn-danger-tinted` | destructive, not yet confirmed |

Shape: every button uses one radius, `--r-ctl` (follows the Corner radius control). There is no pill variant. Gallery cards: styles, sizes and full width, icon buttons and loading.

Sizes: `btn-sm` (32px), default (44px), `btn-lg` (56px). Full width: `btn-block`. Icon only: `btn-icon` (40px square, needs `aria-label`).

```html
<button class="btn btn-filled">Continue</button>
<button class="btn btn-tinted"><svg class="size-4"><use href="/icons.svg#download"/></svg>Download</button>
<button class="btn btn-icon btn-gray" aria-label="Share"><svg class="size-5"><use href="/icons.svg#share"/></svg></button>
<button class="btn btn-lg btn-block btn-filled">Full-width primary</button>
```

Loading: disable the button and prepend a spinner.

```html
<button class="btn btn-filled" disabled aria-busy="true"><span class="spin-ring !size-4 !border-2 !border-crust/30 !border-t-crust"></span>Saving</button>
```

Rules: one `btn-filled` per view; destructive actions are never the only filled button; disabled is `disabled` (opacity 40%, no pointer events). Press feedback (scale .97) is built in.

## Text fields

Gallery cards: filled (default), outlined, underline and inline-label rows, validation states.

```html
<input class="field" placeholder="Email">
<input class="field field-outline" type="password" placeholder="Password">
<input class="field field-underline" placeholder="Name">
<textarea class="field" placeholder="Message"></textarea>
```

Select (chevron is a separate icon):

```html
<div class="relative">
  <select class="field field-outline"><option>Choose a size</option></select>
  <svg class="pointer-events-none absolute top-3 right-3 size-5 text-overlay1"><use href="/icons.svg#chevron-down"/></svg>
</div>
```

Search (pill with leading icon):

```html
<div class="relative">
  <svg class="pointer-events-none absolute top-3 left-3 size-5 text-overlay1"><use href="/icons.svg#search"/></svg>
  <input class="field rounded-full pl-10" placeholder="Search">
</div>
```

Inline label rows inside a grouped list:

```html
<div class="group-list border border-surface0">
  <label class="row row-plain"><span class="w-24 text-subtext1">Name</span><input class="w-full bg-transparent outline-none placeholder:text-overlay1" placeholder="Required"></label>
</div>
```

Validation: add `ring-2 ring-red/70` (error) or `ring-green/70` (valid) to the field and a message below it.

```html
<input class="field ring-2 ring-red/70" value="not-an-email">
<div class="t-foot mt-1.5 flex items-center gap-1.5 text-red"><svg class="size-4"><use href="/icons.svg#circle-x"/></svg>Enter a valid email</div>
```

Always pair a field with a visible label or a placeholder plus `aria-label`. Focus shows an accent ring (already styled).

## Switch, checkbox, radio

Gallery: green and accent switches, checkbox, radio.

```html
<label class="flex items-center justify-between">Wi-Fi<span class="switch"><input type="checkbox" checked></span></label>
<label class="flex items-center justify-between">Dark mode<span class="switch switch-accent"><input type="checkbox"></span></label>
<label class="flex items-center gap-3"><input class="check" type="checkbox">Remember me</label>
<label class="flex items-center gap-2"><input class="radio" type="radio" name="g" checked>Option 1</label>
```

Use the green switch for system-like on/off settings (the iOS convention) and `switch-accent` for app-feature toggles that should carry the brand color. The knob is white in every flavor.

## Slider and stepper

```html
<div class="flex items-center gap-3">
  <svg class="size-5 text-subtext0"><use href="/icons.svg#sun"/></svg>
  <input class="range" type="range" min="0" max="100" value="60">
  <svg class="size-5 text-subtext0"><use href="/icons.svg#sparkles"/></svg>
</div>
```

`ui.js` paints the filled part of the track. Stepper = a two-button segmented control plus a count; the increment logic is app-specific (the gallery's `data-stepper` handler is demo-only):

```html
<div class="seg"><button aria-label="Less"><svg class="size-4"><use href="/icons.svg#minus"/></svg></button><button aria-label="More"><svg class="size-4"><use href="/icons.svg#plus"/></svg></button></div>
```

## Segmented control, tabs, chips

Gallery: **Selection A** (segmented with sliding thumb, underline tabs, chips).

```html
<div class="seg" data-group><span class="thumb"></span>
  <button aria-pressed="true">Day</button><button aria-pressed="false">Week</button><button aria-pressed="false">Month</button>
</div>
<div class="tabs" data-tabs><button aria-selected="true">Overview</button><button aria-selected="false">Activity</button></div>
<div class="flex flex-wrap gap-2" data-chips><button class="chip" aria-pressed="true">Action</button><button class="chip" aria-pressed="false">Drama</button></div>
```

- Segmented: switch between 2-4 views of the same content. Add `seg-accent` for an accent-filled thumb.
- Underline tabs: 3+ sections within a page.
- Chips: multi-select filters. `aria-pressed="true"` fills the chip with the accent.
- Rows of chips, tabs or posters scroll sideways with hidden scrollbars. `ui.js` makes them work with a mouse too, with no markup: a vertical wheel scrolls short rows (up to 72px tall) sideways, and click-and-drag scrolls any row. Tall strips keep the wheel for page scrolling. Touch is untouched.
- `ui.js` wires `data-group`, `data-tabs` and `data-chips` automatically. React to changes by reading `aria-pressed` / `aria-selected`, or add your own click handlers.
