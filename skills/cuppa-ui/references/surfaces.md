# Surfaces and navigation

## Cards

Cards sit on the page color (`mantle`) and use `base`. Gallery: flat, raised and tappable, media and stat cards.

```html
<div class="card"><div class="t-headline">Flat card</div><p class="t-sub mt-1 text-subtext0">Supporting text.</p></div>
<div class="card card-raised card-tap">Raised, presses on tap</div>
```

- Flat (default): quietest, relies on the layer difference only.
- `card-raised`: hairline border plus shadow, for cards that float or sit on a same-tone background.
- `card-tap`: add to any card that is clickable (press scale). Make it a `<button>` or `<a>`.

Media card (`poster` paints the colour gradient and the bottom scrim on one element so the rounded corners stay clean; the gradient is a placeholder for an image; put a progress bar inside the text block, never absolutely positioned):

```html
<div class="card-tap poster h-52 w-36 from-mauve to-blue">
  <div class="absolute inset-x-0 bottom-0 p-4">
    <div class="t-sub font-semibold text-text">Movie title</div><div class="t-cap text-subtext1">2026 · Sci-Fi</div>
  </div>
</div>
```

Poster rows: a full-bleed strip (`-mx-4` on the wrapper, `px-4` on the scroller) with `snap-x snap-proximity` also needs **`scroll-px-4`**. Without it, snapping aligns the first poster to the very edge of the screen and the gutter disappears.

Stat card: label (`t-foot text-subtext0`), value (`t-title1`), a `badge badge-tint`, and an inline SVG sparkline (`stroke-current text-accent`, `stroke-width 2.5`, round caps and joins).

## Grouped lists

Gallery: inset grouped (Settings) and plain divided (media rows).

```html
<div class="group-list">
  <div class="row"><div class="row-tile bg-blue"><svg class="size-4"><use href="/icons.svg#wifi"/></svg></div>
    <span class="flex-1">Wi-Fi</span><span class="text-subtext0">Home</span>
    <svg class="size-4 text-overlay1"><use href="/icons.svg#chevron-right"/></svg></div>
  <div class="row"><div class="row-tile bg-peach"><svg class="size-4"><use href="/icons.svg#plane"/></svg></div>
    <span class="flex-1">Airplane Mode</span><span class="switch"><input type="checkbox"></span></div>
  <div class="row text-red"><div class="row-tile bg-red"><svg class="size-4"><use href="/icons.svg#trash-2"/></svg></div><span class="flex-1">Reset</span></div>
</div>
```

- Rows are 48px minimum. The divider is inset under the text (60px). Rows without an icon tile: add `row-plain` to every row so the divider starts at 16px.
- Trailing content: value text (`text-subtext0`), chevron (navigation), switch, or `count` bubble.
- Destructive row: `text-red` on the row.
- Use inset grouped lists for settings and menus; use plain divided rows (avatar plus two lines plus time) for people, messages and media.

## Avatars

```html
<div class="avatar from-mauve to-blue">AW</div>
<div class="flex -space-x-3"><div class="avatar from-teal to-green ring-2 ring-base">A</div><div class="avatar from-pink to-mauve ring-2 ring-base">B</div></div>
<div class="relative"><div class="avatar from-peach to-red">KA</div><i class="absolute right-0 bottom-0 size-3 rounded-full bg-green ring-2 ring-base"></i></div>
```

Initials on a token gradient. Online dot: small `bg-green` circle ringed in `ring-base`.

## Tables, accordion, keys

```html
<div class="overflow-hidden rounded-card bg-base"><table class="tbl"><thead><tr><th>Title</th><th class="text-right">Size</th></tr></thead>
  <tbody><tr><td>Movie One</td><td class="text-right tabular-nums">12.4 GB</td></tr></tbody></table></div>

<details class="acc"><summary>What is this?<svg class="size-5 text-overlay1"><use href="/icons.svg#chevron-down"/></svg></summary>
  <div class="t-sub px-4 pb-4 text-subtext1">Answer text.</div></details>

<span class="kbd">Ctrl</span> + <span class="kbd">K</span>
```

Use hairline tables (no zebra). Keep to 3-4 columns on phones, or let the table scroll inside `overflow-x-auto`.

## Navigation

Gallery: tab bar and large title, floating pill bar, top bar with back plus sidebar, breadcrumbs, pagination, page dots.

Tab bar (bottom, 3-5 items, icon 24px plus label). Selected item uses `aria-selected="true"`:

```html
<div class="tabbar" data-tabs-group>
  <button class="tab" aria-selected="true"><svg class="size-6"><use href="/icons.svg#house"/></svg>Home</button>
  <button class="tab" aria-selected="false"><svg class="size-6"><use href="/icons.svg#library"/></svg>Library</button>
</div>
```

In an app, pin it with `fixed inset-x-0 bottom-0` and add bottom padding to the page (`pb-24` plus `env(safe-area-inset-bottom)`).

Floating pill bar (media-style apps; the active item shows its label):

```html
<div class="tabbar-float" data-tabs-group>
  <button class="tabf" aria-selected="true"><svg class="size-5"><use href="/icons.svg#house"/></svg><span>Home</span></button>
  <button class="tabf" aria-selected="false"><svg class="size-5"><use href="/icons.svg#search"/></svg><span>Search</span></button>
</div>
```

Sidebar (desktop, md and up): a column of `side-item` buttons with `aria-selected`.

Top bar with back button and large title:

```html
<div class="flex items-center border-b border-surface0 px-2 py-2">
  <button class="btn btn-plain btn-sm gap-0.5 px-2"><svg class="size-5"><use href="/icons.svg#chevron-left"/></svg>Back</button>
  <div class="t-headline flex-1 pr-14 text-center">Title</div>
</div>
<div class="t-large">Library</div>
```

Breadcrumbs: `t-sub flex items-center gap-1.5 text-subtext0` with accent links and chevron-right separators. Pagination: `btn btn-icon btn-gray btn-sm` arrows with small page buttons (`btn btn-sm btn-filled size-8 px-0` for current, `btn-plain` for others). Page dots: a row of `size-1.5 rounded-full bg-surface2` with the active one `h-1.5 w-5 bg-accent`.

Choosing: 3-5 top-level destinations on mobile use the tab bar (or the floating bar for content apps); two-level hierarchies get a top bar with Back; desktop widths get the sidebar.
