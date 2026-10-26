# Handing off the motion kit and Starter

## What a new developer needs
1. **GitHub:** the repo is public. Write access: invite them as a collaborator (they need it to push and create releases).
2. **Webflow:** invite them to the workspace with a Designer seat on the Starter project (or the client project they are building). Their Claude can only reach what their own Webflow login can reach.
3. **Claude:** each person uses their own Claude account. Nothing from your sessions or memory carries over, so everything they need must be in the repo or the Starter.
4. **Webflow connector:** they connect the Webflow connector in their own Claude and authorise the same workspace.

## Two ways they will work
- **Kit work (code):** clone the repo, open it in Claude Code. `CLAUDE.md` loads automatically and holds the rules. Use the prompts below.
- **Site work (Webflow):** clone the Starter in Webflow, add attributes in the Designer or ask their Claude to do it through the Webflow connector. Docs live on the Starter's Home page and in `docs/README.md`.

## Prompts to paste into Claude

### 1. Onboarding (Claude Code, repo open)
> Read CLAUDE.md, docs/README.md and docs/HANDOFF.md. Then run npm install, npm run build and npm test. Summarise how the kit is structured, how releases work, and anything in the repo that looks stale or untested. Do not change any code yet.

### 2. Building a client site from the Starter (Claude with the Webflow connector)
> I am building a site for [client] from the Greaterthan Starter (Webflow project "Starter site", cloned for this client). The motion kit is documented on the Starter's Home page and at github.com/mattstobo/motion-kit/blob/main/docs/README.md. Use only `data-gt` attributes for animation, no Webflow native interactions. Spacing in rem, multiples of 8px or 16px. Use the fluid type CSS variables. Keep every animation optional for reduced motion and make sure interactive parts work with the keyboard. Build [page/section] to match [design link]. Before you start, list which kit modules you plan to use and where.

### 3. Adding or changing a kit module (Claude Code, repo open)
> I need to add [module / change]. Follow CLAUDE.md. Put the module in src/modules, register it in src/index.js, add cleanup, reduced-motion handling and keyboard behaviour where relevant, document every attribute and default in docs/README.md, extend tools/smoke-test.mjs, and add a CHANGELOG entry. Propose the attribute names and defaults first and wait for my approval before writing code.

### 4. Reviewing a client site that uses the kit
> Audit this Webflow site for kit problems: unknown or mistyped data-gt values, missing GSAP/kit embeds or mismatched versions, nav roles missing, hover-only interactions with no keyboard equivalent, content that depends on JS to be visible, and anything that will not work in the CMS. Report findings by severity.

## Before every client launch
Use the launch checklist page in the Starter. At minimum: test with `?gt=off` to separate kit bugs from Webflow bugs, test `?gt-debug`, check reduced motion, keyboard-only and a screen reader, and confirm the embeds pin an exact kit version.
