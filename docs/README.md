# Motion kit docs

## Install (Webflow)
**Site settings → Custom code → Head**
```html
<script>(function(d){var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.documentElement.classList.add('gt-js');try{var v=sessionStorage.getItem('gt-tv');if(v)d.documentElement.dataset.gtTransition=v}catch(e){}setTimeout(function(){if(!window.MotionKit)d.documentElement.classList.remove('gt-js')},4000)})(document)</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mattstobo/motion-kit@1.0.0/dist/motion-kit.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mattstobo/motion-kit@1.0.0/dist/gt-transitions.min.css">
```
**Footer**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/mattstobo/motion-kit@1.0.0/dist/motion-kit.min.js"></script>
```
Always pin a release tag. Never `@main`. The repo must be public for jsDelivr.
If the kit fails to load, the head snippet removes `gt-js` after 4s so nothing stays hidden.

## Modules (add as custom attributes in Webflow)
| `data-gt` | Options (`data-gt-…`) |
|---|---|
| `reveal` | `from` up/down/left/right/fade, `distance` (2rem), `duration`, `delay`, `ease`, `start`, `once` |
| `reveal-group` | same + `stagger` (0.1), `children` (selector) |
| `parallax` | `speed` (0.2), `scale`, `axis` x/y. Put on the `<img>`; parent needs `overflow:hidden` |
| `split-text` | `split` lines/words/chars, `mask` (true), `stagger`, `duration`, `distance` (110%) |
| `text-scrub` | `from-opacity` (0.15), `start`, `end` |
| `image-mask` | `from` bottom/top/left/right/center, `zoom` (1.15), `duration` |
| `link` | `style` underline / underline-static / roll, `hover-text` (roll) |
| `button` | `style` fill / outline / arrow, `hover-text`, `arrow-distance`. Optional `[data-gt-button-arrow]` child |
| `marquee` | `speed` (5 rem/s), `boost` (4), `smoothing` (0.2s), `direction` left/right |

Combine modules with spaces: `data-gt="reveal link"`. Disable on phones (≤767px): `data-gt-mobile="off"`.
Colours: `--gt-link-color`, `--gt-link-thickness`, `--gt-button-fill`, `--gt-button-text-hover`, `--gt-button-border`, `--gt-marquee-gap`.

## Mobile nav
Roles: `data-gt-nav="root | toggle | panel | item | icon | backdrop"`. Params on the root:
`data-gt-nav-style` slide/fade/clip, `-from` right/left/top/bottom, `-duration` (0.7), `-ease`, `-stagger` (0.06), `-item-distance` (2rem), `-breakpoint` (991), `-close-on-link` (true), `-scroll-lock` (true).
Root gets `data-gt-nav-state="open|closed"` for styling hooks. Esc closes, focus is trapped, background is inert while open.

## Page transitions
Chrome/Edge and Safari 18.2+ only; elsewhere pages just load normally. Set the site default in head: `<script>window.MotionKitConfig={transition:'wipe-up'}</script>` (before the kit).
Override per link with `data-gt-transition="mask-circle"`. Variants: `fade`, `fade-up`, `wipe-up`, `wipe-left`, `mask-circle`, `mask-diamond`, `slide`, `curtain`.
Keep nav/footer still: `data-gt-persist="nav"` / `"footer"` (the same on every page). Tune with `--gt-tv-duration`, `--gt-tv-ease`, `--gt-tv-x/y`.
Webflow caveat: animations in the new page start after the transition finishes; Webflow-native interactions and per-page head code still work because every navigation is a real page load.

## Fluid type
`npm run type-scale` prints CSS variables; `node tools/type-scale.mjs --json` prints values for Webflow size variables. Edit the config at the top of the file to change the scale.

## Debug
`MotionKit.debug = true`, `MotionKit.refresh()`, `MotionKit.destroy()`.
