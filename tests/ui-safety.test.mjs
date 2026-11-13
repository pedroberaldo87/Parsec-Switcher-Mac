// Static checks for the front end (run with: node --test tests/).
// They guard the fixes for the security review: no HTML built from account
// nicknames, no remote scripts/styles/fonts, and a CSP with no external origin.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const appJs = ['control.js', 'elements.js', 'template.js', 'utils.js'];

test('app scripts never build HTML from strings', () => {
  for (const f of appJs) {
    const src = read(`gui/${f}`);
    assert.doesNotMatch(src, /\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(/, `${f} uses an HTML sink`);
  }
});

test('no remote http(s) URL is loaded by index.html or style.css', () => {
  for (const f of ['index.html', 'style.css']) {
    assert.doesNotMatch(read(`gui/${f}`), /https?:\/\//, `${f} references a remote URL`);
  }
});

test('index.html has no inline script and every local asset it references exists', () => {
  const html = read('gui/index.html');
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, 'inline <script>');
  for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    assert.doesNotMatch(m[1], /^[a-z]+:/i, `external reference ${m[1]}`);
    assert.ok(statSync(join(root, 'gui', m[1])).isFile(), `${m[1]} is missing`);
  }
});

test('vendored CSS references only files that exist', () => {
  for (const css of ['gui/vendor/fonts/fonts.css']) {
    for (const m of read(css).matchAll(/url\(([^)]+)\)/g)) {
      assert.ok(statSync(join(root, dirname(css), m[1])).isFile(), `${m[1]} is missing`);
    }
  }
  // Font Awesome lists .ttf fallbacks that are intentionally not shipped; woff2 must exist.
  for (const m of read('gui/vendor/fontawesome/css/all.min.css').matchAll(/url\(([^)]+\.woff2)\)/g)) {
    assert.ok(statSync(join(root, 'gui/vendor/fontawesome/css', m[1])).isFile(), `${m[1]} is missing`);
  }
});

test('CSP allows no external origin and no inline script', () => {
  const conf = JSON.parse(read('src-tauri/tauri.conf.json'));
  const csp = conf.app.security.csp;
  // http://ipc.localhost is Tauri's own IPC endpoint, not an external origin.
  assert.doesNotMatch(csp.replace('http://ipc.localhost', ''), /https?:\/\//, 'CSP lists an external origin');
  const scriptSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src'));
  assert.ok(scriptSrc, 'script-src missing');
  assert.doesNotMatch(scriptSrc, /unsafe-inline|unsafe-eval/);
});

test('bundle icons all exist', () => {
  const conf = JSON.parse(read('src-tauri/tauri.conf.json'));
  for (const icon of conf.bundle.icon) {
    assert.ok(statSync(join(root, 'src-tauri', icon)).isFile(), `${icon} is missing`);
  }
});

test('getInitials handles odd names', () => {
  const ctx = {};
  vm.runInNewContext(read('gui/utils.js') + '\nthis.getInitials = getInitials;', ctx);
  assert.equal(ctx.getInitials('minha conta'), 'MC');
  assert.equal(ctx.getInitials('  a   b '), 'AB');
  assert.equal(ctx.getInitials('<img src=x onerror=alert(1)>'), '<SO');
});
