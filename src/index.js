import { cfg, log, MotionKitState } from './core.js';
import { reveal, revealGroup } from './modules/reveal.js';
import { parallax } from './modules/parallax.js';
import { splitText, textScrub } from './modules/split-text.js';
import { imageMask } from './modules/image-mask.js';
import { link } from './modules/link.js';
import { button } from './modules/button.js';
import { marquee } from './modules/marquee.js';
import { nav } from './modules/nav.js';
import { transitions } from './modules/transitions.js';
import { counter, scheme, progress, magnetic, cursor, hscroll, hoverList } from './modules/extras.js';

const VERSION = '1.2.0';
const MODULES = [reveal, revealGroup, parallax, splitText, textScrub, imageMask, link, button, marquee, counter, scheme, progress, magnetic, cursor, hscroll, hoverList];
const params = new URLSearchParams(location.search);

let mm = null;
let live = null; // { conditions, cleanups, done } of the current matchMedia context
let observers = [];
const navCleanups = [];
let lenis = null;

const makeCtx = (conditions, cleanups, done, root) => ({
  desktop: !!conditions.desktop,
  els: (name) =>
    Array.from(root.querySelectorAll(`[data-gt~="${name}"]`)).filter((el) => {
      if (conditions.mobile && el.getAttribute('data-gt-mobile') === 'off') return false;
      const key = name;
      const seen = done.get(el) || new Set();
      if (seen.has(key)) return false; // already initialised: scoped re-init never doubles up
      seen.add(key); done.set(el, seen);
      return true;
    }),
  cleanup: (fn) => cleanups.push(fn),
});

function runModules(ctx) {
  MODULES.forEach((m) => {
    try { m(ctx); } catch (err) { console.error('[motion-kit]', m.name, err); errors.push(m.name + ': ' + err.message); }
  });
}
const errors = [];

function init() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.documentElement.classList.add('gt-ready');

  const navCtx = { cleanup: (fn) => navCleanups.push(fn) };
  nav(navCtx);
  transitions();
  setupSmooth();

  mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px)', desktop: '(min-width: 992px)' }, (context) => {
    const { motion } = context.conditions;
    if (!motion) return;
    const cleanups = [];
    const done = new WeakMap();
    live = { conditions: context.conditions, cleanups, done };
    runModules(makeCtx(context.conditions, cleanups, done, document));
    log('initialised', context.conditions);
    return () => { live = null; cleanups.forEach((fn) => fn()); };
  });
  observeContainers();
  if (MotionKitState.debug || params.has('gt-debug')) debugPanel();
}

// Scoped (re)initialise: use after CMS items load, filters change, or you inject markup.
function initRoot(root = document) {
  if (!live) return;
  runModules(makeCtx(live.conditions, live.cleanups, live.done, root));
  ScrollTrigger.refresh();
}

// <div data-gt-observe> (e.g. the Collection List) re-inits new items automatically
function observeContainers() {
  document.querySelectorAll('[data-gt-observe]').forEach((box) => {
    let t;
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => initRoot(box), 100); });
    mo.observe(box, { childList: true, subtree: true });
    observers.push(mo);
  });
}

function setupSmooth() {
  if (!window.Lenis) return;
  const host = document.querySelector('[data-gt-smooth]');
  if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dur = parseFloat(host.getAttribute('data-gt-smooth-duration')) || 1.2;
  lenis = new window.Lenis({ duration: dur, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // pause smooth scroll while the mobile menu is open
  new MutationObserver(() => { document.documentElement.classList.contains('gt-nav-open') ? lenis.stop() : lenis.start(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.MotionKit.lenis = lenis;
}

function debugPanel() {
  document.documentElement.classList.add('gt-debug');
  const counts = {};
  document.querySelectorAll('[data-gt]').forEach((el) => el.getAttribute('data-gt').split(/\s+/).forEach((m) => { counts[m] = (counts[m] || 0) + 1; }));
  const unknown = Object.keys(counts).filter((m) => !KNOWN.includes(m));
  const panel = document.createElement('div');
  panel.className = 'gt-debug-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Motion kit debug');
  panel.innerHTML = `<strong>motion-kit ${VERSION}</strong><br>` +
    Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('<br>') +
    (unknown.length ? `<br><br>Unknown modules (typo?): ${unknown.join(', ')}` : '') +
    (errors.length ? `<br><br>Errors:<br>${errors.join('<br>')}` : '') +
    `<br><br>ScrollTriggers: ${ScrollTrigger.getAll().length}`;
  document.body.append(panel);
}
const KNOWN = ['reveal', 'reveal-group', 'parallax', 'split-text', 'text-scrub', 'image-mask', 'link', 'button', 'marquee', 'counter', 'scheme', 'progress', 'section-nav', 'magnetic', 'cursor', 'hscroll', 'hover-list', 'loader'];

// <div data-gt="loader"> overlay: fades out after the page loads (minimum time: data-gt-min, default 0.8s)
function loader() {
  const el = document.querySelector('[data-gt~="loader"]');
  if (!el) return Promise.resolve();
  const min = parseFloat(el.getAttribute('data-gt-min')) || 0.8;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
  const wait = Promise.all([loaded, new Promise((r) => setTimeout(r, reduce ? 0 : min * 1000))]);
  const cap = new Promise((r) => setTimeout(r, 4000)); // never trap visitors behind a loader
  return Promise.race([wait, cap]).then(
    () => new Promise((resolve) => {
      if (!window.gsap || reduce) { el.style.display = 'none'; return resolve(); }
      gsap.to(el, { yPercent: -100, duration: 0.8, ease: 'power3.inOut', onComplete: () => { el.style.display = 'none'; resolve(); } });
    })
  );
}

async function start() {
  const off = params.get('gt') === 'off' || cfg.enabled === false;
  if (off) { document.documentElement.classList.remove('gt-js'); console.info('[motion-kit] disabled (?gt=off or MotionKitConfig.enabled=false)'); return; }
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    console.warn('[motion-kit] GSAP, ScrollTrigger and SplitText must load before the kit.');
    return;
  }
  await loader();
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
  refresh: (root) => (root ? initRoot(root) : window.ScrollTrigger && ScrollTrigger.refresh()),
  destroy() {
    if (mm) mm.revert();
    observers.splice(0).forEach((o) => o.disconnect());
    navCleanups.splice(0).forEach((fn) => fn());
    if (lenis) lenis.destroy();
    document.documentElement.classList.remove('gt-ready');
  },
  init,
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
