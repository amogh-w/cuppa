# Motion

Motion in this kit is quick, soft and spring-like. It confirms an action or shows where something came from; it never decorates.

## Rules

This page is the only authority for motion. Project docs link here and never restate the numbers. `harness.mjs lint` enforces them in every project.

- Animate only `transform` and `opacity`. Never animate width, height, top, left, blur, filter or box-shadow. For a bar that grows, scale a full-width element (`transform: scaleX()` with `transform-origin: left`); for a ring that appears, fade an outline or a pseudo-element.
- One easing curve for movement: `cubic-bezier(.32,.72,0,1)` (iOS spring-out). Utility: `ease-ios`. Token: `var(--ease)`. Do not write another `cubic-bezier(...)`, `ease-in` or `ease-out`. Progress that follows real time may use `linear`.
- Three durations, nothing else: 150ms for taps and color changes; 200ms for the opacity half of a combined fade; 260-500ms for movement (sheets, modals, lists, toasts, page changes). A looping animation (`infinite`) sets its own period.
- Press feedback: scale to .97 on `:active` (built into `btn`, `chip`, `card-tap`).
- These rules bind project code. A few kit internals measure a position at runtime and move it with `left`/`width` (`.seg .thumb`); do not copy that pattern.
- Looping animation is allowed only for loaders and connection status (`spin-*`, `skel`, `bar-indet`, a status dot).
- Reduced motion is handled globally in `kit.css`: animations and transitions collapse to near-zero when the OS asks for it. Do not add per-component opt-outs, and do not depend on an animation finishing to make state correct.
- Do not stagger more than 6 items, and never delay input.

## What is built in

| Behavior | Where |
| --- | --- |
| press scale | `btn`, `card-tap` |
| switch knob slide and stretch | `switch` |
| segmented thumb slide | `seg` (`ui.js` positions it) |
| modal scale-in, alert pop, sheet slide-up, backdrop fade | `modal`, `alert-ios`, `sheet` (use `@starting-style`, no JS) |
| menu pop | `menu` |
| toast drop-in | `UI.toast()` |
| accordion chevron rotate | `details.acc` |

## Keyframes available

`pop` (scale .6 to 1 with overshoot), `rise` (translate 14px plus fade), `slideup`, `drop` (from above), `shake` (error), `fade`, plus loader keyframes `spin`, `shimmer`, `indet`.

Entrance helpers: add `anim` plus one of `m-pop`, `m-slide`, `m-fade`, `m-shake` to an element to play it; add `m-stagger` to a container and give each child `style="--i:N"` for a staggered `rise`. Remove and re-add `anim` (force a reflow between) to replay. Duration and easing can be overridden per element with `--m-dur` and `--m-ease`.

```html
<div class="m-stagger anim group-list">
  <div class="row row-plain" style="--i:0">One</div>
  <div class="row row-plain" style="--i:1">Two</div>
</div>
```

## Recipes

- Error in a field: add `m-shake anim` to the field once, together with the red ring.
- New item in a list: `anim m-pop` on the new row for the first render only.
- Page change: no animation, or a 260ms fade with a small `translateX`. Never slide full pages on desktop.
- Optimistic updates: change the UI immediately, then animate the correction if the server disagrees.

## Loading and entrance helpers (`ui.js`)

- `UI.play(el, "fade" | "pop" | "slide" | "shake" | "stagger", duration)` replays an entrance animation on any element. `"stagger"` rises the first 6 children one after another (`--i` is set for you). Use it for list and section entrances, tab changes (`"fade"`, `".25s"`) and icon swaps (`"pop"`, `".3s"`). Play an entrance once per change, not on every re-render: keep a key (for example id plus season) and replay only when it differs.
- `UI.reveal(img)`: put the `<img>` inside a `.skel` wrapper. The wrapper shimmers until the picture has loaded, then the picture fades in and the shimmer is removed. In long rows, put `.skel` on the first few wrappers only (about 6), because every shimmer is a running animation.
- `UI.loadBg(el, url, callback)`: a background image that fades in once loaded. Put a `.skel` layer behind it and remove it in the callback.
- Status that is waiting on a connection: `animate-pulse` (opacity only) on the status dot.

Which loader where: skeletons for a page, list or image that is loading; `spin-ring` on a button or row while its action runs (hide it when the result arrives, and give it a timeout so it can never spin forever); `spin-dots` for "more is still arriving" at the end of a list.

