// Shared helpers. Everything reads options from data-gt-* attributes.
export const cfg = Object.assign(
  { ease: 'power3.out', duration: 0.8, start: 'top 85%', debug: false, transition: 'fade' },
  window.MotionKitConfig || {}
);

export const log = (...a) => { if (cfg.debug || MotionKitState.debug) console.log('[motion-kit]', ...a); };
export const MotionKitState = { debug: false };

export const attr = (el, name, fallback) => {
  const v = el.getAttribute('data-gt-' + name);
  return v === null || v === '' ? fallback : v;
};
export const num = (el, name, fallback) => {
  const v = parseFloat(attr(el, name, ''));
  return Number.isFinite(v) ? v : fallback;
};
export const bool = (el, name, fallback) => {
  const v = attr(el, name, null);
  if (v === null) return fallback;
  return !(v === 'false' || v === 'off' || v === '0');
};

export const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
// "2rem" | "32px" | 32  ->  px number
export const toPx = (v, fallback = 0) => {
  if (v === null || v === undefined || v === '') return fallback;
  const s = String(v).trim();
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return fallback;
  return s.endsWith('rem') ? n * remPx() : n;
};

// Elements that use a module: data-gt="a b c" matches "b".
export const all = (root, name) => Array.from(root.querySelectorAll(`[data-gt~="${name}"]`));

export const fromVec = (dir, dist) => {
  switch (dir) {
    case 'down': return { y: -dist };
    case 'left': return { x: dist };   // starts to the right, moves left
    case 'right': return { x: -dist };
    case 'fade': return {};
    default: return { y: dist };       // 'up'
  }
};

export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
