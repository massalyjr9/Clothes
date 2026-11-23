// Imperative engine for the ring lookbook (spring ring, drag/fling, grid morph,
// FLIP focus view, receipt slip). Ported from the single-file original.
// mountLookbook(root, api) wires everything up and returns a cleanup function.
//   api.initialLook  0-8
//   api.isAdded(look, item) -> bool   (reads the shared bag)
//   api.add([{look, item, size}])     (writes to the shared bag)
//   api.toast(text)
import { LOOKS, pad, money, sumOf } from '../../data.js';

export function mountLookbook(root, api) {
  const N = LOOKS.length;
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const STEP = TAU / N;
  const wrapAngle = (a) => { a = mod(a + Math.PI, TAU) - Math.PI; return a === -Math.PI ? Math.PI : a; };
  const shortest = (target, from) => mod(target - from + 4.5, 9) - 4.5;
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $ = (id) => root.querySelector('#' + id);
  const deck = $('deck'), stage = $('stage'), crowd = $('crowd'), labelsEl = $('labels'), ringEl = $('loopRing');
  const follow = $('follow'), live = $('live');
  const now = $('now'), nowIdx = $('nowIdx'), nowName = $('nowName'), nowTotal = $('nowTotal'), autoBtn = $('auto');
  const pieces = $('pieces'), shopBtn = $('shop');
  const drawerBtn = $('drawerBtn'), drawer = $('drawer'), drawerList = $('drawerList'), drawerClose = $('drawerClose');
  const focusEl = $('focus'), focusStage = $('focusStage'), focusNum = $('focusNum'), focusName = $('focusName'), focusClose = $('focusClose');
  const slip = $('slip'), slipLook = $('slipLook'), lines = $('lines'), msg = $('msg');
  const sumSub = $('sumSub'), sumOff = $('sumOff'), sumTotal = $('sumTotal'), cta = $('cta');
  const vbtns = [...root.querySelectorAll('.deck__vbtn')];

  /* ---------- teardown bookkeeping ---------- */
  const offs = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const cancel = (t) => { clearTimeout(t); timers.delete(t); };
  let dead = false;

  /* ---------- state ---------- */
  const start = clamp(api.initialLook | 0, 0, N - 1);
  let W = 0, H = 0, mobile = false, bottomPad = 120, topPad = 136, modelH = 560, w = 320, dragPx = 120;
  let pos = reduced ? start : start - 1.15, goal = start, vel = 0, last = 0, raf = 0, dirty = true, moving = false;
  let visible = true, active = -1;
  let grid = false, focusOpen = false, drawerOpen = false, focusModel = null;
  let autoplay = !reduced, autoT = 0, slipHover = false;
  let down = false, dragging = false, pid = null, sx = 0, sy = 0, startGoal = 0, trail = [], dragEnd = 0;
  const cart = LOOKS.map((L, li) => L.items.map((it, k) => ({
    added: api.isAdded(li, k), size: it.sizes.length > 1 ? it.sizes[1] : it.sizes[0], touched: it.sizes.length === 1,
  })));

  /* ---------- build ---------- */
  const figInner = (L, first) =>
    `<span class="model__shadow" aria-hidden="true"></span>` +
    `<img class="model__pic" src="${L.img}" srcset="${L.small} 571w, ${L.img} 914w" sizes="(max-width: 809px) 240px, 360px" alt="${L.name}" draggable="false" decoding="async"${first ? ' fetchpriority="high"' : ''}>`;

  const bodies = LOOKS.map((L, i) => {
    const el = document.createElement('div');
    el.className = 'model';
    el.style.setProperty('--foot', L.foot);
    el.innerHTML = `<div class="model__fig">${figInner(L, i === start)}<button class="model__hit" type="button" tabindex="-1" data-i="${i}" aria-label="Look ${pad(L.n)}: ${L.name}"></button></div>`;
    crowd.appendChild(el);
    return { el, fig: el.firstElementChild, hit: el.querySelector('.model__hit'), op: '' };
  });

  drawerList.innerHTML = LOOKS.map((L, i) =>
    `<li style="--i:${i}"><button class="drawer__item" type="button" data-i="${i}" aria-current="false">` +
    `<span class="cap">${pad(L.n)}</span><span class="drawer__name">${L.name}</span>` +
    `<span class="drawer__meta cap">${L.items.length} pieces · ${money(sumOf(L))}</span></button></li>`).join('');
  const drawerItems = [...drawerList.querySelectorAll('.drawer__item')];

  labelsEl.innerHTML = LOOKS.map((L, i) => `<span class="deck__label cap" style="--i:${i}">${pad(L.n)}&nbsp;&nbsp;${L.name}</span>`).join('');
  const labelEls = [...labelsEl.children];

  /* ---------- QR (decorative, seeded) ---------- */
  (function drawQR() {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cells = [];
    [[0, 0], [18, 0], [0, 18]].forEach(([ox, oy]) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const border = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (border || core) cells.push([ox + x, oy + y]);
      }
    });
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
      if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue;
      if (rnd() > .52) cells.push([x, y]);
    }
    $('qr').innerHTML = `<path fill="currentColor" d="${cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}"/>`;
  })();

  /* ---------- measure / layout ---------- */
  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    mobile = innerWidth < 810;
    bottomPad = mobile ? 168 : 120; topPad = 136;
    modelH = Math.max(200, Math.round((H - bottomPad - 18 - topPad) / 1.12));
    stage.style.setProperty('--model-h', modelH + 'px');
    w = modelH * 4 / 7;
    dragPx = Math.max(mobile ? 90 : 120, W * 0.3);
    if (grid) layoutGrid();
    dirty = true; kick();
  }

  function place(b, x, y, s, op, blur, z) {
    const hw = w * s / 2;
    if (x + hw < -4 || x - hw > W + 4) op = 0;
    b.el.style.transform = `translate3d(${x.toFixed(1)}px,${(y - H).toFixed(1)}px,0) translateX(-50%) scale(${s.toFixed(4)})`;
    const o = op.toFixed(3);
    if (o !== b.op) {
      b.op = o;
      b.el.style.opacity = o;
      b.el.style.visibility = op < .01 ? 'hidden' : '';
      b.el.style.pointerEvents = op < .5 ? 'none' : '';
    }
    b.el.style.filter = blur > .05 ? `blur(${blur.toFixed(1)}px)` : 'none';
    b.el.style.zIndex = z;
  }

  function layoutRing() {
    if (grid) return;
    const cx = W * 0.5;
    const inner = H - topPad - bottomPad;
    const cy = topPad + inner * 0.5 + 6;
    const ry = inner * (mobile ? 0.34 : 0.37);
    const rx = Math.min(W * (mobile ? 0.30 : 0.28), ry * (mobile ? 1.15 : 1.7));
    const frontH = H * (mobile ? 0.19 : 0.255);
    const front = frontH / modelH;
    stage.style.setProperty('--loop-y', (cy - frontH * 0.5 - 6) + 'px');
    stage.style.setProperty('--ring-y', cy + 'px');
    ringEl.style.width = (2 * rx) + 'px';
    ringEl.style.height = (2 * ry) + 'px';
    bodies.forEach((b, i) => {
      const a = wrapAngle((i - pos) * STEP);
      const depth = (1 + Math.cos(a)) / 2;
      const near = clamp(1 - Math.abs(a) / STEP, 0, 1);
      const s = front * (0.5 + 0.5 * depth) * (1 + 0.14 * near);
      const x = cx + rx * Math.sin(a);
      const y = cy + ry * Math.cos(a) + modelH * s * 0.08;
      const blur = Math.max(0, (1 - depth) * 2.2 - 0.3);
      place(b, x, y, s, 1, blur, Math.round(depth * 1000) + 10);
    });
  }

  function layoutGrid() {
    const top = mobile ? 72 : 80;
    const rowH = (H - (mobile ? 104 : 96) - top) / 3;
    const colW = W / 3;
    const s = Math.min(rowH - 40, colW * 7 / 4 * 0.92) / modelH;
    bodies.forEach((b, i) => {
      const row = Math.floor(i / 3);
      const x = colW * (i % 3 + 0.5);
      const y = top + rowH * (row + 1) - 32;
      place(b, x, y, s, 1, 0, 10 + row);
      labelEls[i].style.transform = `translate3d(${x.toFixed(1)}px,${(y + 12).toFixed(1)}px,0) translateX(-50%)`;
    });
  }

  /* ---------- spring loop ---------- */
  const STIFF = 95, DAMP = 2 * Math.sqrt(95);
  function kick() { if (!raf && visible && !dead) raf = requestAnimationFrame(tick); }
  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(0.034, (t - last) / 1000) : 1 / 60;
    last = t;
    if (reduced) { pos = goal; vel = 0; }
    else {
      const h = dt / 3;
      for (let k = 0; k < 3; k++) {
        const acc = -STIFF * (pos - goal) - DAMP * vel;
        vel += acc * h; pos += vel * h;
      }
    }
    if (Math.abs(pos - goal) <= 5e-4 && Math.abs(vel) <= 5e-4) { pos = goal; vel = 0; moving = false; }
    else moving = true;
    if (moving || dirty || dragging) { layoutRing(); dirty = false; }
    deck.classList.toggle('is-moving', moving || dragging);
    if (moving || dragging) raf = requestAnimationFrame(tick);
    else last = 0;
  }

  /* ---------- active look ---------- */
  function setActive(i, quiet = false) {
    i = mod(i, N);
    if (i === active) return;
    active = i;
    const L = LOOKS[i];
    bodies.forEach((b, k) => { b.hit.tabIndex = k === i ? 0 : -1; });
    drawerItems.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
    labelEls.forEach((l, k) => l.classList.toggle('is-on', k === i));
    nowIdx.textContent = pad(L.n);
    nowName.textContent = L.name;
    if (!quiet) {
      live.textContent = `Look ${L.n}: ${L.name}`;
      if (!reduced) { restart(stage, 'is-glint'); restart(now, 'is-swap'); }
      if (focusOpen) closeFocus();
      history.replaceState(null, '', `#/vol-01?look=${L.n}`);
    }
    renderSlip();
    renderPieces(!quiet);
    schedAuto();
  }
  function goTo(g) { goal = g; setActive(mod(g, N)); kick(); }
  const next = () => goTo(Math.round(goal) + 1);
  const prev = () => goTo(Math.round(goal) - 1);
  const jumpTo = (i) => goTo(Math.round(goal) + shortest(i, active));

  /* ---------- autoplay ---------- */
  function schedAuto() {
    cancel(autoT);
    if (!autoplay) return;
    autoT = later(() => {
      if (visible && !dragging && !document.hidden && !slipHover && !focusOpen && !grid && !drawerOpen) next();
      else schedAuto();
    }, 5000);
  }
  function setAutoplay(v) {
    autoplay = v;
    deck.classList.toggle('is-playing', v);
    autoBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    schedAuto();
  }
  function stopAuto() { if (autoplay) setAutoplay(false); }
  on(autoBtn, 'click', () => setAutoplay(!autoplay));

  /* ---------- dock pieces ---------- */
  const thumb = (L, k) => `<span class="thumb" style="background-image:url('${L.sheet}');background-position:${k * 50}% ${L.row * 50}%"></span>`;
  function renderPieces(anim) {
    const L = LOOKS[active];
    pieces.innerHTML = L.items.map((it, k) =>
      `<li style="--i:${k + 1}"><button class="piece" type="button" data-p="${k + 1}" aria-label="${it.name}, ${money(it.price)}">` +
      `<span class="piece__img">${thumb(L, k)}</span>` +
      `<span class="piece__txt"><span class="piece__name">${it.name}</span><i class="piece__price">${money(it.price)}</i></span></button></li>`).join('');
    if (anim && !reduced) restart(pieces, 'is-in');
    else pieces.classList.remove('is-in');
  }
  on(pieces, 'click', (e) => {
    const b = e.target.closest('.piece');
    if (!b) return;
    const p = +b.dataset.p;
    openFocus();
    setHot(p, true);
    later(() => { const t = focusOpen && focusModel && focusModel.querySelector('.tag.is-hot'); if (t) fitTip(t); }, reduced ? 0 : 1000);
  });
  on(shopBtn, 'click', () => openFocus());

  /* ---------- slip ---------- */
  function renderSlip() {
    const L = LOOKS[active], C = cart[active];
    slipLook.textContent = `Look ${pad(L.n)} — ${L.name}`;
    lines.innerHTML = L.items.map((it, k) => {
      const c = C[k];
      return `<li class="line${c.added ? ' is-added' : ''}" data-p="${k + 1}">` +
        `<span class="line__name">${it.name}</span><span class="line__price">${money(it.price)}</span>` +
        `<span class="line__kind cap">${it.kind}</span>` +
        `<button class="line__add" type="button" aria-expanded="false" aria-label="${c.added ? 'In bag' : 'Add to bag'}: ${it.name}"></button>` +
        `<div class="pick" hidden><div class="pick__sizes" role="group" aria-label="Size">` +
        it.sizes.map((s) => `<button class="size" type="button" data-s="${s}" aria-pressed="${s === c.size}">${s}</button>`).join('') +
        `</div><button class="pick__ok" type="button">Add to bag</button></div></li>`;
    }).join('');
    const sub = sumOf(L);
    sumSub.textContent = money(sub);
    sumOff.textContent = '−' + money(sub * .1);
    sumTotal.textContent = money(sub * .9);
    setMsg('');
    updComplete();
  }
  const lineEl = (k) => lines.querySelector(`.line[data-p="${k + 1}"]`);
  function setMsg(t) { msg.textContent = t; msg.hidden = !t; }
  function updComplete() { slip.classList.toggle('is-complete', cart[active].every((c) => c.added)); }
  function setPick(k, open) {
    const li = lineEl(k);
    li.classList.toggle('is-picking', open);
    li.querySelector('.line__add').setAttribute('aria-expanded', open ? 'true' : 'false');
    li.querySelector('.pick').hidden = !open;
  }
  function addToBag(ks) {
    const L = LOOKS[active], C = cart[active];
    ks.forEach((k) => {
      C[k].added = true;
      const li = lineEl(k);
      li.classList.add('is-added');
      setPick(k, false);
      li.querySelector('.line__add').setAttribute('aria-label', `In bag: ${L.items[k].name}`);
    });
    api.add(ks.map((k) => ({ look: active, item: k, size: C[k].size })));
    api.toast(ks.length > 1 ? 'Fit added to your bag.' : 'Item added to your bag.');
    updComplete();
  }
  on(lines, 'click', (e) => {
    const li = e.target.closest('.line');
    if (!li) return;
    stopAuto();
    const k = +li.dataset.p - 1, C = cart[active][k], it = LOOKS[active].items[k];
    if (e.target.closest('.line__add')) {
      if (C.added) return;
      if (it.sizes.length === 1) addToBag([k]);
      else setPick(k, !li.classList.contains('is-picking'));
    } else if (e.target.closest('.size')) {
      const s = e.target.closest('.size').dataset.s;
      C.size = s; C.touched = true;
      li.querySelectorAll('.size').forEach((b) => b.setAttribute('aria-pressed', b.dataset.s === s ? 'true' : 'false'));
    } else if (e.target.closest('.pick__ok')) {
      C.touched = true;
      addToBag([k]);
      if (cart[active].every((c) => c.added)) setMsg('');
    }
  });
  on(lines, 'pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const li = e.target.closest('.line');
    if (li) setHot(+li.dataset.p, false);
  });
  on(lines, 'pointerleave', () => setHot(0));
  on(cta, 'click', () => {
    const L = LOOKS[active], C = cart[active];
    if (C.every((c) => c.added)) return;
    stopAuto();
    const pend = C.map((c, k) => k).filter((k) => !C[k].added);
    const ready = pend.filter((k) => C[k].touched);
    const need = pend.filter((k) => !C[k].touched);
    if (ready.length) addToBag(ready);
    if (need.length) {
      (mobile ? need.slice(0, 1) : need).forEach((k) => setPick(k, true));
      setMsg('Choose size for: ' + need.map((k) => L.items[k].name).join(', '));
    } else setMsg('');
  });
  on(slip, 'pointerenter', (e) => { if (e.pointerType === 'mouse') slipHover = true; });
  on(slip, 'pointerleave', () => { slipHover = false; });

  /* ---------- focus ---------- */
  function tagsHTML(L) {
    return L.tags.map(([x, y], k) => {
      const it = L.items[k];
      return `<button class="tag" type="button" data-p="${k + 1}" style="left:${x}%;top:${y}%;--pi:${k + 1}" aria-label="${pad(k + 1)}: ${it.name}, ${money(it.price)}">` +
        `<span class="dotnum">${pad(k + 1)}</span><span class="tag__tip"><b>${it.name}</b><span>${money(it.price)}</span></span></button>`;
    }).join('');
  }
  function flipFrom(fm, src) {
    const s = src.getBoundingClientRect(), d = fm.getBoundingClientRect();
    return `translate3d(${s.left - d.left}px,${s.bottom - d.bottom}px,0) scale(${s.height / d.height})`;
  }
  function openFocus() {
    if (focusOpen) return;
    stopAuto();
    setHot(0);
    if (drawerOpen) setDrawer(false);
    const L = LOOKS[active];
    const src = bodies[mod(Math.round(goal), N)].fig;
    focusNum.textContent = pad(L.n) + '.';
    focusName.textContent = L.name;
    const rect = focusStage.getBoundingClientRect();
    const h = Math.max(160, Math.min(rect.height, rect.width / (4 / 7)));
    const fm = document.createElement('div');
    fm.className = 'focus__model';
    fm.style.setProperty('--model-h', h + 'px');
    fm.style.setProperty('--foot', L.foot);
    fm.innerHTML = `<div class="model__fig">${figInner(L, false)}<div class="tags">${tagsHTML(L)}</div></div>`;
    focusStage.appendChild(fm);
    focusModel = fm;
    focusOpen = true;
    deck.classList.add('is-focus');
    focusEl.setAttribute('aria-hidden', 'false');
    slip.setAttribute('aria-hidden', 'false');
    follow && follow.classList.remove('is-view', 'is-link');
    if (!reduced) {
      fm.style.transition = 'none';
      fm.style.transform = flipFrom(fm, src);
      void fm.offsetWidth;
      fm.style.transition = '';
      fm.style.transform = '';
    }
    focusClose.focus({ preventScroll: true });
  }
  function closeFocus() {
    if (!focusOpen) return;
    const fm = focusModel;
    if (!reduced && fm) {
      const cur = getComputedStyle(fm).transform;
      fm.style.transition = 'none';
      fm.style.transform = 'none';
      const target = flipFrom(fm, bodies[mod(Math.round(goal), N)].fig);
      fm.style.transform = cur;
      void fm.offsetWidth;
      fm.style.transition = '';
      fm.style.transform = target;
    }
    focusOpen = false;
    focusModel = null;
    deck.classList.remove('is-focus');
    focusEl.setAttribute('aria-hidden', 'true');
    slip.setAttribute('aria-hidden', 'true');
    setHot(0);
    if (fm) later(() => fm.remove(), reduced ? 0 : 950);
    const ae = document.activeElement;
    if (ae && (focusEl.contains(ae) || slip.contains(ae))) stage.focus({ preventScroll: true });
  }
  on(focusClose, 'click', closeFocus);
  on(focusStage, 'click', (e) => {
    const tag = e.target.closest('.tag');
    if (tag) { setHot(+tag.dataset.p, true); return; }
    if (!e.target.closest('.model__fig')) closeFocus();
  });
  on(focusStage, 'pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const tag = e.target.closest('.tag');
    if (tag) setHot(+tag.dataset.p, false);
  });
  on(focusStage, 'focusin', (e) => {
    const tag = e.target.closest('.tag');
    if (tag) setHot(+tag.dataset.p, false);
  });

  function fitTip(tag) {
    tag.classList.remove('is-flip', 'is-below');
    tag.style.removeProperty('--dx');
    const tip = tag.querySelector('.tag__tip');
    const tw = tip.offsetWidth;
    const t = tag.getBoundingClientRect(), s = focusStage.getBoundingClientRect();
    if (t.right + tw <= s.right - 8) return;
    if (t.left - tw >= s.left + 8) { tag.classList.add('is-flip'); return; }
    tag.classList.add('is-below');
    const half = Math.min(tip.offsetWidth, s.width - 16) / 2;
    const c = t.left + t.width / 2;
    const cc = clamp(c, s.left + 8 + half, s.right - 8 - half);
    tag.style.setProperty('--dx', (cc - c).toFixed(1) + 'px');
  }
  function setHot(p, scroll) {
    deck.querySelectorAll('.tag.is-hot, .line.is-hot').forEach((el) => el.classList.remove('is-hot'));
    if (!p) return;
    const tag = focusOpen && focusModel && focusModel.querySelector(`.tag[data-p="${p}"]`);
    if (tag) { fitTip(tag); tag.classList.add('is-hot'); }
    const li = lines.querySelector(`.line[data-p="${p}"]`);
    if (li) {
      li.classList.add('is-hot');
      if (scroll) li.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }
  }

  /* ---------- grid ---------- */
  let animT = 0;
  function setGrid(v) {
    if (v === grid || focusOpen) return;
    stopAuto();
    bodies.forEach((b, i) => {
      const ringIdx = Math.round(Math.abs(wrapAngle((i - pos) * STEP)) / Math.PI * 4);
      b.el.style.setProperty('--d', (ringIdx * (v ? 0.32 : 0.24)) + 's');
    });
    deck.classList.add('is-anim');
    cancel(animT);
    animT = later(() => deck.classList.remove('is-anim'), reduced ? 0 : 1700);
    grid = v;
    deck.classList.toggle('is-grid', v);
    vbtns.forEach((b) => b.setAttribute('aria-pressed', (b.dataset.v === 'grid') === v ? 'true' : 'false'));
    stage.setAttribute('aria-roledescription', v ? 'grid of looks' : 'carousel');
    if (v) layoutGrid();
    else { bodies.forEach((b) => { b.op = ''; }); dirty = true; layoutRing(); }
  }
  vbtns.forEach((b) => on(b, 'click', () => setGrid(b.dataset.v === 'grid')));

  /* ---------- drawer ---------- */
  function setDrawer(open) {
    drawerOpen = open;
    deck.classList.toggle('is-drawer', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      stopAuto();
      if (focusOpen) closeFocus();
      drawerItems[active].focus({ preventScroll: true });
    } else if (drawer.contains(document.activeElement)) drawerBtn.focus({ preventScroll: true });
  }
  on(drawerBtn, 'click', () => setDrawer(!drawerOpen));
  on(drawerClose, 'click', () => setDrawer(false));
  on(drawerList, 'click', (e) => {
    const b = e.target.closest('.drawer__item');
    if (!b) return;
    jumpTo(+b.dataset.i);
    setDrawer(false);
  });

  /* ---------- follow cursor ---------- */
  let fx = 0, fy = 0, tx = 0, ty = 0, fRaf = 0;
  const fApply = () => { follow.style.transform = `translate3d(${fx.toFixed(1)}px,${fy.toFixed(1)}px,0)`; };
  function fStep() {
    if (dead) return;
    const k = reduced ? 1 : 0.18;
    fx += (tx - fx) * k; fy += (ty - fy) * k;
    if (Math.hypot(tx - fx, ty - fy) < 0.4) { fx = tx; fy = ty; fApply(); fRaf = 0; return; }
    fApply();
    fRaf = requestAnimationFrame(fStep);
  }
  function followMove(e) {
    if (!fine || e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!follow.classList.contains('is-on')) { fx = tx; fy = ty; fApply(); follow.classList.add('is-on'); }
    const hit = e.target.closest && e.target.closest('.model__hit');
    let view = false, link = false;
    if (hit && !dragging && !focusOpen) {
      const i = +hit.dataset.i;
      if (grid || shortest(i, mod(Math.round(goal), N)) === 0) view = true; else link = true;
    }
    follow.classList.toggle('is-view', view);
    follow.classList.toggle('is-link', link);
    follow.classList.toggle('is-pin', focusOpen && !!(e.target.closest && e.target.closest('.tag,.focus__close')));
    if (!fRaf) fRaf = requestAnimationFrame(fStep);
  }
  if (fine) {
    deck.classList.add('has-follow');
    on(focusEl, 'pointermove', followMove);
    on(stage, 'pointerleave', () => follow.classList.remove('is-on', 'is-view', 'is-link'));
  } else follow.remove();

  /* ---------- drag / fling ---------- */
  on(stage, 'pointerdown', (e) => {
    if (focusOpen || grid || (e.pointerType === 'mouse' && e.button !== 0)) return;
    down = true; dragging = false; pid = e.pointerId;
    sx = e.clientX; sy = e.clientY; startGoal = goal;
    trail = [{ x: e.clientX, t: performance.now() }];
  });
  on(stage, 'pointermove', (e) => {
    followMove(e);
    if (!down || e.pointerId !== pid) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { release(e); return; }
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { down = false; return; }
      if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
        dragging = true;
        deck.classList.add('is-dragging');
        try { stage.setPointerCapture(pid); } catch { /* pointer already gone */ }
        stopAuto();
        if (follow) follow.classList.remove('is-view', 'is-link');
      } else return;
    }
    trail.push({ x: e.clientX, t: performance.now() });
    if (trail.length > 6) trail.shift();
    goal = startGoal - dx / dragPx;
    setActive(mod(Math.round(goal), N));
    kick();
  });
  function release(e) {
    if (e && e.pointerId !== pid) return;
    if (!down) return;
    down = false;
    if (!dragging) return;
    dragging = false;
    deck.classList.remove('is-dragging');
    const a = trail[0], z = trail[trail.length - 1];
    const v = z.t > a.t ? (z.x - a.x) / (z.t - a.t) : 0;
    const base = Math.round(startGoal);
    const dx = (e ? e.clientX : z.x) - sx;
    let target;
    if (mobile) {
      target = (Math.abs(dx) > 30 || Math.abs(v) > 0.3) ? base + (dx < 0 ? 1 : -1) : base;
    } else {
      target = Math.round(goal - v * 160 / dragPx);
      if (target === base && Math.abs(v) > 0.3) target = base + (v < 0 ? 1 : -1);
      target = clamp(target, base - 2, base + 2);
    }
    goTo(target);
    dragEnd = performance.now();
    kick();
  }
  on(stage, 'pointerup', release);
  on(stage, 'pointercancel', release);

  on(stage, 'click', (e) => {
    if (performance.now() - dragEnd < 60) return;
    const hit = e.target.closest('.model__hit');
    if (!hit) return;
    const i = +hit.dataset.i;
    if (grid) { goal = pos = i; vel = 0; setActive(i); openFocus(); return; }
    const d = shortest(i, Math.round(goal));
    if (d === 0) openFocus();
    else { stopAuto(); goTo(Math.round(goal) + d); }
  });

  let wsum = 0, wlock = false;
  on(stage, 'wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || focusOpen || grid) return;
    e.preventDefault();
    if (wlock) return;
    wsum += e.deltaX;
    if (Math.abs(wsum) > 45) {
      stopAuto();
      if (wsum > 0) next(); else prev();
      wsum = 0; wlock = true;
      later(() => { wlock = false; }, 520);
    }
  }, { passive: false });

  on(stage, 'keydown', (e) => {
    if (focusOpen) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); prev(); }
    else if (grid && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault(); stopAuto(); jumpTo(mod(active + (e.key === 'ArrowDown' ? 3 : -3), N));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (grid) { goal = pos = active; vel = 0; }
      openFocus();
    }
  });
  on(document, 'keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (focusOpen) closeFocus();
    else if (drawerOpen) setDrawer(false);
  });

  /* ---------- observers ---------- */
  const ro = new ResizeObserver(measure);
  ro.observe(stage);
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) kick();
  });
  io.observe(stage);
  on(document, 'visibilitychange', () => { if (!document.hidden) { kick(); schedAuto(); } });

  /* ---------- boot ---------- */
  nowTotal.textContent = pad(N);
  measure();
  setActive(start, true);
  setAutoplay(autoplay);
  kick();

  return () => {
    dead = true;
    offs.forEach((f) => f());
    timers.forEach((t) => clearTimeout(t));
    cancelAnimationFrame(raf);
    cancelAnimationFrame(fRaf);
    ro.disconnect();
    io.disconnect();
  };
}
