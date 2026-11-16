/* ============================================================
   LastShark 博客 · 文章阅读页逻辑（独立文章文件专用）
   特点：
   - 不读取 data.js，不做任何 id 查询，文章内容完全写在自己的 HTML 里
   - 目录由页面里真实存在的 .read-sec 章节自动生成
   - 只有一章的短文同样显示目录；万一没有章节，兜底生成一条「正文」
   - 全部通过 class 定位元素，改标记结构也不会失效
   ============================================================ */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var article = document.querySelector('.read-main');
  var tocBox = document.querySelector('.toc');
  var tocList = document.querySelector('.toc-list');
  var tocNote = document.querySelector('.toc-note');
  var bar = document.querySelector('.read-progress i');

  function num(n) { return n < 10 ? '0' + n : String(n); }

  /* SECTION: collect —— 从真实 DOM 收集章节 */
  var secs = article ? Array.prototype.slice.call(article.querySelectorAll('.read-sec')) : [];

  var entries = secs.map(function (sec, i) {
    /* 优先取标题文本节点，去掉序号 em */
    var h = sec.querySelector('h2');
    var titleEl = h ? (h.querySelector('span') || h) : null;
    var title = titleEl ? titleEl.textContent.trim() : ('第 ' + (i + 1) + ' 章');
    if (!sec.id) sec.id = 'sec-' + (i + 1);
    return { el: sec, id: sec.id, title: title || ('第 ' + (i + 1) + ' 章') };
  });

  /* 兜底：没有任何章节时，也要让目录里至少有一条 */
  if (!entries.length && article) {
    var body = article.querySelector('.read-body') || article;
    if (!body.id) body.id = 'sec-1';
    var fallbackTitle = '正文';
    var h1 = article.querySelector('.read-title');
    if (h1 && h1.textContent.trim()) fallbackTitle = h1.textContent.trim();
    entries = [{ el: body, id: body.id, title: fallbackTitle }];
  }

  /* SECTION: toc-render */
  if (tocList) {
    entries.forEach(function (en, i) {
      var a = document.createElement('a');
      a.className = 'toc-link';
      a.setAttribute('href', '#' + en.id);
      a.dataset.target = en.id;

      var idx = document.createElement('i');
      idx.textContent = num(i + 1);
      var tt = document.createElement('span');
      tt.textContent = en.title;
      a.appendChild(idx);
      a.appendChild(tt);

      a.addEventListener('click', function (e) {
        e.preventDefault();
        var top = en.el.getBoundingClientRect().top + window.pageYOffset - 18;
        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
        try { history.replaceState(null, '', '#' + en.id); } catch (err) {}
      });

      tocList.appendChild(a);
    });
  }
  if (tocNote) {
    tocNote.textContent = entries.length > 1
      ? '共 ' + entries.length + ' 章 · 点击可跳转'
      : '共 1 章 · 内容为占位，替换本页正文即可';
  }

  /* SECTION: toc-active */
  var links = tocList ? Array.prototype.slice.call(tocList.querySelectorAll('.toc-link')) : [];
  if (links.length && entries.length && 'IntersectionObserver' in window) {
    var cur = null;
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        if (!en.isIntersecting) return;
        var idn = en.target.id;
        if (cur === idn) return;
        cur = idn;
        links.forEach(function (l) { l.classList.toggle('on', l.dataset.target === idn); });
      });
    }, { rootMargin: '-12% 0px -74% 0px', threshold: 0 });
    entries.forEach(function (en) { io.observe(en.el); });
  } else if (links.length) {
    links[0].classList.add('on');
  }

  /* SECTION: progress */
  function updateProgress() {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* SECTION: meta —— 章节数写进信息行 */
  var meta = document.querySelector('.read-meta');
  if (meta && entries.length) {
    var sep = document.createElement('i');
    sep.textContent = '·';
    var s = document.createElement('span');
    s.textContent = entries.length + ' 章';
    meta.appendChild(sep);
    meta.appendChild(s);
  }

  /* SECTION: hash-in */
  if (window.location.hash) {
    var name = window.location.hash.slice(1);
    var hit = entries.filter(function (e) { return e.id === name; })[0];
    if (hit) {
      setTimeout(function () {
        window.scrollTo({
          top: Math.max(0, hit.el.getBoundingClientRect().top + window.pageYOffset - 18),
          behavior: 'auto'
        });
      }, 90);
    }
  }
})();
