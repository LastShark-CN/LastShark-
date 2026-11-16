/* ============================================================
   LastShark 博客 · 文章阅读页
   只有文章本身：标题、信息、封面、章节正文 + 目录。
   不显示侧栏推荐、规格表等其他元素。
   目录始终显示：即使文章只有一章也会列出该章标题；
   若数据里没写 sections，会自动兜底生成一章「正文」，目录不会空。
   ============================================================ */
(function () {
  'use strict';

  var B = window.BLOG;
  if (!B) return;
  var DATA = B.data;
  var ARTICLES = DATA.ARTICLES || [];

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  var main = document.getElementById('read-main');
  var tocBox = document.getElementById('read-toc');
  var topTitle = document.getElementById('read-topbar-title');

  function notFound(msg) {
    document.title = '未找到文章 · LastShark';
    if (topTitle) topTitle.textContent = '未找到文章';
    if (tocBox) tocBox.style.display = 'none';
    if (!main) return;
    main.innerHTML = '';
    var w = document.createElement('div');
    w.className = 'empty';
    var b = document.createElement('b');
    b.textContent = msg || '没有找到这篇文章';
    var s = document.createElement('span');
    s.textContent = '请检查链接参数，或返回文章列表重新选择。';
    w.appendChild(b); w.appendChild(s);
    main.appendChild(w);
    var back = document.createElement('a');
    back.className = 'back-link';
    back.setAttribute('href', 'articles.html');
    back.textContent = '返回文章列表';
    main.appendChild(back);
  }

  var art = ARTICLES.filter(function (a) { return String(a.id) === String(id); })[0];
  if (!art) { notFound('没有找到编号为 ' + (id || '空') + ' 的文章'); return; }

  document.title = art.title + ' · LastShark';
  if (topTitle) topTitle.textContent = art.title;

  /* SECTION: sections —— 至少保证有一章 */
  var sections = (art.sections && art.sections.length)
    ? art.sections
    : [{ title: '正文', paras: art.body && art.body.length ? art.body : ['正文占位：在 data.js 的这篇 sections 里填写章节与段落。'] }];

  function num(n) { return n < 10 ? '0' + n : String(n); }

  /* SECTION: header */
  var h1 = document.getElementById('read-title');
  if (h1) h1.textContent = art.title;

  var meta = document.getElementById('read-meta');
  if (meta) {
    [art.catLabel, art.date, art.min + ' 分钟阅读', sections.length + ' 章'].forEach(function (t, i) {
      if (i > 0) {
        var sep = document.createElement('i');
        sep.textContent = '·';
        meta.appendChild(sep);
      }
      var s = document.createElement('span');
      s.textContent = t;
      meta.appendChild(s);
    });
  }

  var lede = document.getElementById('read-lede');
  if (lede) {
    if (art.sum) lede.textContent = art.sum;
    else lede.style.display = 'none';
  }

  /* SECTION: cover */
  var cover = document.getElementById('read-cover');
  if (cover) {
    if (art.image || art.g1) {
      cover.style.setProperty('--g1', art.g1 || '#3b4a63');
      cover.style.setProperty('--g2', art.g2 || '#1b2432');
      var gl = document.createElement('span');
      gl.className = 'thumb-glyph';
      gl.textContent = art.image ? '' : (art.glyph || '◈');
      cover.appendChild(gl);
      if (art.image) {
        var img = document.createElement('img');
        img.dataset.image = art.image;
        img.alt = art.title;
        img.onerror = function () { img.style.display = 'none'; gl.textContent = art.glyph || '◈'; };
        img.src = img.dataset.image;
        cover.appendChild(img);
      }
    } else {
      cover.style.display = 'none';
    }
  }

  /* SECTION: body */
  var body = document.getElementById('read-body');
  if (body) {
    body.innerHTML = '';
    sections.forEach(function (sec, i) {
      var s = document.createElement('section');
      s.className = 'read-sec';
      s.id = 'sec-' + (i + 1);

      var h = document.createElement('h2');
      var em = document.createElement('em');
      em.textContent = num(i + 1);
      var sp = document.createElement('span');
      sp.textContent = sec.title || ('第 ' + (i + 1) + ' 章');
      h.appendChild(em); h.appendChild(sp);
      s.appendChild(h);

      var paras = (sec.paras && sec.paras.length) ? sec.paras : ['本章正文占位：在 data.js 里填写这一章的段落。'];
      paras.forEach(function (t, k) {
        var p = document.createElement('p');
        p.textContent = t;
        /* 明显是占位文本时用虚线标记，方便你识别哪些还没替换 */
        if (k === paras.length - 1 && /占位/.test(t)) p.classList.add('ph');
        s.appendChild(p);
      });

      body.appendChild(s);
    });
  }

  /* SECTION: toc —— 始终渲染，至少一章 */
  if (tocBox) {
    var list = document.getElementById('toc-list');
    var note = document.getElementById('toc-note');
    if (list) {
      list.innerHTML = '';
      sections.forEach(function (sec, i) {
        var a = document.createElement('a');
        a.className = 'toc-link';
        a.setAttribute('href', '#sec-' + (i + 1));
        a.dataset.sec = 'sec-' + (i + 1);
        var idx = document.createElement('i');
        idx.textContent = num(i + 1);
        var tt = document.createElement('span');
        tt.textContent = sec.title || ('第 ' + (i + 1) + ' 章');
        a.appendChild(idx); a.appendChild(tt);
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var t = document.getElementById('sec-' + (i + 1));
          if (t) {
            window.scrollTo({
              top: t.getBoundingClientRect().top + window.pageYOffset - 18,
              behavior: B.reduce ? 'auto' : 'smooth'
            });
            history.replaceState(null, '', '#sec-' + (i + 1));
          }
        });
        list.appendChild(a);
      });
    }
    if (note) note.textContent = '共 ' + sections.length + ' 章 · 内容为占位，替换 data.js 即可';
  }

  /* SECTION: toc-active */
  var links = tocBox ? Array.prototype.slice.call(tocBox.querySelectorAll('.toc-link')) : [];
  if (links.length && 'IntersectionObserver' in window) {
    var cur = null;
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          var idn = en.target.id;
          if (cur === idn) return;
          cur = idn;
          links.forEach(function (l) { l.classList.toggle('on', l.dataset.sec === idn); });
        }
      });
    }, { rootMargin: '-12% 0px -74% 0px', threshold: 0 });
    sections.forEach(function (sec, i) {
      var t = document.getElementById('sec-' + (i + 1));
      if (t) sio.observe(t);
    });
  } else if (links.length) {
    links[0].classList.add('on');
  }

  /* SECTION: progress */
  var bar = document.getElementById('read-bar');
  function updateProgress() {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* SECTION: hash-in */
  if (window.location.hash) {
    var tgt = document.getElementById(window.location.hash.slice(1));
    if (tgt) {
      setTimeout(function () {
        window.scrollTo({ top: tgt.getBoundingClientRect().top + window.pageYOffset - 18, behavior: 'auto' });
      }, 80);
    }
  }
})();
