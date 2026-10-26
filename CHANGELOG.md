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
