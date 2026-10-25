# Icons

One icon set: [Lucide](https://lucide.dev) (ISC license), delivered as a local SVG sprite. Line icons, rounded caps, 24px grid. No icon fonts, no emoji as icons, no other sets.

## Build the sprite

1. List the icon names the app uses in `ui/icons.txt`, one per line (`#` for comments). `init.mjs` creates a starter list of about 45 common icons.
2. Run `node ui/icons.mjs --list ui/icons.txt --out public/icons.svg` (the `npm run icons` script from `setup.md`). Requires the dev dependency `lucide-static`.
3. An unknown name fails the build with a clear error, so typos cannot ship.

Find names at lucide.dev or in `node_modules/lucide-static/icons/`. Add a name to the list, rebuild, use it.

## Use

```html
<svg class="size-5"><use href="/icons.svg#house"/></svg>
```

- The icon inherits `currentColor`: color it with `text-*` utilities on the svg or its parent.
- Sizes: `size-4` (16px, inside small buttons and badges), `size-5` (20px, default), `size-6` (24px, tab bars and large buttons), `size-7` to `size-8` (hero and empty states).
- Solid icons: add `fill-current` to the svg (for example `size-9 fill-current` on the main play button) and `play` or `pause` become filled shapes.
- Stroke width follows `--icon-sw` (default 2). Do not change it per icon; change it globally only if the user asks.
- The path in `href` must match where the app serves the sprite. With `ui.js`, set `window.UI_SPRITE = "/path/icons.svg"` before loading it and use the shorthand `<i data-i="house" class="size-5"></i>`.
- Decorative icons get `aria-hidden="true"` (the shorthand does this). Icon-only buttons need `aria-label` on the button.

## Recommended icons by purpose

| Purpose | Icons |
| --- | --- |
| Navigation | `house`, `compass`, `library`, `search`, `settings`, `user`, `chevron-left/right/up/down` |
| Actions | `plus`, `minus`, `x`, `check`, `pencil`, `trash-2`, `copy`, `share`, `download`, `rotate-ccw`, `ellipsis` |
| Status | `circle-check`, `circle-x`, `info`, `triangle-alert`, `bell`, `lock` |
| Media | `play`, `pause`, `skip-forward`, `fast-forward`, `volume-2`, `volume-x`, `circle-play` |
| Content | `heart`, `star`, `bookmark`, `folder`, `calendar`, `mail`, `message-circle`, `camera` |
| Settings tiles | `wifi`, `bluetooth`, `plane`, `moon`, `sun`, `sliders-horizontal`, `sparkles` |

Pair every icon with consistent meaning across apps (for example `trash-2` always means delete, `ellipsis` always means more).
