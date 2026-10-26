import { attr, num, canHover } from '../core.js';

// underline / underline-static are pure CSS (see css/gt-base.css). Only "roll" needs JS.
export function link(ctx) {
  if (!canHover()) return;
  ctx.els('link').forEach((el) => {
    if (attr(el, 'style', 'underline') !== 'roll') return;
    const text = el.textContent.trim();
    const hoverText = attr(el, 'hover-text', text);
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'gt-roll';
    const a = document.createElement('span');
    a.className = 'gt-roll__a';
    a.textContent = text;
    const b = document.createElement('span');
    b.className = 'gt-roll__b';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = hoverText;
    wrap.append(a, b);
    el.append(wrap);
    const tl = gsap.timeline({ paused: true, defaults: { duration: num(el, 'duration', 0.5), ease: attr(el, 'ease', 'power3.inOut') } });
    gsap.set(b, { yPercent: 100 });
    tl.to(a, { yPercent: -100 }, 0).to(b, { yPercent: 0 }, 0);
    const play = () => tl.play();
    const rev = () => tl.reverse();
    el.addEventListener('mouseenter', play);
    el.addEventListener('mouseleave', rev);
    el.addEventListener('focus', () => el.matches(':focus-visible') && play());
    el.addEventListener('blur', rev);
    ctx.cleanup(() => {
      tl.kill();
      el.removeEventListener('mouseenter', play);
      el.removeEventListener('mouseleave', rev);
      el.textContent = text;
      el.removeAttribute('aria-label');
    });
  });
}
