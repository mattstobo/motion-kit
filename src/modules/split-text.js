import { attr, num, bool, toPx, cfg } from '../core.js';

// data-gt="split-text" data-gt-split="lines|words|chars" data-gt-mask="true"
export function splitText(ctx) {
  ctx.els('split-text').forEach((el) => {
    const type = ['lines', 'words', 'chars'].includes(attr(el, 'split', 'lines')) ? attr(el, 'split', 'lines') : 'lines';
    const useMask = bool(el, 'mask', true);
    const dist = attr(el, 'distance', '110%');
    const opts = {
      type: type === 'chars' ? 'lines,words,chars' : type === 'words' ? 'lines,words' : 'lines',
      autoSplit: true,
      ...(useMask ? { mask: 'lines' } : {}),
      onSplit(self) {
        const targets = self[type];
        const y = String(dist).includes('%') ? { yPercent: parseFloat(dist) } : { y: toPx(dist) };
        return gsap.from(targets, {
          ...y,
          autoAlpha: useMask ? 1 : 0,
          duration: num(el, 'duration', 1),
          delay: num(el, 'delay', 0),
          stagger: num(el, 'stagger', type === 'chars' ? 0.02 : type === 'words' ? 0.06 : 0.1),
          ease: attr(el, 'ease', 'power4.out'),
          scrollTrigger: { trigger: el, start: attr(el, 'start', cfg.start), once: true },
        });
      },
    };
    SplitText.create(el, opts);
    el.style.visibility = 'visible'; // CSS hides pre-split to avoid a flash
  });
}

// Words go from dim to full as you scroll.
export function textScrub(ctx) {
  ctx.els('text-scrub').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: num(el, 'from-opacity', 0.15) },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: attr(el, 'start', 'top 80%'),
              end: attr(el, 'end', 'bottom 40%'),
              scrub: true,
            },
          }
        );
      },
    });
    el.style.visibility = 'visible';
  });
}
