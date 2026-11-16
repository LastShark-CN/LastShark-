/* ============================================================
   LastShark 博客 · 照片预览灯箱
   照片点击不跳转页面，只在本页打开预览窗口。
   用法：BLOpenLightbox(index)  或  由 photos.js 内部调用
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.BLOG_DATA || {};
  var PHOTOS = DATA.PHOTOS || [];
  var lb = document.getElementById('lb');
  if (!lb || !PHOTOS.length) return;

  var stage = document.getElementById('lb-stage');
  var countEl = document.getElementById('lb-count');
  var capEl = document.getElementById('lb-cap');
  var idx = 0;
  var lastFocus = null;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function paint() {
    var p = PHOTOS[idx];
    if (!p) return;
    stage.innerHTML = '';

    var inner = document.createElement('div');
    inner.className = 'photo-inner';

    var imgBox = document.createElement('div');
    imgBox.className = 'photo-img';
    imgBox.style.setProperty('--ar', p.ar);
    imgBox.style.setProperty('--g1', p.g1);
    imgBox.style.setProperty('--g2', p.g2);

    var slot = document.createElement('span');
    slot.className = 'photo-slot';
    slot.textContent = p.image ? '' : '照片占位 · REPLACE';
    imgBox.appendChild(slot);

    if (p.image) {
      var img = document.createElement('img');
      /* 灯箱用中图（large，长边 1600px）；没有中图时退回小图，保证不空窗 */
      img.dataset.image = p.large || p.image;
      img.alt = p.title;
      img.loading = 'lazy';
      img.onerror = function () {
        if (img.dataset.fallback !== '1' && p.image) {
          img.dataset.fallback = '1';
          img.src = p.image;
        } else {
          img.style.display = 'none';
          slot.textContent = '图片加载失败';
        }
      };
      img.src = img.dataset.image;
      imgBox.appendChild(img);
    }

    var no = document.createElement('span');
    no.className = 'photo-no';
    no.textContent = 'PHOTO ' + p.no;
    imgBox.appendChild(no);

    var cap = document.createElement('figcaption');
    cap.className = 'photo-cap';
    var t = document.createElement('span');
    t.className = 'photo-title';
    t.textContent = p.title;
    var m = document.createElement('span');
    m.className = 'photo-meta';
    m.textContent = p.meta;
    cap.appendChild(t);
    cap.appendChild(m);

    inner.appendChild(imgBox);
    inner.appendChild(cap);
    stage.appendChild(inner);

    var inner = document.getElementById('lb-inner');
    if (inner) inner.style.setProperty('--rot', reduce ? '0deg' : (p.rot * 0.35).toFixed(2) + 'deg');
    if (capEl) {
      capEl.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = p.title;
      var d = document.createElement('span');
      d.textContent = (p.desc || '') + '  ·  ' + p.meta;
      capEl.appendChild(b);
      capEl.appendChild(d);
    }
    if (countEl) countEl.textContent = p.no + ' / ' + PHOTOS.length;
  }

  function open(i) {
    idx = ((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;
    lastFocus = document.activeElement;
    paint();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    var c = document.getElementById('lb-close');
    if (c) c.focus();
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) {
    idx = ((idx + d) % PHOTOS.length + PHOTOS.length) % PHOTOS.length;
    paint();
  }

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  document.getElementById('lb-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* 触屏左右滑动切换 */
  var sx = 0, sy = 0, tracking = false;
  lb.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.BLOpenLightbox = open;
})();
