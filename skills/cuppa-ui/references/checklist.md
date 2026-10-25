# Review checklist

Run through this before calling a screen done. Open it in Latte and Mocha at phone width and at a desktop width.

## Look

- [ ] Layers are right: page `mantle`, cards `base`, controls `surface0`. No card the same color as its page without a border or shadow.
- [ ] Exactly one `btn-filled` per view; secondary actions are `btn-gray`, `btn-tinted` or `btn-plain`.
- [ ] One accent. Green, red, yellow, blue appear only for meaning.
- [ ] Text on solid accent or semantic fills is `text-crust`.
- [ ] No hex colors, no inline colors, no `bg-white`/`bg-black` (switch knob and slider thumb are the only white).
- [ ] Type uses the scale (`t-*`), body is 17px, headings are not bolder than the scale.
- [ ] Corners come from `rounded-ctl|card|sheet|full`, not arbitrary `rounded-[..px]` (exceptions: values derived from a token).
- [ ] Spacing follows the rhythm: 16px gutters, 12px between cards, 8px between buttons.

## Behavior

- [ ] Every interactive element is at least 44px tall or wide (icon buttons are 40px circles inside padded rows; give them 4px more hit area where cramped).
- [ ] Focus is visible on every control; Tab order follows reading order.
- [ ] Icon-only buttons have `aria-label`; decorative icons have `aria-hidden`.
- [ ] Dialogs use `<dialog>`, close with Escape and the backdrop, and have a visible dismiss button.
- [ ] Disruptive or hard-to-undo actions (quit, delete, reset, anything that ends playback or starts a big job) go through `UI.confirm`; instant reversible ones do not.
- [ ] Loading, empty and error states exist for every data view (skeleton or spinner, empty state, retry).
- [ ] Press feedback works on touch (buttons scale, rows highlight).
- [ ] Animations follow `motion.md`: transform and opacity only, 150ms / 200ms / 260-500ms, `var(--ease)`. Nothing breaks when animations are disabled.
- [ ] `node <plugin>/scripts/harness.mjs lint` reports no findings.

## Contrast and theming

- [ ] Secondary text is `subtext1` or `subtext0`; `overlay*` is used only for placeholders and decoration.
- [ ] The screen reads well in Latte, Frappe, Macchiato and Mocha, and with at least two different accents (try `yellow`, which is light, and `blue`).
- [ ] Switching flavor or accent at runtime needs no reload.

## Portability

- [ ] No external requests: no CDN scripts, fonts, images or analytics.
- [ ] Icons come from the sprite and every name exists in `icons.txt`.
- [ ] `app.css` was rebuilt after the last markup change (new classes show up).

## Anti-patterns

| Do not | Do instead |
| --- | --- |
| Invent a new button style for one screen | pick a kit variant; if none fits, ask the user before adding one |
| Long utility strings for a component that exists in the kit | use the kit class, utilities only for layout |
| Emoji or text glyphs (`+`, `x`, arrows) as icons | Lucide sprite icons |
| Two filled primary buttons side by side | one filled, one gray |
| A modal on top of a modal | sheet with steps, or a new page |
| A toast for an error that blocks work | inline `alert tone-danger` banner |
| Animating width, height or blur | transform and opacity only |
| Hard-coded dark or light colors | tokens, so all four flavors work |
| Loading a webfont or icon font | system stack and the sprite |
| Spinners for whole-page loading | skeleton blocks shaped like the content |
