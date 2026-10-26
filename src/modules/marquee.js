import { attr, num, toPx, remPx } from '../core.js';

// data-gt="marquee" data-gt-speed="5" (rem/s) data-gt-boost="4" data-gt-smoothing="0.2" data-gt-direction="left|right"
export function marquee(ctx) {
  ctx.els('marquee').forEach((el) => {
    const items = Array.from(el.children);
    if (!items.length) return;
    const baseDir = attr(el, 'direction', 'left') === 'right' ? 1 : -1;
    const speed = num(el, 'speed', 5);
    const boost = num(el, 'boost', 4);
    const smoothing = Math.max(0.01, num(el, 'smoothing', 0.2));

    const original = el.innerHTML;
    const track = document.createElement('div');
    track.className = 'gt-marquee__track';
    const group = document.createElement('div');
    group.className = 'gt-marquee__group';
    items.forEach((i) => group.append(i));
    track.append(group);
    el.append(track);
    el.classList.add('gt-marquee');

    let groupW = 0;
    const build = () => {
      // remove old clones, measure, add enough clones to cover 2x viewport
      track.querySelectorAll('.gt-marquee__group[data-clone]').forEach((n) => n.remove());
      groupW = group.getBoundingClientRect().width;
      if (!groupW) return;
      const needed = Math.ceil((el.getBoundingClientRect().width * 2) / groupW) + 1;
      for (let i = 0; i < needed; i++) {
        const c = group.cloneNode(true);
        c.setAttribute('data-clone', '');
        c.setAttribute('aria-hidden', 'true');
        track.append(c);
      }
    };
    build();

    let x = 0;
    let velocity = 0; // signed px/s, smoothed
    let dir = baseDir; // persists until the next scroll in the other direction
    let boostNow = 1;
    let active = true;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (s) => (active = s.isActive),
    });
    const scrollSt = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        // scrolling down keeps base direction, scrolling up reverses it
        dir = self.direction === 1 ? baseDir : -baseDir;
        const v = Math.min(Math.abs(self.getVelocity()) / 2000, 1);
        boostNow = 1 + v * (boost - 1);
      },
    });

    const tick = (_t, dt) => {
      if (!active || !groupW) return;
      const sec = dt / 1000;
      boostNow += (1 - boostNow) * (1 - Math.exp(-sec / (smoothing * 4))); // decay back to 1
      const target = dir * speed * remPx() * boostNow;
      velocity += (target - velocity) * (1 - Math.exp(-sec / smoothing));
      x += velocity * sec;
      x = ((x % groupW) - groupW) % groupW; // keep within [-groupW, 0)
      gsap.set(track, { x });
    };
    gsap.ticker.add(tick);
    const onResize = () => build();
    ScrollTrigger.addEventListener('refreshInit', onResize);

    ctx.cleanup(() => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refreshInit', onResize);
      st.kill();
      scrollSt.kill();
      el.classList.remove('gt-marquee');
      el.innerHTML = original;
    });
  });
}
