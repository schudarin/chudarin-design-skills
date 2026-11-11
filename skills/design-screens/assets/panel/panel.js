/* panel v1.0.0 — the prototype's review panel (design-screens › references/prototype.md › Panel). No dependencies, nothing from the project.
   The project keeps a copy of this folder and never edits it; changes go to the package, and the copy is replaced when the package's version is newer.
   A review page beside the prototype, served by serve.py so the page under review shares its address:
     <link rel="stylesheet" href="panel/panel.css"><script src="panel/panel.js"></script>
     <script>PANEL.mount({
       title: 'Checkout',
       paths: [{ id: 'buy', label: 'Buy one item', group: 'Checkout', start: 'v2/index.html#cart', steps: [
         ['Cart with one item'],                                        // the first step is where the path opens
         ['Pay', (T) => T.tap('button', 'Pay')],
         ['Card number', (T) => T.type('input[name=card]', '4242 4242 4242 4242')],
       ] }],
       presets: ['empty', 'heavy'],             // only when the user asks to compare data; none by default. The page reads ?preset=
       themes: ['light', 'dark'],               // optional; the page gets data-theme on <html> and ?theme=
       labels: { playStep: 'Проиграть шаг' },   // optional, over the English defaults below
       phone: 640,                              // optional, the product's phone breakpoint
       screens: { desktop: [1440, 900] },       // optional, over the default device sizes
     });</script>
   A step's action gets T: tap(selector, words?, { nth, nav }), type(selector, text), see(selector, words?, ms), has(selector, words?), open(url), wait(ms), doc(), slow. */
(function (root) {
  const VERSION = '1.0.0';
  const STOP = Symbol('stop');
  const LABELS = {
    panel: 'Prototype panel', collapse: 'Collapse', open: 'Panel', screen: 'Screen',
    phone: 'Phone', tablet: 'Tablet', desktop: 'Desktop', full: 'Whole window',
    playStep: 'Play from here', paths: 'Scenarios', steps: 'Steps',
    data: 'Data', theme: 'Theme', light: 'Light', dark: 'Dark',
    stepFailed: 'Step failed:', notFound: 'not found:', noLoad: 'the page did not load in 15 s', crossOrigin: 'The page is on another address: serve it from the panel\'s own.',
  };
  const SCREENS = { phone: [390, 844], tablet: [768, 1024], desktop: [1280, 800], full: [0, 0] };

  const core = {
    STOP,
    labels: (over) => ({ ...LABELS, ...over }),
    /* a frame is its device at life size: never grown, never shrunk for height (the page scrolls), shrunk only to the width there is */
    zoom: (room, width) => (width ? Math.min(1, +(room / width).toFixed(3)) : 1),
    view: (screen, phone) => (phone ? 'full' : screen),
    frameUrl(start, base, query) {
      const u = new URL(start, base);
      for (const [k, v] of Object.entries(query)) if (v) u.searchParams.set(k, v);
      return u.href;
    },
    /* the stored path and step, only while that path still exists */
    resume(paths, id, k) {
      const path = paths.find((p) => p.id === id);
      return path ? { path, step: Math.max(0, Math.min(Number(k) || 0, path.steps.length - 1)) } : { path: paths[0], step: 0 };
    },
    rows(paths, shut) { /* group headers and the path rows under them */
      const out = [];
      paths.forEach((p, i) => {
        const g = p.group;
        if (g && (i === 0 || paths[i - 1].group !== g)) out.push({ group: g, count: paths.filter((x) => x.group === g).length, open: !shut.has(g) });
        if (!g || !shut.has(g)) out.push({ path: p });
      });
      return out;
    },
    /* each start() makes the plays before it stale: their next wait rejects with STOP */
    runs() {
      let id = 0;
      return {
        start() {
          const me = ++id, live = () => me === id;
          return { live, wait: (ms) => new Promise((ok, no) => setTimeout(() => (live() ? ok() : no(STOP)), ms)) };
        },
      };
    },
    async walk(steps, to, T, { from = 0, gap, mark }) {
      for (let k = from; k <= to; k++) {
        await T.wait(k > from ? gap : 0);
        mark(k);
        if (steps[k][1]) await steps[k][1](T);
      }
    },
  };

  function mount(o) {
    const L = core.labels(o.labels), SCR = { ...SCREENS, ...o.screens }, paths = o.paths;
    const presets = o.presets || [], themes = o.themes || [];
    const $ = (s, r = document) => r.querySelector(s);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const store = {
      get: (k, d) => { try { return localStorage.getItem('panel:' + k) ?? d; } catch { return d; } },
      set: (k, v) => { try { localStorage.setItem('panel:' + k, v); } catch { /* private mode */ } },
    };
    const page = location.pathname, phone = matchMedia(`(max-width: ${(o.phone || 640) - 0.02}px)`);
    const name = (id) => `${L[id] || id}${SCR[id][0] ? ' ' + SCR[id][0] : ''}`;

    let scr = SCR[store.get('screen')] ? store.get('screen') : 'phone';
    let theme = themes.includes(store.get('theme')) ? store.get('theme') : themes[0];
    let preset = presets.includes(store.get('preset')) ? store.get('preset') : presets[0];
    let { path: cur, step } = core.resume(paths, store.get(page + ':path'), store.get(page + ':step'));
    let stepsOpen = store.get('steps') !== '0';
    let at = -1, touched = false; /* the step the page shows, and whether the person has touched the page since */
    const shut = new Set((() => { try { return JSON.parse(store.get('shut', '[]')); } catch { return []; } })());

    const CHEV = '<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';
    const PLAY = '<svg class="play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z"/></svg>'
      + '<svg class="spin" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5"/></svg>'; /* while the path plays: the spinner, the play on hover */
    const FLAG = '<span class="fin" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 14.5v-12"/><path class="cloth" d="M4 3h8.5l-2 3 2 3H4z"/></svg></span>'; /* the last step: where the path ends */
    const SICON = {
      phone: '<rect x="4.5" y="1.5" width="7" height="13" rx="1.6"/><path d="M7.2 12.4h1.6"/>',
      tablet: '<rect x="2.5" y="1.5" width="11" height="13" rx="1.6"/><path d="M7.2 12.4h1.6"/>',
      desktop: '<rect x="1.5" y="2.5" width="13" height="9" rx="1.4"/><path d="M5.5 14.5h5M8 11.5v3"/>',
      full: '<path d="M2 6V2.5c0-.3.2-.5.5-.5H6M10 2h3.5c.3 0 .5.2.5.5V6M14 10v3.5c0 .3-.2.5-.5.5H10M6 14H2.5a.5.5 0 0 1-.5-.5V10"/>',
    }; /* a screen with no icon of its own shows its name */
    const seg = (label, attr, list) => `<div class="pseg" role="group" aria-label="${esc(label)}">${list.map((v) => `<button type="button" ${attr}="${esc(v)}">${esc(L[v] || v)}</button>`).join('')}</div>`;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="pdesk"><div class="pstage"><small class="pcap"></small><div class="pdev"><iframe allow="clipboard-read; clipboard-write"></iframe></div></div></div>'
      + `<aside id="panel" aria-label="${esc(L.panel)}"><div class="ph"><b>${esc(o.title || '')}</b>`
      + `<button class="picon" type="button" data-a="close" aria-label="${esc(L.collapse)}" title="${esc(L.collapse)}">`
      + '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="2"/><path d="M10 2.5v11M5 6.5 6.5 8 5 9.5"/></svg></button></div>'
      + '<div class="pset">' /* how to look: screen, data, theme; then what to look at: the scenarios */
      + `<div class="fld pscr"><span class="fh">${esc(L.screen)}<span class="fv"></span></span><div class="pseg pico" role="group" aria-label="${esc(L.screen)}">`
      + Object.keys(SCR).map((v) => `<button type="button" data-s="${esc(v)}" aria-label="${esc(name(v))}" title="${esc(name(v))}">${SICON[v] ? `<svg viewBox="0 0 16 16" aria-hidden="true">${SICON[v]}</svg>` : esc(L[v] || v)}</button>`).join('') + '</div></div>'
      + (presets.length ? `<label class="fld"><span class="fh">${esc(L.data)}</span><select data-a="preset">${presets.map((v) => `<option value="${esc(v)}">${esc(L[v] || v)}</option>`).join('')}</select></label>` : '')
      + (themes.length > 1 ? `<div class="fld"><span class="fh">${esc(L.theme)}</span>${seg(L.theme, 'data-t', themes)}</div>` : '')
      + `</div><ol class="seq" aria-label="${esc(L.paths)}"></ol>`
      + '<p class="pnote" role="status"></p></aside><button id="popen" type="button"></button>');

    const panel = $('#panel'), frame = $('.pdev iframe'), stage = $('.pstage'), dev = $('.pdev'), cap = $('.pcap'), pill = $('#popen');
    const note = $('.pnote', panel);
    frame.title = o.title || L.panel;
    const doc = () => { try { return frame.contentDocument; } catch { return null; } };
    const say = (t) => { note.textContent = t || ''; if (t && phone.matches) document.body.classList.remove('pclosed'); };
    const tuck = () => { if (phone.matches) document.body.classList.add('pclosed'); }; /* a phone: the sheet goes away while a path plays */

    /* ---------- the frame ---------- */
    const view = () => core.view(scr, phone.matches);
    const fit = () => {
      stage.style.zoom = '';
      const desk = $('.pdesk'), cs = getComputedStyle(desk);
      stage.style.zoom = view() === 'full' ? '' : core.zoom(desk.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), stage.offsetWidth);
    };
    const caption = () => {
      const s = `${step + 1}/${cur.steps.length}`;
      cap.textContent = `${name(view())} · ${s} ${cur.steps[step][0]}`;
      pill.textContent = phone.matches ? `${L.open} ${s}` : L.open;
    };
    const size = () => {
      const v = view(), [w, h] = SCR[v];
      document.body.classList.toggle('pfull', v === 'full');
      document.body.classList.toggle('pphone', phone.matches);
      dev.style.width = w ? w + 'px' : '';
      dev.style.height = h ? h + 'px' : '';
      dev.classList.toggle('phone', v === 'phone');
      panel.querySelectorAll('[data-s]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === scr)));
      $('.fv', panel).textContent = name(scr);
      caption();
      fit();
    };
    const paint = () => {
      if (!theme) return;
      document.documentElement.dataset.theme = theme;
      const d = doc();
      if (d) d.documentElement.dataset.theme = theme;
      panel.querySelectorAll('[data-t]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === theme)));
    };

    /* ---------- paths and steps; the chosen step has its own play ---------- */
    /* groups are section labels; a path folds its steps, which hang on a guide line under it */
    const pathRow = (p) => {
      const on = p === cur, open = on && stepsOpen;
      return `<li class="path"><button type="button" data-path="${esc(p.id)}"${on ? ' aria-current="step"' : ''} aria-expanded="${open}">`
        + `${CHEV}<span class="t">${esc(p.label)}</span></button>`
        + (open ? `<ol class="steps" aria-label="${esc(L.steps)}">${p.steps.map((s, k) => `<li><button type="button" data-step="${k}"${k === step ? ' aria-current="true"' : ''}>`
          + `<span class="t">${esc(s[0])}</span></button>`
          + (k < p.steps.length - 1 ? `<button type="button" class="sp" data-play="${k}" aria-label="${esc(L.playStep)}">${PLAY}</button>` : FLAG) + '</li>').join('')}</ol>` : '')
        + '</li>';
    };
    const list = () => {
      const f = document.activeElement, key = panel.contains(f) && ['path', 'step', 'grp', 'play'].find((k) => f.dataset[k] !== undefined), val = key && f.dataset[key];
      $('.seq', panel).innerHTML = core.rows(paths, shut).map((r) => (r.group
        ? `<li class="grp-h"><button type="button" data-grp="${esc(r.group)}" aria-expanded="${r.open}"><span class="t">${esc(r.group)}</span><span class="c">${r.count}</span>${CHEV}</button></li>`
        : pathRow(r.path))).join('');
      if (key) [...panel.querySelectorAll(`[data-${key}]`)].find((b) => b.dataset[key] === val)?.focus(); /* the rebuilt list keeps the keyboard where it was */
    };
    const mark = (k) => {
      const f = document.activeElement, moving = panel.contains(f) && f.classList.contains('sp');
      step = k;
      store.set(page + ':step', k);
      panel.querySelectorAll('.steps [data-step]').forEach((b) => (Number(b.dataset.step) === k ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
      if (moving) { const b = $('.steps [aria-current=true]', panel); (b?.nextElementSibling?.matches('.sp') ? b.nextElementSibling : b)?.focus({ preventScroll: true }); } /* the play button moves with the step, and the keyboard with it */
      caption();
    };

    /* ---------- playing: what a person does in the page, quickly or at their pace ---------- */
    const runs = core.runs();
    const actions = (r, slow) => {
      const match = (sel, words, nth) => {
        const d = doc();
        if (!d || d.readyState === 'loading') return null;
        const all = [...d.querySelectorAll(sel)].filter((x) => !words || x.textContent.includes(words) || (x.getAttribute('aria-label') || '').includes(words));
        return nth === undefined ? all[0] : all.at(nth);
      };
      const alive = () => { if (!r.live()) throw STOP; }; /* a stopped play does nothing more, even between its waits */
      const find = async (sel, words, { ms = 10000, nth } = {}) => {
        for (let t = 0; t < ms; t += 100) {
          alive();
          const el = match(sel, words, nth);
          if (el) return el;
          await r.wait(100);
        }
        throw new Error(`${L.notFound} ${sel}${words ? ` «${words}»` : ''}`);
      };
      const loaded = () => new Promise((ok, no) => {
        const t = setTimeout(() => no(r.live() ? new Error(L.noLoad) : STOP), 15000);
        frame.addEventListener('load', () => { clearTimeout(t); ok(); }, { once: true });
      });
      /* slow: the person sees what gets pressed; a field shows its typing instead of a ring */
      const press = async (el, ring = true) => {
        el.scrollIntoView?.({ block: 'nearest', behavior: slow ? 'smooth' : 'auto' });
        if (!slow) return;
        await r.wait(600);
        if (!ring) return;
        const s = el.style, was = [s.outline, s.outlineOffset];
        s.outline = '3px solid #6d5dfc';
        s.outlineOffset = '2px';
        try { await r.wait(600); } finally { [s.outline, s.outlineOffset] = was; }
      };
      return {
        slow, doc, wait: r.wait,
        has: (sel, words) => !!match(sel, words),
        see: (sel, words, ms) => find(sel, words, { ms }),
        async tap(sel, words, opt = {}) {
          const el = await find(sel, words, opt);
          await press(el);
          const nav = opt.nav && loaded();
          el.click();
          if (nav) { await nav; alive(); }
        },
        async type(sel, value) {
          const el = await find(sel);
          await press(el, false);
          el.focus({ preventScroll: true });
          const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set; /* React-controlled fields hear only the native setter */
          const put = (v) => { if (set) set.call(el, v); else el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
          if (slow) for (let n = 1; n < value.length; n++) { put(value.slice(0, n)); await r.wait(70); }
          put(value);
          el.dispatchEvent(new Event('change', { bubbles: true }));
          if (slow) await r.wait(600);
        },
        async open(url) {
          const href = core.frameUrl(url, location.href, { preset, theme }), l = loaded(), same = doc()?.URL.split('#')[0] === href.split('#')[0];
          frame.src = href;
          if (same && href.includes('#')) frame.contentWindow.location.reload(); /* a change of the hash alone fires no load */
          await l;
          alive();
        },
      };
    };
    /* steps `from`..`to` of a path. The page plays on from what it shows when that is the step before `from` and nobody touched it;
       otherwise it opens fresh (the preset and theme) and runs quickly to the step before `from` */
    async function go(p, to, slow = false, from = 0) {
      const r = runs.start(), here = from > 0 && p === cur && at === from - 1 && !touched;
      const T = actions(r, slow);
      at = -1;
      say('');
      panel.classList.remove('pplaying');
      if (!here) {
        cur = p;
        store.set(page + ':path', p.id);
        list();
        mark(slow ? Math.max(0, from - 1) : to); /* the panel shows where the page is going, not the steps on the way */
        const kb = document.activeElement, keys = panel.contains(kb) && kb.matches(':focus-visible'); /* a field typed into on the way takes the focus; a keyboard user gets it back */
        dev.classList.add('pwait'); /* the steps on the way run hidden */
        try {
          await T.open(p.start);
          touched = false;
          if (!doc()) throw new Error(L.crossOrigin);
          await core.walk(p.steps, slow ? from - 1 : to, actions(r, false), { gap: 60, mark() {} });
          if (keys) kb.focus({ preventScroll: true });
        } finally {
          if (r.live()) dev.classList.remove('pwait');
        }
        if (!slow) { if (r.live()) at = to; return; }
        if (from) await r.wait(1000); /* time to see where it plays from */
      }
      panel.classList.add('pplaying');
      try {
        await core.walk(p.steps, to, T, { from, gap: 2400, mark }); /* time to read a step before the next one plays */
      } finally {
        if (r.live()) panel.classList.remove('pplaying');
      }
      if (r.live()) at = to;
    }
    const play = (...a) => go(...a).catch((e) => { if (e !== STOP) say(`${L.stepFailed} ${e.message}`); });

    /* ---------- controls ---------- */
    const touch = () => { touched = true; };
    frame.addEventListener('load', () => { paint(); const d = doc(); d?.addEventListener('pointerdown', touch, true); d?.addEventListener('keydown', touch, true); });
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.grp !== undefined) {
        const g = b.dataset.grp;
        if (shut.has(g)) shut.delete(g); else shut.add(g);
        store.set('shut', JSON.stringify([...shut]));
        return list();
      }
      if (b.dataset.path) {
        const p = paths.find((x) => x.id === b.dataset.path);
        if (p === cur && !phone.matches) { stepsOpen = !stepsOpen; store.set('steps', stepsOpen ? '1' : '0'); return list(); } /* the open path folds its steps */
        if (!stepsOpen) { stepsOpen = true; store.set('steps', '1'); }
        tuck();
        return phone.matches ? play(p, p.steps.length - 1, true) : play(p, 0); /* a phone: a tap plays the path from its start */
      }
      if (b.dataset.step) { tuck(); return play(cur, Number(b.dataset.step)); }
      if (b.dataset.play) { tuck(); return play(cur, cur.steps.length - 1, true, Number(b.dataset.play) + 1); }
      if (b.dataset.s) { scr = b.dataset.s; store.set('screen', scr); return size(); }
      if (b.dataset.t) { theme = b.dataset.t; store.set('theme', theme); return paint(); }
      const a = b.dataset.a;
      if (a === 'close') { document.body.classList.add('pclosed'); store.set('closed', '1'); fit(); pill.focus(); }
    });
    $('[data-a=preset]', panel)?.addEventListener('change', (e) => { preset = e.target.value; store.set('preset', preset); play(cur, step); });
    pill.addEventListener('click', () => { document.body.classList.remove('pclosed'); store.set('closed', ''); fit(); $('[data-a=close]', panel).focus(); });
    addEventListener('resize', fit);
    phone.addEventListener('change', size);

    if (store.get('closed')) document.body.classList.add('pclosed');
    if (preset) $('[data-a=preset]', panel).value = preset;
    size();
    paint();
    list();
    play(cur, step); /* back where the person left off */
    document.fonts?.ready.then(fit);
  }

  const PANEL = { version: VERSION, core, mount };
  if (typeof module === 'object' && module.exports) module.exports = PANEL;
  else root.PANEL = PANEL;
})(globalThis);
