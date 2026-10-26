# motion-kit: instructions for Claude (and humans)

Greaterthan's GSAP motion kit for Webflow. One script reads `data-gt-*` attributes. Read `docs/README.md` for the full attribute reference and `docs/HANDOFF.md` for the team workflow.

## Commands
- `npm install`, `npm run build` (esbuild to `dist/`), `npm test` (jsdom smoke test, not a visual test)
- `node tools/type-scale.mjs [--json]` regenerates the fluid type variables

## Rules that must not be broken
1. **Prefix is `data-gt`.** Options are `data-gt-<option>`. Nav roles are `data-gt-nav="..."`. Never rename an attribute or change a default in a minor release. That is a major version.
2. **Never hide content with `visibility` or `display`.** Hidden-until-revealed content uses opacity only, so screen readers and find-in-page keep working.
3. **Every motion respects `prefers-reduced-motion`**. Hover effects only on `(hover: hover) and (pointer: fine)`. Anything that moves for more than 5 seconds needs a pause control or pause-on-hover.
4. **Keyboard and screen reader behaviour is part of the feature.** Nav: aria-expanded, aria-controls, focus trap, Esc, inert background. Do not ship a module without keyboard behaviour.
5. **Cleanup is mandatory.** Every module registers `ctx.cleanup(fn)` so `MotionKit.destroy()` and breakpoint changes restore the DOM.
6. **GSAP, ScrollTrigger and SplitText are globals** loaded before the kit. Do not bundle them.
7. **Spacing in rem, multiples of 8px or 16px** (0.5rem, 1rem, 1.5rem, 2rem...). No px for padding or margin.
8. **No secrets, tokens or client data in this repo.** It is public.

## Releasing
- Edit `src/` and `css/`, never `dist/` by hand. Run `npm run build` and `npm test`, commit `dist/` too (jsDelivr serves it).
- Bump `version` in `package.json` and `VERSION` in `src/index.js`, add a `CHANGELOG.md` entry, update `docs/README.md`.
- Tag `vX.Y.Z` and create a GitHub release. jsDelivr URLs must pin the tag, never `@main`.
- After the tag is live, update the Webflow Starter head and footer embeds to the new version. Check the CDN URL loads in a browser first.

## Known limits
- Real-browser behaviour is only verified by hand. Open `demo/index.html`, and test on a published Webflow site (transitions do not play in the Designer).
- View transitions work in Chrome, Edge and Safari 18.2+. Elsewhere pages simply load.
- Webflow quirks: the variable API rejects `clamp()`/`calc()` values (fluid type lives as CSS variables in the site head), the HTML builder rejects nested selectors and non-standard media queries, and buttons can come out as `<a>` elements (the kit adds role and keyboard support).
