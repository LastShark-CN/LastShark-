/* ============================================================
   LastShark 博客 · 内置小游戏「方块矿工」
   Canvas 像素玩法：接矿石得分、躲 TNT 掉血、吃爱心回血。
   支持键盘、屏幕方向键与画布拖动；最高分存本地。
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('game-canvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var B = window.BLOG || { toast: function () {} };
  var reduce = B.reduce;
  var W = 200, H = 280;
  ctx.imageSmoothingEnabled = false;

  var scoreEl = document.getElementById('hud-score');
  var bestEl = document.getElementById('hud-best');
  var livesEl = document.getElementById('hud-lives');
  var toggleBtn = document.getElementById('game-toggle');
  var BEST_KEY = 'lastshark-miner-best';

  var best = 0;
  try { best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (err) { best = 0; }

  var S = {
    running: false, over: false, score: 0, lives: 3, t: 0, spawnT: 0,
    items: [], parts: [], stars: [], px: W / 2, ptarget: null, flash: 0, shake: 0
  };
  for (var i = 0; i < 26; i++) {
    S.stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() < 0.3 ? 2 : 1, p: 0.3 + Math.random() * 0.9 });
  }

  var keys = { l: false, r: false };

  /* SECTION: hud */
  function syncHud() {
    if (scoreEl) scoreEl.textContent = String(S.score);
    if (bestEl) bestEl.textContent = String(best);
    if (livesEl) livesEl.textContent = String(Math.max(0, S.lives));
  }
  function reset() {
    S.score = 0; S.lives = 3; S.t = 0; S.spawnT = 0;
    S.items.length = 0; S.parts.length = 0;
    S.px = W / 2; S.ptarget = null; S.over = false; S.flash = 0; S.shake = 0;
    syncHud();
  }

  /* SECTION: entities */
  function spawn() {
    var r = Math.random(), type = 'gem';
    if (r > 0.955) type = 'heart';
    else if (r > 0.78) type = 'tnt';
    else if (r > 0.58) type = 'gold';
    S.items.push({
      x: 8 + Math.random() * (W - 16), y: -10, type: type,
      vy: (type === 'tnt' ? 46 : 38) + Math.min(52, S.t * 1.5),
      rot: 0, vr: (Math.random() - 0.5) * 3
    });
  }
  function burst(x, y, c, n) {
    for (var i = 0; i < (n || 10); i++) {
      S.parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 80 - 10, l: 0.5 + Math.random() * 0.4, c: c });
    }
  }
  function collect(it) {
    if (it.type === 'tnt') {
      S.lives--; S.flash = 0.42; S.shake = 7;
      burst(it.x, it.y, '#ff5b3d', 16);
      if (S.lives <= 0) {
        S.over = true; S.running = false;
        if (S.score > best) { best = S.score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (err) {} }
        if (toggleBtn) toggleBtn.textContent = '再来一局';
        syncHud();
      }
    } else if (it.type === 'heart') {
      S.lives = Math.min(5, S.lives + 1);
      burst(it.x, it.y, '#ff8fc0', 14); S.flash = 0.14;
    } else {
      S.score += it.type === 'gold' ? 30 : 10;
      burst(it.x, it.y, it.type === 'gold' ? '#ffd166' : '#7ee08a', 10);
      if (S.score > best) { best = S.score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (err) {} }
    }
    syncHud();
  }

  /* SECTION: update */
  function update(dt) {
    S.t += dt;
    if (S.flash > 0) S.flash -= dt;
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 22);
    S.stars.forEach(function (s) { s.y += s.p * 8 * dt; if (s.y > H) { s.y = -2; s.x = Math.random() * W; } });
    S.parts.forEach(function (p) { p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; });
    S.parts = S.parts.filter(function (p) { return p.l > 0; });
    if (!S.running) return;

    var speed = 112 + Math.min(58, S.t * 1.6);
    if (S.ptarget !== null) {
      var d = S.ptarget - S.px;
      S.px += Math.max(-speed * 1.5 * dt, Math.min(speed * 1.5 * dt, d));
      if (Math.abs(d) < 1.5) S.ptarget = null;
    } else {
      if (keys.l) S.px -= speed * dt;
      if (keys.r) S.px += speed * dt;
    }
    S.px = Math.max(9, Math.min(W - 9, S.px));

    S.spawnT -= dt;
    if (S.spawnT <= 0) { spawn(); S.spawnT = Math.max(0.30, 0.92 - S.t * 0.012); }

    var py = H - 26;
    S.items.forEach(function (it) { it.y += it.vy * dt; it.rot += it.vr * dt; });
    for (var k = S.items.length - 1; k >= 0; k--) {
      var it = S.items[k];
      if (Math.abs(it.y - py) < 11 && Math.abs(it.x - S.px) < 13) { collect(it); S.items.splice(k, 1); continue; }
      if (it.y > H + 12) {
        if (it.type !== 'tnt' && S.running) { S.score = Math.max(0, S.score - 2); syncHud(); }
        S.items.splice(k, 1);
      }
    }
  }

  /* SECTION: draw */
  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }
  function drawPlayer(x, y) {
    px(x - 6, y - 14, 12, 6, '#e8b98a');
    px(x - 6, y - 15, 12, 2, '#4a3524');
    px(x - 4, y - 12, 2, 2, '#2a2f3a'); px(x + 2, y - 12, 2, 2, '#2a2f3a');
    px(x - 7, y - 8, 14, 8, '#3fbf8f');
    px(x - 7, y - 8, 14, 2, '#5fe0ac');
    px(x - 9, y - 7, 2, 6, '#e8b98a'); px(x + 7, y - 7, 2, 6, '#e8b98a');
    px(x - 6, y, 5, 5, '#3a4a8f'); px(x + 1, y, 5, 5, '#3a4a8f');
    px(x - 6, y + 4, 5, 2, '#2a2f3a'); px(x + 1, y + 4, 5, 2, '#2a2f3a');
  }
  function drawItem(it) {
    var x = it.x, y = it.y;
    if (it.type === 'gem') {
      px(x - 4, y - 4, 8, 8, '#4fd07a'); px(x - 3, y - 3, 3, 3, '#a7f5bd'); px(x - 4, y + 3, 8, 2, '#2b8a4c');
    } else if (it.type === 'gold') {
      px(x - 4, y - 4, 8, 8, '#ffcf5c'); px(x - 3, y - 3, 3, 3, '#fff0b8'); px(x - 4, y + 3, 8, 2, '#c08a1e');
    } else if (it.type === 'heart') {
      px(x - 5, y - 3, 4, 4, '#ff8fc0'); px(x + 1, y - 3, 4, 4, '#ff8fc0');
      px(x - 5, y + 1, 10, 3, '#ff8fc0'); px(x - 3, y + 4, 6, 2, '#e86aa0');
    } else {
      px(x - 5, y - 5, 10, 10, '#c9402c'); px(x - 4, y - 4, 8, 8, '#e8563f');
      px(x - 5, y - 1, 10, 2, '#2a2f3a'); px(x - 1, y - 5, 2, 10, '#2a2f3a');
      px(x - 3, y - 3, 2, 2, '#ffd166'); px(x + 1, y + 1, 2, 2, '#ffd166');
    }
  }
  function draw() {
    var sx = S.shake > 0 ? (Math.random() - 0.5) * S.shake : 0;
    var sy = S.shake > 0 ? (Math.random() - 0.5) * S.shake : 0;
    ctx.save();
    ctx.translate(sx, sy);
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1020'); g.addColorStop(0.62, '#131a2c'); g.addColorStop(1, '#1c2334');
    ctx.fillStyle = g; ctx.fillRect(-8, -8, W + 16, H + 16);
    S.stars.forEach(function (s) { px(s.x, s.y, s.s, s.s, 'rgba(255,255,255,' + (s.s > 1 ? 0.5 : 0.28) + ')'); });
    for (var i = 0; i < W; i += 10) {
      px(i, H - 14, 9, 6, '#4f9b4a'); px(i, H - 8, 9, 8, '#6b4a2e');
      px(i, H - 14, 9, 2, '#6fc463'); px(i + 2, H - 6, 3, 3, '#54391f');
    }
    S.items.forEach(drawItem);
    drawPlayer(S.px, H - 26);
    S.parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.l * 2.2));
      px(p.x, p.y, 2, 2, p.c);
    });
    ctx.globalAlpha = 1;
    if (S.flash > 0) {
      ctx.fillStyle = 'rgba(255,90,60,' + Math.min(0.5, S.flash).toFixed(3) + ')';
      ctx.fillRect(-8, -8, W + 16, H + 16);
    }
    if (!S.running) {
      ctx.fillStyle = 'rgba(4,6,12,.66)'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd08a'; ctx.font = 'bold 15px ui-monospace,monospace';
      ctx.fillText(S.over ? '游戏结束' : '方块矿工', W / 2, H / 2 - 18);
      ctx.fillStyle = '#c9d4e2'; ctx.font = '10px ui-monospace,monospace';
      if (S.over) {
        ctx.fillText('得分 ' + S.score + '   最高 ' + best, W / 2, H / 2 + 2);
        ctx.fillStyle = '#8894a6'; ctx.fillText('点击下方按钮重新开始', W / 2, H / 2 + 20);
      } else {
        ctx.fillText('← → 或 A / D 移动', W / 2, H / 2 + 2);
        ctx.fillStyle = '#8894a6'; ctx.fillText('点击「开始游戏」出发', W / 2, H / 2 + 20);
      }
    }
    ctx.restore();
  }

  /* SECTION: loop */
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt); draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  syncHud(); draw();

  /* SECTION: controls */
  function toggle() {
    if (S.over || !S.running) {
      reset(); S.running = true;
      if (toggleBtn) toggleBtn.textContent = '暂停';
    } else {
      S.running = false;
      if (toggleBtn) toggleBtn.textContent = '继续';
    }
  }
  if (toggleBtn) toggleBtn.addEventListener('click', toggle);

  window.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var ae = document.activeElement;
    var inField = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
    if (inField) return;
    if (k === 'arrowleft' || k === 'a') {
      keys.l = true; S.ptarget = null;
      if (S.running) e.preventDefault();
    }
    if (k === 'arrowright' || k === 'd') {
      keys.r = true; S.ptarget = null;
      if (S.running) e.preventDefault();
    }
    if (k === ' ' || k === 'enter') {
      if (ae && ae !== document.body && ae !== cv && ae !== toggleBtn) return;
      toggle(); e.preventDefault();
    }
  });
  window.addEventListener('keyup', function (e) {
    var k = (e.key || '').toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.l = false;
    if (k === 'arrowright' || k === 'd') keys.r = false;
  });

  function hold(btn, dir) {
    if (!btn) return;
    var on = function (e) { e.preventDefault(); keys[dir] = true; S.ptarget = null; btn.classList.add('hold'); };
    var off = function () { keys[dir] = false; btn.classList.remove('hold'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  }
  hold(document.getElementById('pad-left'), 'l');
  hold(document.getElementById('pad-right'), 'r');

  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (!S.running) { toggle(); return; }
    var r = cv.getBoundingClientRect();
    S.ptarget = ((e.clientX - r.left) / r.width) * W;
    if (cv.setPointerCapture) { try { cv.setPointerCapture(e.pointerId); } catch (err) {} }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!S.running) return;
    var r = cv.getBoundingClientRect();
    S.ptarget = ((e.clientX - r.left) / r.width) * W;
  });
  cv.addEventListener('pointerup', function () { S.ptarget = null; });

  /* SECTION: hash-start */
  if (window.location.hash === '#stage') {
    var stage = document.getElementById('stage');
    if (stage) {
      setTimeout(function () {
        window.scrollTo({ top: stage.getBoundingClientRect().top + window.pageYOffset - 16, behavior: reduce ? 'auto' : 'smooth' });
      }, 120);
      B.toast('内置小游戏已就绪，点击「开始游戏」试玩');
    }
  }

  /* SECTION: game-list-hint */
  var list = document.getElementById('game-list');
  if (list) {
    var games = (window.BLOG_DATA && window.BLOG_DATA.GAMES) || [];
    games.forEach(function (g) {
      var isLink = !!(g.live || g.page);
      var item = document.createElement(isLink ? 'a' : 'button');
      item.className = 'game-item';
      if (!isLink) item.type = 'button';
      var ico = document.createElement('span');
      ico.className = 'game-ico';
      ico.style.setProperty('--g1', g.g1);
      ico.style.setProperty('--g2', g.g2);
      ico.textContent = g.glyph || '◎';
      item.appendChild(ico);
      var txt = document.createElement('span');
      txt.className = 'game-txt';
      var b = document.createElement('b');
      b.textContent = g.name;
      var s = document.createElement('span');
      s.textContent = g.sum;
      txt.appendChild(b); txt.appendChild(s);
      item.appendChild(txt);
      var st = document.createElement('span');
      st.className = 'game-state ' + (g.live ? 'live' : (g.page ? 'soon' : 'soon'));
      if (g.live) st.className = 'game-state live';
      else if (g.page) { st.className = 'game-state live'; st.style.color = '#8fd8ff'; st.style.borderColor = 'rgba(95,216,255,.4)'; st.style.background = 'rgba(95,216,255,.12)'; }
      st.textContent = g.live ? '可试玩' : (g.page ? (g.win ? '仅 Windows' : '可下载') : '待补全');
      item.appendChild(st);

      if (g.page) {
        item.setAttribute('href', g.page);
        item.setAttribute('target', '_blank');
        item.setAttribute('rel', 'noopener');
      } else if (g.live) {
        item.setAttribute('href', B.detailUrl('game', g.id));
      } else {
        item.addEventListener('click', function () { B.toast('「' + g.name + '」内容待补全'); });
      }
      list.appendChild(item);
    });
  }
})();
