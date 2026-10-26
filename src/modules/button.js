import { attr, num, canHover } from '../core.js';

const ARROW = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>';

// data-gt="button" data-gt-style="fill | outline | arrow"
export function button(ctx) {
  if (!canHover()) return;
  ctx.els('button').forEach((el) => {
    const style = attr(el, 'style', 'fill');
    const original = el.innerHTML;
    const text = el.textContent.trim();
    const hoverText = attr(el, 'hover-text', text);
    const arrowEl = el.querySelector('[data-gt-button-arrow]');
    if (arrowEl) arrowEl.remove();

    el.classList.add('gt-btn', 'gt-btn--' + style);
    el.textContent = '';
    const bg = document.createElement('span');
    bg.className = 'gt-btn__bg';
    bg.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'gt-btn__label';
    const a = document.createElement('span');
    a.className = 'gt-btn__a';
    a.textContent = text;
    const b = document.createElement('span');
    b.className = 'gt-btn__b';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = hoverText;
    label.append(a, b);
    el.append(bg, label);

    let arrow = null;
    if (style === 'arrow') {
      arrow = arrowEl || Object.assign(document.createElement('span'), { innerHTML: ARROW });
      arrow.classList.add('gt-btn__arrow');
      el.append(arrow);
    }

    const d = num(el, 'duration', 0.5);
    const ease = attr(el, 'ease', 'power3.inOut');
    gsap.set(bg, { yPercent: 101 });
    gsap.set(b, { yPercent: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { duration: d, ease } });
    tl.to(bg, { yPercent: 0 }, 0);
    if (style === 'arrow') {
      tl.to(arrow, { x: num(el, 'arrow-distance', 6) * 1.6 , duration: d }, 0);
    } else {
      tl.to(a, { yPercent: -100 }, 0).to(b, { yPercent: -100 }, 0);
    }
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
      el.classList.remove('gt-btn', 'gt-btn--' + style);
      el.innerHTML = original;
    });
  });
}
