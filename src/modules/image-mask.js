import { attr, num, cfg } from '../core.js';

const FROM = {
  bottom: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  top: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'],
  left: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  right: ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'],
  center: ['inset(50% 50% 50% 50%)', 'inset(0% 0% 0% 0%)'],
};

// data-gt="image-mask" data-gt-from="bottom" data-gt-zoom="1.2"
export function imageMask(ctx) {
  ctx.els('image-mask').forEach((el) => {
    const [a, b] = FROM[attr(el, 'from', 'bottom')] || FROM.bottom;
    const inner = el.querySelector('img, video, [data-gt-mask-inner]');
    const zoom = num(el, 'zoom', 1.15);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: attr(el, 'start', 'top 85%'), once: true },
      defaults: { duration: num(el, 'duration', 1.2), ease: attr(el, 'ease', 'power4.inOut') },
      delay: num(el, 'delay', 0),
    });
    tl.fromTo(el, { clipPath: a }, { clipPath: b }, 0);
    if (inner && zoom !== 1) tl.fromTo(inner, { scale: zoom }, { scale: 1, ease: 'power3.out', duration: num(el, 'duration', 1.2) * 1.2 }, 0);
  });
}
