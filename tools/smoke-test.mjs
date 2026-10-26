// Sanity test in jsdom: the kit initialises without throwing and builds the expected DOM/ARIA.
// NOT a visual test. Real-browser check: open demo/index.html.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const html = `<!doctype html><html class="gt-js"><body>
<nav data-gt-nav="root" data-gt-nav-style="slide"><button data-gt-nav="toggle">Menu</button>
<div data-gt-nav="panel"><a data-gt-nav="item" href="#a">A</a><a data-gt-nav="item" href="#b">B</a></div></nav>
<h1 data-gt="split-text" data-gt-split="chars">Hello world</h1>
<p data-gt="reveal">r</p><div data-gt="reveal-group"><i>1</i><i>2</i></div>
<div style="overflow:hidden"><img data-gt="parallax" alt=""></div>
<div data-gt="image-mask"><img alt=""></div>
<a data-gt="link" data-gt-style="roll" href="#">Roll</a>
<a data-gt="button" data-gt-style="arrow" href="#">Go</a>
<div data-gt="marquee"><span>one</span><span>two</span></div>
<p data-gt="text-scrub">scrub these words</p>
</body></html>`;
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /no-preference|hover: hover|max-width: 991px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
w.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
w.document.fonts = { ready: Promise.resolve(), addEventListener() {}, removeEventListener() {} };
w.scrollTo = () => {};
w.HTMLElement.prototype.getBoundingClientRect = function () { return { width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20, x: 0, y: 0 }; };
const errors = [];
w.console.error = (...a) => errors.push(a.join(' '));
w.console.warn = (...a) => errors.push('WARN ' + a.join(' '));
for (const f of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js']) w.eval(readFileSync(new URL('../node_modules/gsap/dist/' + f, import.meta.url), 'utf8'));
w.eval(read('dist/motion-kit.min.js'));
await new Promise((r) => setTimeout(r, 400));
const q = (s) => w.document.querySelector(s);
const checks = {
  'MotionKit global': !!w.MotionKit,
  'gt-ready class': w.document.documentElement.classList.contains('gt-ready'),
  'nav aria-expanded=false': q('[data-gt-nav=toggle]').getAttribute('aria-expanded') === 'false',
  'nav aria-controls': !!q('[data-gt-nav=toggle]').getAttribute('aria-controls'),
  'nav panel inert': q('[data-gt-nav=panel]').hasAttribute('inert'),
  'roll built': !!q('.gt-roll__b'),
  'button built': !!q('.gt-btn__bg') && !!q('.gt-btn__arrow'),
  'marquee built': !!q('.gt-marquee__track') && w.document.querySelectorAll('.gt-marquee__group').length >= 2,
  'transition attr set': !!w.document.documentElement.dataset.gtTransition,
};
q('[data-gt-nav=toggle]').click();
checks['nav opens'] = q('[data-gt-nav=toggle]').getAttribute('aria-expanded') === 'true' && !q('[data-gt-nav=panel]').hasAttribute('inert');
w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
checks['esc closes'] = q('[data-gt-nav=toggle]').getAttribute('aria-expanded') === 'false';
w.MotionKit.destroy();
checks['destroy restores button'] = !q('.gt-btn__bg');
let fail = 0;
for (const [k, v] of Object.entries(checks)) { console.log(v ? 'ok  ' : 'FAIL', k); if (!v) fail++; }
if (errors.length) { console.log('errors:', errors); fail++; }
process.exit(fail ? 1 : 0);
