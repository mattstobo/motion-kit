# Changelog
## 1.0.0
Initial release: reveal, reveal-group, parallax, split-text, text-scrub, image-mask, link (3 styles), button (3 styles), marquee, mobile nav, CSS view transitions (8 variants), fluid type generator.

## 1.1.0
- New page transition `pull-back`; removed `mask-circle` and `mask-diamond`.
- Nav dropdowns (desktop dropdown, mobile accordion).
- Accessibility pass: opacity-only reveals, role=button fallback, landmark labels, marquee pause, focus styles, forced-colors fallbacks, scrub default 0.4.
- Fix: roll/button hover text was clipped when the hover text was longer than the original.

## 1.2.0
- New modules: counter, scheme (colour per section), progress, section-nav, magnetic, cursor, hscroll, hover-list, loader.
- Optional Lenis smooth scroll, `?gt=off` kill switch, `?gt-debug` panel.
- CMS: scoped re-init with `MotionKit.refresh(el)` and `data-gt-observe`.

## 1.3.0
- New page transition `parallax-cover` (1.2s, cubic-bezier(.7,.05,.13,1), old page drifts up 25vh and darkens, new page slides over). `pull-back` is unchanged.

## 1.3.1
- `parallax-cover` no longer animates at 767px and below (instant swap).

## 1.4.0
- New page transition `color-wipe`: a colour block rises over the old page, then the new page rises over it. Variables: `--gt-tv-wipe-color`, `-duration`, `-ease`, `-skew`, `-shift`. No animation at 767px and below.
- `wipe-up`, `wipe-left` and `curtain` are deprecated (still work, removed from docs, removed in 2.0.0).

## 1.5.0
- New page transition `mask-rise` (CSS only): the new page grows out of a rounded window while the old page zooms and dims. Variables `--gt-tv-mask-*`. No animation at 767px and below.

## 1.5.1
- `color-wipe` is faster (1.4s to 1s) and uses the `parallax-cover` easing, `cubic-bezier(.7,.05,.13,1)`. This changes defaults of a variant released one version earlier; it has no known users outside the Starter.
