// Run: node --test skills/design-screens/assets/panel-tests/
// The tests live outside panel/, so a project copies that folder with no tests in it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const DIR = path.join(__dirname, '..', 'panel');
const PANEL = require(path.join(DIR, 'panel.js'));
const { core } = PANEL;

test('panel.js, panel.css and serve.py carry the same version in their first line', () => {
  for (const f of ['panel.js', 'panel.css', 'serve.py']) {
    const first = fs.readFileSync(path.join(DIR, f), 'utf8').split('\n')[0];
    assert.match(first, new RegExp(`panel v${PANEL.version.replace(/\./g, '\\.')} `), f);
  }
});

test('labels are English by default and a project replaces any of them', () => {
  assert.equal(core.labels().playStep, 'Play from here');
  const L = core.labels({ playStep: 'Проиграть шаг' });
  assert.equal(L.playStep, 'Проиграть шаг');
  assert.equal(L.collapse, 'Collapse');
});

test('a device frame is never grown and shrinks only to the width there is', () => {
  assert.equal(core.zoom(2000, 390), 1);
  assert.equal(core.zoom(300, 390), 0.769);
  assert.equal(core.zoom(300, 0), 1); // the whole window has no frame
});

test('a phone shows the page on the whole screen whatever screen was chosen', () => {
  assert.equal(core.view('tablet', true), 'full');
  assert.equal(core.view('tablet', false), 'tablet');
});

test('the frame opens a path start with the data preset and theme, keeping its hash', () => {
  const base = 'http://localhost:8000/checkout-v2/review.html';
  assert.equal(core.frameUrl('index.html#cart', base, { preset: 'heavy', theme: 'dark' }), 'http://localhost:8000/checkout-v2/index.html?preset=heavy&theme=dark#cart');
  assert.equal(core.frameUrl('index.html?a=1', base, {}), 'http://localhost:8000/checkout-v2/index.html?a=1');
});

test('paths are listed under their group, unnumbered; a folded group keeps only its header', () => {
  const paths = [{ id: 'a', group: 'Sign up' }, { id: 'b', group: 'Sign up' }, { id: 'c', group: 'Pay' }, { id: 'd' }];
  const show = (rows) => rows.map((r) => (r.group ? `[${r.group} ${r.count} ${r.open ? 'open' : 'shut'}]` : `${r.path.id}${r.n ?? ''}`)).join(' ');
  assert.equal(show(core.rows(paths, new Set())), '[Sign up 2 open] a b [Pay 1 open] c d');
  assert.equal(show(core.rows(paths, new Set(['Sign up']))), '[Sign up 2 shut] [Pay 1 open] c d');
});

test('the stored path and step come back only while the path exists', () => {
  const paths = [{ id: 'a', steps: [[1], [2], [3]] }, { id: 'b', steps: [[1], [2]] }];
  assert.deepEqual(core.resume(paths, 'b', '5'), { path: paths[1], step: 1 });
  assert.deepEqual(core.resume(paths, 'gone', '2'), { path: paths[0], step: 0 });
  assert.deepEqual(core.resume(paths, 'a', 'x'), { path: paths[0], step: 0 });
});

test('walk runs the steps up to the one asked, marking each before its action', async () => {
  const runs = core.runs();
  const log = [];
  const steps = [['Cart', () => log.push('do0')], ['Pay'], ['Card', () => log.push('do2')], ['Done', () => log.push('do3')]];
  const r = runs.start();
  await core.walk(steps, 2, { wait: r.wait }, { gap: 0, mark: (k) => log.push(`mark${k}`) });
  assert.deepEqual(log, ['mark0', 'do0', 'mark1', 'mark2', 'do2']);
});

test('walk from a step runs only the steps from there, with no pause before the first', async () => {
  const runs = core.runs();
  const log = [];
  const steps = [['Cart', () => log.push('do0')], ['Pay', () => log.push('do1')], ['Card', () => log.push('do2')]];
  const r = runs.start();
  const t0 = Date.now();
  await core.walk(steps, 2, { wait: r.wait }, { from: 2, gap: 500, mark: (k) => log.push(`mark${k}`) });
  assert.deepEqual(log, ['mark2', 'do2']);
  assert.ok(Date.now() - t0 < 400);
});

test('a new play stops the one running', async () => {
  const runs = core.runs();
  const log = [];
  const slow = [['A'], ['B', (T) => T.wait(30)], ['C', () => log.push('old C')]];
  const old = runs.start();
  const first = core.walk(slow, 2, { wait: old.wait }, { gap: 0, mark: () => {} });
  await new Promise((ok) => setTimeout(ok, 5));
  const fresh = runs.start();
  await assert.rejects(first, (e) => e === core.STOP);
  assert.equal(old.live(), false);
  assert.equal(fresh.live(), true);
  assert.deepEqual(log, []);
});
