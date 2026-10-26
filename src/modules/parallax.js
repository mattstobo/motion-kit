import { attr, num, bool } from '../core.js';

// Put data-gt="parallax" on the element that moves (usually an <img>) inside a wrapper with overflow:hidden.
export function parallax(ctx) {
  ctx.els('parallax').forEach((el) => {
    const speed = num(el, 'speed', 0.2); // fraction of own height travelled either side of centre
    const scale = num(el, 'scale', 1 + speed * 2);
    const trigger = el.parentElement || el;
    const axis = attr(el, 'axis', 'y');
    const prop = axis === 'x' ? 'xPercent' : 'yPercent';
    const range = (speed / scale) * 100;
    gsap.set(el, { scale });
    gsap.fromTo(
      el,
      { [prop]: -range },
      {
        [prop]: range,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: bool(el, 'scrub', true) ? true : 0.5 },
      }
    );
  });
}
