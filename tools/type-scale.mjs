// Fluid type scale generator. One config -> CSS variables + Webflow size variables (JSON).
// Usage: node tools/type-scale.mjs [--json]
const config = {
  minViewport: 20,   // rem (320px)
  maxViewport: 90,   // rem (1440px)
  min: { base: 1, ratio: 1.2 },    // rem at min viewport
  max: { base: 1.125, ratio: 1.25 } // rem at max viewport
};
// step exponent per token
const steps = {
  'text-tiny': -2, 'text-small': -1, 'text-regular': 0, 'text-medium': 1, 'text-large': 2,
  'heading-h6': 1, 'heading-h5': 2, 'heading-h4': 3, 'heading-h3': 4, 'heading-h2': 5, 'heading-h1': 6, 'heading-display': 7,
};
const r = (n) => Math.round(n * 1000) / 1000;
const out = Object.entries(steps).map(([name, s]) => {
  const lo = r(config.min.base * config.min.ratio ** s);
  const hi = r(config.max.base * config.max.ratio ** s);
  const slope = Math.round(((hi - lo) / (config.maxViewport - config.minViewport)) * 1e5) / 1e5;
  const value = `clamp(${lo}rem, calc(${lo}rem + ${slope} * (100vw - ${config.minViewport}rem)), ${hi}rem)`;
  return { name, lo, hi, value };
});
if (process.argv.includes('--json')) console.log(JSON.stringify(out.map(({ name, value }) => ({ name: 'gt-' + name, value })), null, 2));
else console.log(':root{\n' + out.map((o) => `  --gt-${o.name}: ${o.value};`).join('\n') + '\n}');
