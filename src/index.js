import { cfg, all, log, MotionKitState } from './core.js';
import { reveal, revealGroup } from './modules/reveal.js';
import { parallax } from './modules/parallax.js';
import { splitText, textScrub } from './modules/split-text.js';
import { imageMask } from './modules/image-mask.js';
import { link } from './modules/link.js';
import { button } from './modules/button.js';
import { marquee } from './modules/marquee.js';
import { nav } from './modules/nav.js';
import { transitions } from './modules/transitions.js';

const VERSION = '1.1.0';
let mm = null;
let navCtx = null;
const navCleanups = [];

function init() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add('gt-ready');

  // Nav and transitions work regardless of motion preference.
  navCtx = { cleanup: (fn) => navCleanups.push(fn) };
  nav(navCtx);
  transitions();

  mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px)' }, (context) => {
    const { motion, mobile } = context.conditions;
    if (!motion) return;
    const cleanups = [];
    const ctx = {
      els: (name) => all(document, name).filter((el) => !(mobile && el.getAttribute('data-gt-mobile') === 'off')),
      cleanup: (fn) => cleanups.push(fn),
    };
    [reveal, revealGroup, parallax, splitText, textScrub, imageMask, link, button, marquee].forEach((m) => {
      try { m(ctx); } catch (err) { console.error('[motion-kit]', m.name, err); }
    });
    log('initialised', { mobile });
    return () => cleanups.forEach((fn) => fn());
  });
}

async function start() {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    console.warn('[motion-kit] GSAP, ScrollTrigger and SplitText must load before the kit.');
    return;
  }
  const waits = [document.fonts ? document.fonts.ready : Promise.resolve()];
  const vt = document.activeViewTransition;
  if (vt && vt.finished) waits.push(vt.finished.catch(() => {}));
  await Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 1500))]);
  init();
  ScrollTrigger.refresh();
}

window.MotionKit = {
  version: VERSION,
  get debug() { return MotionKitState.debug; },
  set debug(v) { MotionKitState.debug = !!v; },
  refresh: () => window.ScrollTrigger && ScrollTrigger.refresh(),
  destroy() {
    if (mm) mm.revert();
    navCleanups.splice(0).forEach((fn) => fn());
    document.documentElement.classList.remove('gt-ready');
  },
  init,
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
