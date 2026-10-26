import { cfg } from '../core.js';

// Cross-document view transitions: CSS does the animation (gt-transitions.css).
// JS only records which variant to use for the next navigation (data-gt-transition on a link, or the site default).
export function transitions() {
  const root = document.documentElement;
  const set = (v) => {
    root.dataset.gtTransition = v;
    try { sessionStorage.setItem('gt-tv', v); } catch (e) {}
  };
  if (!root.dataset.gtTransition) set(cfg.transition);
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    set(a.getAttribute('data-gt-transition') || cfg.transition);
  });
}
