import { attr, num, bool, toPx, cfg } from '../core.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Roles: root | toggle | panel | item | icon | backdrop. Parameters live on the root as data-gt-nav-*.
export function nav(ctx) {
  const roots = Array.from(document.querySelectorAll('[data-gt-nav="root"]'));
  roots.forEach((root) => {
    const bp = num(root, 'nav-breakpoint', 991);
    const find = (role) => Array.from(root.querySelectorAll(`[data-gt-nav="${role}"]`));
    const toggle = find('toggle')[0];
    const panel = find('panel')[0];
    if (!toggle || !panel) return;
    const items = find('item');
    const icon = find('icon')[0];
    const backdrop = find('backdrop')[0] || document.querySelector('[data-gt-nav="backdrop"]');

    const mm = gsap.matchMedia();
    mm.add(`(max-width: ${bp}px)`, () => {
      const style = attr(root, 'nav-style', 'slide');
      const from = attr(root, 'nav-from', 'right');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduce ? 0 : num(root, 'nav-duration', 0.7);
      const ease = attr(root, 'nav-ease', 'power3.inOut');
      const stagger = reduce ? 0 : num(root, 'nav-stagger', 0.06);
      const dist = toPx(attr(root, 'nav-item-distance', '2rem'));
      const closeOnLink = bool(root, 'nav-close-on-link', true);
      const scrollLock = bool(root, 'nav-scroll-lock', true);

      if (!panel.id) panel.id = 'gt-nav-panel-' + Math.random().toString(36).slice(2, 7);
      toggle.setAttribute('aria-controls', panel.id);
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');

      const tl = gsap.timeline({ paused: true, defaults: { duration, ease } });
      gsap.set(panel, { visibility: 'hidden' });
      tl.set(panel, { visibility: 'visible' }, 0);
      if (style === 'fade') {
        tl.fromTo(panel, { opacity: 0 }, { opacity: 1 }, 0);
      } else if (style === 'clip') {
        const insets = { top: 'inset(0% 0% 100% 0%)', bottom: 'inset(100% 0% 0% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)' };
        tl.fromTo(panel, { clipPath: insets[from] || insets.top }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0);
      } else {
        const start = { right: { xPercent: 100 }, left: { xPercent: -100 }, top: { yPercent: -100 }, bottom: { yPercent: 100 } }[from] || { xPercent: 100 };
        tl.fromTo(panel, start, { xPercent: 0, yPercent: 0 }, 0);
      }
      if (backdrop) tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration * 0.8 }, 0);
      if (items.length) tl.from(items, { y: dist, autoAlpha: 0, duration: duration * 0.9, stagger, ease: 'power3.out' }, duration * 0.35);
      tl.eventCallback('onReverseComplete', () => (root.dataset.gtNavState = 'closed'));

      let open = false;
      let inerted = [];
      const setInertBg = (on) => {
        if (on) {
          let node = root;
          while (node && node !== document.body) {
            Array.from(node.parentElement.children).forEach((sib) => {
              if (sib !== node && !sib.hasAttribute('inert') && sib.tagName !== 'SCRIPT') { sib.setAttribute('inert', ''); inerted.push(sib); }
            });
            node = node.parentElement;
          }
        } else { inerted.forEach((n) => n.removeAttribute('inert')); inerted = []; }
      };
      const lock = (on) => { if (scrollLock) document.documentElement.classList.toggle('gt-nav-open', on); };

      const openNav = () => {
        if (open) return; open = true;
        toggle.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false'); panel.removeAttribute('inert');
        root.dataset.gtNavState = 'open'; if (icon) icon.dataset.state = 'open';
        lock(true); setInertBg(true);
        tl.timeScale(1).play();
        const f = panel.querySelector(FOCUSABLE); if (f) f.focus({ preventScroll: true });
      };
      const closeNav = (returnFocus = true, instantUnlock = false) => {
        if (!open) return; open = false;
        toggle.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true'); panel.setAttribute('inert', '');
        if (icon) icon.dataset.state = 'closed';
        setInertBg(false);
        if (instantUnlock) lock(false); else tl.eventCallback('onReverseComplete', () => { lock(false); root.dataset.gtNavState = 'closed'; });
        tl.timeScale(1.2).reverse();
        if (returnFocus) toggle.focus({ preventScroll: true });
      };

      const onToggle = (e) => { e.preventDefault(); open ? closeNav() : openNav(); };
      const onKey = (e) => {
        if (!open) return;
        if (e.key === 'Escape') { closeNav(); return; }
        if (e.key !== 'Tab') return;
        const f = Array.from(panel.querySelectorAll(FOCUSABLE)).concat(toggle);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      const onLink = (e) => {
        if (!closeOnLink || !open) return;
        if (e.target.closest('a[href]')) closeNav(false, true); // unlock first so anchor scroll works
      };
      toggle.addEventListener('click', onToggle);
      document.addEventListener('keydown', onKey);
      panel.addEventListener('click', onLink);
      if (backdrop) backdrop.addEventListener('click', () => closeNav());

      return () => {
        toggle.removeEventListener('click', onToggle);
        document.removeEventListener('keydown', onKey);
        panel.removeEventListener('click', onLink);
        setInertBg(false); lock(false);
        tl.kill();
        ['aria-controls', 'aria-expanded'].forEach((a) => toggle.removeAttribute(a));
        ['aria-hidden', 'inert'].forEach((a) => panel.removeAttribute(a));
        gsap.set([panel, backdrop].filter(Boolean), { clearProps: 'all' });
        if (items.length) gsap.set(items, { clearProps: 'all' });
        delete root.dataset.gtNavState;
      };
    });
    ctx.cleanup(() => mm.revert());
  });
}
