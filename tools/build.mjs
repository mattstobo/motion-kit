import { build } from 'esbuild';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

await build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  outfile: 'dist/motion-kit.min.js',
});

// CSS: concatenate base + modules, minify via esbuild
const cssFiles = ['css/gt-base.css'];
const css = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
writeFileSync('dist/.tmp.css', css);
await build({ entryPoints: ['dist/.tmp.css'], minify: true, outfile: 'dist/motion-kit.min.css', allowOverwrite: true });
await build({ entryPoints: ['css/gt-transitions.css'], minify: true, outfile: 'dist/gt-transitions.min.css' });
copyFileSync('css/gt-transitions.css', 'dist/gt-transitions.css');
import('node:fs').then((fs) => fs.unlinkSync('dist/.tmp.css'));
console.log('built dist/');
