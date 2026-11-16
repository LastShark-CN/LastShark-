/* ============================================================
   LastShark 博客 · 照片墙
   不规则错落排布 + 拖拽/滚轮/按钮左右滑动 + 点击开预览窗（不跳转）
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.BLOG_DATA || {};
  var PHOTOS = DATA.PHOTOS || [];
  var track = document.getElementById('wall-track');
  var vp = document.getElementById('wall-viewport');
  var bar = document.getElementById('wall-bar');
  if (!track || !vp) return;

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var nodes = [];

  /* SECTION: build */
  PHOTOS.forEach(function (p, idx) {
    var fig = document.createElement('figure');
    fig.className = 'photo';
    if (p.dark) fig.classList.add('dark');
    if (p.taped) fig.classList.add('taped');
    if (p.stack) fig.classList.add('stack-next');

    fig.style.setProperty('--rot', reduce ? '0deg' : p.rot.toFixed(2) + 'deg');
    fig.style.setProperty('--dy', (reduce ? 0 : p.dy).toFixed(0) + 'px');
    fig.style.setProperty('--pw', p.pw + 'px');
    fig.style.setProperty('--gap', p.gap + 'px');
    fig.style.setProperty('--ar', p.ar);
    if (p.stack) fig.style.setProperty('--overlap', p.overlap + 'px');
    if (p.taped) fig.style.setProperty('--tape', p.tape.toFixed(1) + 'deg');
    fig.dataset.idx = String(idx);

    fig.appendChild(document.createElement('i')).className = 'photo-pin';
    fig.appendChild(document.createElement('i')).className = 'photo-tape';

    var inner = document.createElement('div');
    inner.className = 'photo-inner';

    /* 整张照片是一个按钮：只开预览窗，不做页面跳转 */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.setAttribute('aria-label', '预览照片 ' + p.no + '：' + p.title);

    var imgBox = document.createElement('div');
    imgBox.className = 'photo-img';
    imgBox.style.setProperty('--g1', p.g1);
    imgBox.style.setProperty('--g2', p.g2);

    var slot = document.createElement('span');
    slot.className = 'photo-slot';
    slot.textContent = p.image ? '' : '照片占位\nREPLACE';
    imgBox.appendChild(slot);

    if (p.image) {
      var img = document.createElement('img');
      img.dataset.image = p.image;
      img.alt = p.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function () { img.style.display = 'none'; slot.textContent = '图片加载失败'; };
      img.src = img.dataset.image;
      imgBox.appendChild(img);
    }

    var no = document.createElement('span');
    no.className = 'photo-no';
    no.textContent = 'PHOTO ' + p.no;
    imgBox.appendChild(no);

    var cap = document.createElement('figcaption');
    cap.className = 'photo-cap';
    var tt = document.createElement('span');
    tt.className = 'photo-title';
    tt.textContent = p.title;
    var mm = document.createElement('span');
    mm.className = 'photo-meta';
    mm.textContent = p.meta;
    cap.appendChild(tt);
    cap.appendChild(mm);

    btn.appendChild(imgBox);
    btn.appendChild(cap);
    inner.appendChild(btn);
    fig.appendChild(inner);
    track.appendChild(fig);
    nodes.push(fig);
  });

  var count = document.getElementById('wall-count');
  if (count) {
    var real = PHOTOS.filter(function (p) { return p.image; }).length;
    count.textContent = PHOTOS.length + ' 张照片' +
      (real ? ' · ' + real + ' 张已接入本地图' : ' · 占位待替换') +
      ' · 点击任意一张打开预览窗';
  }

  /* SECTION: drag */
  var isDown = false, startX = 0, startLeft = 0, velX = 0, lastX = 0, lastT = 0, rafId = null, moved = 0;

  vp.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    isDown = true; moved = 0;
    startX = e.clientX; startLeft = vp.scrollLeft; lastX = e.clientX; lastT = performance.now(); velX = 0;
    vp.classList.add('dragging');
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    try { vp.setPointerCapture(e.pointerId); } catch (err) {}
  });
  vp.addEventListener('pointermove', function (e) {
    if (!isDown) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    vp.scrollLeft = startLeft - dx;
    var now = performance.now(), dt = now - lastT;
    if (dt > 0) velX = (lastX - e.clientX) / dt;
    lastX = e.clientX; lastT = now;
  });
  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    vp.classList.remove('dragging');
    try { vp.releasePointerCapture(e.pointerId); } catch (err) {}
    if (reduce) return;
    var v = velX * 16, last = performance.now();
    if (Math.abs(v) < 0.6) return;
    var stepFn = function (now) {
      var dt = Math.min(48, now - last); last = now;
      vp.scrollLeft += v * dt * 0.06;
      v *= Math.pow(0.945, dt / 16);
      rafId = Math.abs(v) > 0.05 ? requestAnimationFrame(stepFn) : null;
    };
    rafId = requestAnimationFrame(stepFn);
  }
  vp.addEventListener('pointerup', endDrag);
  vp.addEventListener('pointercancel', endDrag);
  vp.addEventListener('pointerleave', function () { if (isDown) endDrag({ pointerId: -1 }); });

  vp.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && vp.scrollWidth > vp.clientWidth + 4) {
      e.preventDefault();
      vp.scrollLeft += e.deltaY * 1.1;
    }
  }, { passive: false });

  /* SECTION: preview-click */
  vp.addEventListener('click', function (e) {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; return; }
    var fig = e.target.closest ? e.target.closest('.photo') : null;
    if (fig && typeof window.BLOpenLightbox === 'function') {
      window.BLOpenLightbox(parseInt(fig.dataset.idx, 10));
    }
  });
  nodes.forEach(function (fig) {
    var b = fig.querySelector('.photo-btn');
    if (b) {
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof window.BLOpenLightbox === 'function') window.BLOpenLightbox(parseInt(fig.dataset.idx, 10));
        }
      });
    }
  });

  vp.addEventListener('keydown', function (e) {
    var s = Math.max(220, vp.clientWidth * 0.6);
    if (e.key === 'ArrowRight') { e.preventDefault(); vp.scrollBy({ left: s, behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); vp.scrollBy({ left: -s, behavior: 'smooth' }); }
  });

  /* SECTION: nav-buttons */
  function nudge(dir) {
    var s = Math.max(260, vp.clientWidth * 0.62);
    var max = vp.scrollWidth - vp.clientWidth;
    var target = vp.scrollLeft + dir * s;
    if (dir > 0 && vp.scrollLeft >= max - 4) target = 0;
    if (dir < 0 && vp.scrollLeft <= 4) target = max;
    vp.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
  }
  var pb = document.getElementById('wall-prev'), nb = document.getElementById('wall-next');
  if (pb) pb.addEventListener('click', function () { nudge(-1); });
  if (nb) nb.addEventListener('click', function () { nudge(1); });

  /* SECTION: progress */
  function updateBar() {
    if (!bar) return;
    var max = vp.scrollWidth - vp.clientWidth;
    var ratio = max > 0 ? vp.clientWidth / vp.scrollWidth : 1;
    var w = Math.max(9, ratio * 100);
    var p = max > 0 ? vp.scrollLeft / max : 0;
    bar.style.width = w + '%';
    bar.style.transform = 'translateX(' + (p * (100 / w - 1) * 100).toFixed(2) + '%)';
  }
  vp.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  setTimeout(updateBar, 60);
  window.addEventListener('load', updateBar);
})();
