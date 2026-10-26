import { all, attr, num, bool, toPx, fromVec, cfg } from '../core.js';

function tweenFor(el, targets, extra = {}) {
  const dist = toPx(attr(el, 'distance', '2rem'));
  const from = fromVec(attr(el, 'from', 'up'), dist);
  // opacity only (never visibility): hidden content must stay readable by screen readers and find-in-page
  return gsap.fromTo(targets, { x: 0, y: 0, ...from, opacity: 0 }, {
    x: 0,
    y: 0,
    opacity: 1,
    clearProps: 'transform',
    duration: num(el, 'duration', cfg.duration),
    delay: num(el, 'delay', 0),
    ease: attr(el, 'ease', cfg.ease),
    scrollTrigger: {
      trigger: el,
      start: attr(el, 'start', cfg.start),
      toggleActions: bool(el, 'once', true) ? 'play none none none' : 'play none none reverse',
    },
    ...extra,
  });
}

export function reveal(ctx) {
  ctx.els('reveal').forEach((el) => tweenFor(el, el));
}

export function revealGroup(ctx) {
  ctx.els('reveal-group').forEach((el) => {
    const sel = attr(el, 'children', null);
    const kids = sel ? el.querySelectorAll(sel) : el.children;
    if (!kids.length) return;
    tweenFor(el, kids, { stagger: num(el, 'stagger', 0.1) });
  });
}
