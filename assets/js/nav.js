/* ============================================================
   LastShark 博客 · 公共交互
   SECTION: helpers / site-text / reveal / dock(常驻不隐藏) /
            back-to-top(右下角悬浮，不随滚动隐藏) / toast
   依赖：data.js 先加载。
   ============================================================ */
(function () {
  'use strict';

  /* SECTION: helpers */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DATA = window.BLOG_DATA || {};

  var toastEl = $('#toast'), toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* 站内详情页跳转地址 */
  function detailUrl(type, id) {
    return 'detail.html?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
  }
  /* 文章走独立阅读页（只有正文 + 目录） */
  function readUrl(id) {
    return 'read.html?id=' + encodeURIComponent(id);
  }
  /* 按内容类型返回对应的站内地址 */
  function itemUrl(type, id) {
    return type === 'article' ? readUrl(id) : detailUrl(type, id);
  }

  window.BLOG = {
    $: $, $$: $$, el: el, reduce: reduce, toast: toast,
    detailUrl: detailUrl, readUrl: readUrl, itemUrl: itemUrl, data: DATA
  };

  /* SECTION: site-text */
  var site = DATA.SITE || {};
  function fill(id, value) {
    var n = document.getElementById(id);
    if (n && value !== undefined) n.textContent = value;
  }
  fill('site-name', site.name);
  fill('hero-status', site.status);
  fill('hero-desc', site.heroDesc);
  fill('foot-text', site.footer);
  /* 年份：既支持 id="year"，也支持 class="year"（独立文章文件用后者，不依赖 id） */
  var yr = String(new Date().getFullYear());
  var y = $('#year');
  if (y) y.textContent = yr;
  $$('.year').forEach(function (n) { n.textContent = yr; });
  var chips = $('#hero-chips');
  if (chips && site.heroChips) {
    chips.innerHTML = '';
    site.heroChips.forEach(function (c) { chips.appendChild(el('span', 'chip', c)); });
  }
  $$('[data-site-tagline]').forEach(function (n) { n.textContent = site.tagline || ''; });

  /* SECTION: reveal */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    rvs.forEach(function (n) { io.observe(n); });
  } else {
    rvs.forEach(function (n) { n.classList.add('in'); });
  }

  /* SECTION: dock —— 导航栏常驻，任何滚动都不隐藏 */
  var dock = $('#dock'), dockList = $('#dock-list'), dockInd = $('#dock-ind');
  var navItems = $$('.nav-item', dockList);
  var page = document.body.getAttribute('data-page') || '';

  function moveIndicator(btn) {
    if (!dockInd || !btn) return;
    var lr = dockList.getBoundingClientRect(), br = btn.getBoundingClientRect();
    dockInd.style.setProperty('--iw', br.width + 'px');
    dockInd.style.transform = 'translate(' + (br.left - lr.left) + 'px,-50%) scale(1.06,1.12)';
    dockInd.classList.add('show');
    setTimeout(function () {
      dockInd.style.transform = 'translate(' + (br.left - lr.left) + 'px,-50%) scale(1,1)';
    }, 170);
  }
  function setActive(id) {
    var hit = null;
    navItems.forEach(function (n) {
      var on = n.getAttribute('data-target') === id;
      n.classList.toggle('on', on);
      /* 体验优化：当前板块对读屏器可见 */
      if (on) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
      if (on) hit = n;
    });
    if (hit) moveIndicator(hit);
  }
  /* 详情页归属到它对应的板块 */
  if (page === 'detail') {
    var q = new URLSearchParams(window.location.search);
    var t = q.get('type');
    var map = { article: 'articles', mod: 'mods', game: 'games' };
    if (map[t]) setActive(map[t]);
  } else if (page) {
    setActive(page);
  }

  navItems.forEach(function (n) {
    n.addEventListener('click', function () {
      var target = n.getAttribute('data-target');
      var href = n.getAttribute('data-href');
      /* 同页锚点滚动；跨页直接跳转 */
      if (href && target === page && document.getElementById(target)) {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      } else if (href) {
        window.location.href = href;
      }
    });
  });

  if (dock && !reduce) {
    dock.addEventListener('pointermove', function (e) {
      var r = dock.getBoundingClientRect();
      dock.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    });
    dock.addEventListener('pointerleave', function () { dock.style.setProperty('--mx', '50%'); });
  }
  function syncInd() {
    var cur = $('.nav-item.on');
    if (cur) moveIndicator(cur);
  }
  window.addEventListener('resize', syncInd);
  window.addEventListener('load', syncInd);
  setTimeout(syncInd, 60);
  setTimeout(syncInd, 400);

  /* SECTION: back-to-top —— 右下角常驻悬浮，滚动不隐藏 */
  var topBtn = $('#to-top');
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* SECTION: footer-links */
  $$('[data-scroll]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var id = b.getAttribute('data-scroll');
      var t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 16, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
