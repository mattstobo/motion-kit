import { attr, num, bool, toPx, canHover, cfg } from '../core.js';

// ---------- counter: data-gt="counter" data-gt-to="1200" data-gt-from="0" data-gt-duration="2" ----------
export function counter(ctx) {
  ctx.els('counter').forEach((el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([^0-9-]*)(-?[\d.,]+)(.*)$/);
    const to = num(el, 'to', m ? parseFloat(m[2].replace(/,/g, '')) : NaN);
    if (!Number.isFinite(to)) return;
    const prefix = m ? m[1] : '';
    const suffix = m ? m[3] : '';
    const decimals = num(el, 'decimals', m && m[2].includes('.') ? m[2].split('.')[1].length : 0);
    const fmt = (v) => prefix + v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    el.setAttribute('aria-label', raw); // screen readers get the final value, not the counting
    const o = { v: num(el, 'from', 0) };
    el.textContent = fmt(o.v);
    gsap.to(o, {
      v: to, duration: num(el, 'duration', 2), ease: attr(el, 'ease', 'power2.out'),
      onUpdate: () => { el.textContent = fmt(o.v); },
      scrollTrigger: { trigger: el, start: attr(el, 'start', 'top 90%'), once: true },
    });
    ctx.cleanup(() => { el.textContent = raw; el.removeAttribute('aria-label'); });
  });
}

// ---------- scheme: colour the page per section. data-gt="scheme" data-gt-bg="#111" data-gt-color="#fff" ----------
export function scheme(ctx) {
  const secs = ctx.els('scheme');
  if (!secs.length) return;
  const body = document.body;
  const cs = getComputedStyle(body);
  const base = { backgroundColor: cs.backgroundColor, color: cs.color };
  const dur = 0.6;
  let active = null;
  const apply = (target) => gsap.to(body, { ...target, duration: dur, ease: 'power2.out', overwrite: 'auto' });
  secs.forEach((el) => {
    const t = {};
    if (attr(el, 'bg', null)) t.backgroundColor = attr(el, 'bg');
    if (attr(el, 'color', null)) t.color = attr(el, 'color');
    ScrollTrigger.create({
      trigger: el, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) { active = el; apply(t); }
        else if (active === el) { active = null; apply(base); }
      },
    });
  });
  ctx.cleanup(() => gsap.set(body, { clearProps: 'backgroundColor,color' }));
}

// ---------- progress bar + section nav ----------
export function progress(ctx) {
  ctx.els('progress').forEach((el) => {
    gsap.set(el, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.to(el, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });
    el.setAttribute('aria-hidden', 'true');
  });
  ctx.els('section-nav').forEach((nav) => {
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    links.forEach((a) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      ScrollTrigger.create({
        trigger: t, start: 'top 50%', end: 'bottom 50%',
        onToggle: (s) => {
          a.classList.toggle('is-active', s.isActive);
          if (s.isActive) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        },
      });
    });
  });
}

// ---------- magnetic: data-gt="magnetic" data-gt-strength="0.3" ----------
export function magnetic(ctx) {
  if (!canHover()) return;
  ctx.els('magnetic').forEach((el) => {
    const s = num(el, 'strength', 0.3);
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * s);
      yTo((e.clientY - (r.top + r.height / 2)) * s);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    ctx.cleanup(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); gsap.set(el, { clearProps: 'x,y' }); });
  });
}

// ---------- cursor follower: <div data-gt="cursor"> ; grow over [data-gt-cursor-hover] ----------
export function cursor(ctx) {
  if (!canHover()) return;
  ctx.els('cursor').forEach((el) => {
    el.setAttribute('aria-hidden', 'true');
    el.style.pointerEvents = 'none';
    el.style.position = 'fixed';
    el.style.left = '0'; el.style.top = '0'; el.style.zIndex = '9999';
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(el, 'x', { duration: num(el, 'lag', 0.25), ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: num(el, 'lag', 0.25), ease: 'power3.out' });
    const scale = num(el, 'hover-scale', 2.5);
    const move = (e) => { xTo(e.clientX); yTo(e.clientY); gsap.to(el, { opacity: 1, duration: 0.2, overwrite: 'auto' }); };
    const over = (e) => { if (e.target.closest && e.target.closest('[data-gt-cursor-hover]')) gsap.to(el, { scale, duration: 0.3 }); };
    const out = (e) => { if (e.target.closest && e.target.closest('[data-gt-cursor-hover]')) gsap.to(el, { scale: 1, duration: 0.3 }); };
    const hide = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    document.documentElement.addEventListener('mouseleave', hide);
    ctx.cleanup(() => {
      window.removeEventListener('mousemove', move); document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out); document.documentElement.removeEventListener('mouseleave', hide);
      gsap.set(el, { clearProps: 'all' });
    });
  });
}

// ---------- horizontal scroll (desktop only; stacks normally on mobile) ----------
// <section data-gt="hscroll"><div data-gt-hscroll-track> ...panels... </div></section>
export function hscroll(ctx) {
  if (!ctx.desktop) return;
  ctx.els('hscroll').forEach((el) => {
    const track = el.querySelector('[data-gt-hscroll-track]');
    if (!track) return;
    const dist = () => Math.max(0, track.scrollWidth - el.clientWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: num(el, 'scrub', 1), anticipatePin: 1, invalidateOnRefresh: true },
    });
  });
}

// ---------- hover list: items show a floating image that follows the cursor ----------
// <ul data-gt="hover-list"><li><a data-gt-hover-src="URL (CMS-bindable)">Project</a></li> ...
export function hoverList(ctx) {
  if (!canHover()) return;
  ctx.els('hover-list').forEach((list) => {
    const pv = document.createElement('div');
    pv.className = 'gt-hover-preview';
    pv.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = '';
    pv.append(img);
    document.body.append(pv);
    gsap.set(pv, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.9 });
    const xTo = gsap.quickTo(pv, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(pv, 'y', { duration: 0.4, ease: 'power3.out' });
    const items = () => Array.from(list.querySelectorAll('[data-gt-hover-src]'));
    const show = (e) => {
      const it = e.target.closest('[data-gt-hover-src]');
      if (!it || !list.contains(it)) return;
      img.src = it.getAttribute('data-gt-hover-src');
      if (e.type === 'focusin') { const r = it.getBoundingClientRect(); xTo(r.right); yTo(r.top + r.height / 2); }
      gsap.to(pv, { autoAlpha: 1, scale: 1, duration: 0.3, overwrite: 'auto' });
    };
    const hide = (e) => { if (!e.relatedTarget || !list.contains(e.relatedTarget)) gsap.to(pv, { autoAlpha: 0, scale: 0.9, duration: 0.25, overwrite: 'auto' }); };
    const move = (e) => { xTo(e.clientX + toPx(attr(list, 'offset-x', '0rem'))); yTo(e.clientY); };
    list.addEventListener('mouseover', show); list.addEventListener('focusin', show);
    list.addEventListener('mouseout', hide); list.addEventListener('focusout', hide);
    list.addEventListener('mousemove', move);
    ctx.cleanup(() => {
      list.removeEventListener('mouseover', show); list.removeEventListener('focusin', show);
      list.removeEventListener('mouseout', hide); list.removeEventListener('focusout', hide);
      list.removeEventListener('mousemove', move); pv.remove();
    });
  });
}
