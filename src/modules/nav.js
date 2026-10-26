import { attr, num, bool, toPx, a11yButton, isVisible } from '../core.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Roles: root | toggle | panel | item | icon | backdrop | dropdown | dropdown-toggle | dropdown-menu | dropdown-icon
// Parameters live on the root as data-gt-nav-*.
export function nav(ctx) {
  const roots = Array.from(document.querySelectorAll('[data-gt-nav="root"]'));
  roots.forEach((root) => {
    const bp = num(root, 'nav-breakpoint', 991);
    const find = (role) => Array.from(root.querySelectorAll(`[data-gt-nav="${role}"]`));
    const toggle = find('toggle')[0];
    const panel = find('panel')[0];
    const items = find('item');
    const icon = find('icon')[0];
    const backdrop = find('backdrop')[0] || document.querySelector('[data-gt-nav="backdrop"]');
    const labelOpen = attr(root, 'nav-label-open', null);
    const labelClose = attr(root, 'nav-label-close', null);

    // Landmark label so screen readers can tell several navs apart
    if (root.tagName === 'NAV' || root.getAttribute('role') === 'navigation') {
      if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) root.setAttribute('aria-label', attr(root, 'nav-label', 'Main'));
    }

    // ---------- Dropdowns (disclosure pattern) ----------
    const dropdowns = find('dropdown');
    const ddMM = gsap.matchMedia();
    if (dropdowns.length) {
      ddMM.add(
        { desktop: `(min-width: ${bp + 1}px)`, mobile: `(max-width: ${bp}px)` },
        (c) => {
          const { desktop } = c.conditions;
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const d = reduce ? 0 : num(root, 'nav-dropdown-duration', 0.35);
          const hover = desktop && bool(root, 'nav-dropdown-hover', false);
          const undo = [];
          const states = dropdowns.map((dd) => {
            const t = dd.querySelector('[data-gt-nav="dropdown-toggle"]');
            const m = dd.querySelector('[data-gt-nav="dropdown-menu"]');
            if (!t || !m) return null;
            if (!m.id) m.id = 'gt-dd-' + Math.random().toString(36).slice(2, 7);
            t.setAttribute('aria-controls', m.id);
            t.setAttribute('aria-expanded', 'false');
            undo.push(a11yButton(t));
            if (desktop) gsap.set(m, { autoAlpha: 0, y: -8 });
            else gsap.set(m, { autoAlpha: 0, height: 0 });
            const st = { dd, t, m, open: false, tween: null };
            st.set = (open, { focus = false } = {}) => {
              if (st.open === open) return;
              st.open = open;
              t.setAttribute('aria-expanded', String(open));
              if (st.tween) st.tween.kill();
              const to = desktop ? { autoAlpha: open ? 1 : 0, y: open ? 0 : -8 } : { autoAlpha: open ? 1 : 0, height: open ? 'auto' : 0 };
              st.tween = gsap.to(m, { ...to, duration: d, ease: 'power2.out' });
              if (!open && focus) t.focus({ preventScroll: true });
              if (open && focus) { const f = m.querySelector(FOCUSABLE); if (f) f.focus({ preventScroll: true }); }
            };
            const closeOthers = () => states.forEach((o) => o && o !== st && o.set(false));
            const onClick = (e) => { e.preventDefault(); closeOthers(); st.set(!st.open); };
            const onKeyT = (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); closeOthers(); st.set(true, { focus: true }); } };
            const onKeyDD = (e) => {
              if (e.key === 'Escape' && st.open) { e.stopPropagation(); st.set(false, { focus: true }); }
              if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && m.contains(document.activeElement)) {
                const f = Array.from(m.querySelectorAll(FOCUSABLE)).filter(isVisible);
                const i = f.indexOf(document.activeElement);
                const n = f[(i + (e.key === 'ArrowDown' ? 1 : -1) + f.length) % f.length];
                if (n) { e.preventDefault(); n.focus(); }
              }
            };
            const onFocusOut = (e) => { if (desktop && st.open && !dd.contains(e.relatedTarget)) st.set(false); };
            let hoverT;
            const onEnter = () => { clearTimeout(hoverT); closeOthers(); st.set(true); };
            const onLeave = () => { hoverT = setTimeout(() => st.set(false), 150); };
            t.addEventListener('click', onClick);
            t.addEventListener('keydown', onKeyT);
            dd.addEventListener('keydown', onKeyDD);
            dd.addEventListener('focusout', onFocusOut);
            if (hover) { dd.addEventListener('mouseenter', onEnter); dd.addEventListener('mouseleave', onLeave); }
            undo.push(() => {
              t.removeEventListener('click', onClick); t.removeEventListener('keydown', onKeyT);
              dd.removeEventListener('keydown', onKeyDD); dd.removeEventListener('focusout', onFocusOut);
              dd.removeEventListener('mouseenter', onEnter); dd.removeEventListener('mouseleave', onLeave);
              clearTimeout(hoverT);
              if (st.tween) st.tween.kill();
              gsap.set(m, { clearProps: 'all' });
              t.removeAttribute('aria-controls'); t.removeAttribute('aria-expanded');
            });
            return st;
          });
          const onDoc = (e) => { if (desktop) states.forEach((s) => s && s.open && !s.dd.contains(e.target) && s.set(false)); };
          document.addEventListener('click', onDoc);
          return () => { document.removeEventListener('click', onDoc); undo.forEach((fn) => fn()); };
        }
      );
    }

    // ---------- Mobile panel ----------
    const mm = gsap.matchMedia();
    if (toggle && panel) mm.add(`(max-width: ${bp}px)`, () => {
      const style = attr(root, 'nav-style', 'slide');
      const from = attr(root, 'nav-from', 'right');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduce ? 0 : num(root, 'nav-duration', 0.7);
      const ease = attr(root, 'nav-ease', 'power3.inOut');
      const stagger = reduce ? 0 : num(root, 'nav-stagger', 0.06);
      const dist = toPx(attr(root, 'nav-item-distance', '2rem'));
      const closeOnLink = bool(root, 'nav-close-on-link', true);
      const scrollLock = bool(root, 'nav-scroll-lock', true);
      const undoBtn = a11yButton(toggle);
      const baseLabel = toggle.getAttribute('aria-label');

      if (!panel.id) panel.id = 'gt-nav-panel-' + Math.random().toString(36).slice(2, 7);
      toggle.setAttribute('aria-controls', panel.id);
      toggle.setAttribute('aria-expanded', 'false');
      if (labelOpen) toggle.setAttribute('aria-label', labelOpen);
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
      // opacity only so links stay in the accessibility tree
      if (items.length) tl.from(items, { y: dist, opacity: 0, duration: duration * 0.9, stagger, ease: 'power3.out' }, duration * 0.35);

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
        if (labelClose) toggle.setAttribute('aria-label', labelClose);
        panel.removeAttribute('inert');
        root.dataset.gtNavState = 'open'; if (icon) icon.dataset.state = 'open';
        lock(true); setInertBg(true);
        tl.eventCallback('onReverseComplete', null);
        tl.timeScale(1).play();
        const f = Array.from(panel.querySelectorAll(FOCUSABLE)).find(isVisible) || panel;
        if (f === panel) panel.setAttribute('tabindex', '-1');
        f.focus({ preventScroll: true });
      };
      const closeNav = (returnFocus = true, instantUnlock = false) => {
        if (!open) return; open = false;
        toggle.setAttribute('aria-expanded', 'false');
        if (labelOpen) toggle.setAttribute('aria-label', labelOpen);
        panel.setAttribute('inert', '');
        if (icon) icon.dataset.state = 'closed';
        setInertBg(false);
        if (instantUnlock) lock(false);
        tl.eventCallback('onReverseComplete', () => { lock(false); root.dataset.gtNavState = 'closed'; });
        tl.timeScale(1.2).reverse();
        if (returnFocus) toggle.focus({ preventScroll: true });
      };

      const onToggle = (e) => { e.preventDefault(); open ? closeNav() : openNav(); };
      const onKey = (e) => {
        if (!open) return;
        if (e.key === 'Escape') { closeNav(); return; }
        if (e.key !== 'Tab') return;
        const f = Array.from(panel.querySelectorAll(FOCUSABLE)).concat(toggle).filter(isVisible);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      const onLink = (e) => {
        if (!closeOnLink || !open) return;
        if (e.target.closest('a[href]')) closeNav(false, true);
      };
      const onBackdrop = () => closeNav();
      toggle.addEventListener('click', onToggle);
      document.addEventListener('keydown', onKey);
      panel.addEventListener('click', onLink);
      if (backdrop) backdrop.addEventListener('click', onBackdrop);

      return () => {
        undoBtn();
        toggle.removeEventListener('click', onToggle);
        document.removeEventListener('keydown', onKey);
        panel.removeEventListener('click', onLink);
        if (backdrop) backdrop.removeEventListener('click', onBackdrop);
        setInertBg(false); lock(false);
        tl.kill();
        ['aria-controls', 'aria-expanded'].forEach((a) => toggle.removeAttribute(a));
        if (baseLabel === null) toggle.removeAttribute('aria-label'); else toggle.setAttribute('aria-label', baseLabel);
        ['inert', 'tabindex'].forEach((a) => panel.removeAttribute(a));
        gsap.set([panel, backdrop].filter(Boolean), { clearProps: 'all' });
        if (items.length) gsap.set(items, { clearProps: 'all' });
        delete root.dataset.gtNavState;
      };
    });
    ctx.cleanup(() => { mm.revert(); ddMM.revert(); });
  });
}
