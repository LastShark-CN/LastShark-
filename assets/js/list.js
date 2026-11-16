/* ============================================================
   LastShark 博客 · 列表页渲染（文章 / 模组 / 小游戏 共用）
   卡片只做「标题 + 图片」，点击跳转到 detail.html 详情页。
   由 body[data-list] 决定渲染哪一种：articles / mods / games
   ============================================================ */
(function () {
  'use strict';

  var B = window.BLOG;
  if (!B) return;
  var DATA = B.data;
  var kind = document.body.getAttribute('data-list');
  var grid = document.getElementById('list-grid');
  if (!kind || !grid) return;

  var ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

  /* SECTION: source */
  var CFG = {
    articles: {
      items: DATA.ARTICLES || [],
      cats: DATA.ARTICLE_CATS || [],
      type: 'article',
      newTab: true,
      nameOf: function (a) { return a.title; },
      metaOf: function (a) { return [a.catLabel, a.date, a.min + ' 分钟阅读']; },
      flag: '待替换',
      emptyTitle: '这个分类还没有文章',
      emptyText: '在 data.js 的 ARTICLES 里添加条目，或切换到其他分类查看。'
    },
    mods: {
      items: DATA.MODS || [],
      cats: [
        { key: 'all', label: '全部' },
        { key: 'Forge', label: 'Forge' },
        { key: 'NeoForge', label: 'NeoForge' },
        { key: 'Fabric', label: 'Fabric' }
      ],
      type: 'mod',
      nameOf: function (m) { return m.name; },
      metaOf: function (m) { return ['MC ' + m.mc, m.loader, m.ver]; },
      matchCat: function (m, k) { return k === 'all' || m.loader === k; },
      flag: '待替换',
      emptyTitle: '没有符合条件的模组',
      emptyText: '在 data.js 的 MODS 里添加条目，或切换到其他加载器分类。'
    },
    games: {
      items: DATA.GAMES || [],
      cats: [
        { key: 'all', label: '全部' },
        { key: 'live', label: '可试玩' },
        { key: 'download', label: '可下载' },
        { key: 'soon', label: '待补全' }
      ],
      type: 'game',
      nameOf: function (g) { return g.name; },
      metaOf: function (g) {
        var m = [];
        if (g.live) m.push('站内可玩');
        if (g.page) m.push('介绍 / 下载');
        if (g.win) m.push('仅 Windows');
        if (g.ver) m.push(g.ver);
        if (g.size) m.push(g.size);
        if (!m.length) m.push('内容待补全');
        return m;
      },
      matchCat: function (g, k) {
        if (k === 'all') return true;
        if (k === 'live') return !!g.live;
        if (k === 'download') return !!g.page;
        return !g.live && !g.page;
      },
      flag: '待补全',
      emptyTitle: '这里还没有游戏',
      emptyText: '在 data.js 的 GAMES 里添加条目。'
    }
  }[kind];

  if (!CFG) return;
  var curCat = 'all';

  /* SECTION: thumb */
  function buildThumb(item, tagText) {
    var th = document.createElement('div');
    th.className = 'thumb';
    th.style.setProperty('--g1', item.g1 || '#3b4a63');
    th.style.setProperty('--g2', item.g2 || '#1b2432');

    var gl = document.createElement('span');
    gl.className = 'thumb-glyph';
    gl.textContent = item.image ? '' : (item.glyph || '◈');
    th.appendChild(gl);

    if (item.image) {
      var img = document.createElement('img');
      img.dataset.image = item.image;
      img.alt = CFG.nameOf(item);
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function () { img.style.display = 'none'; gl.textContent = item.glyph || '◈'; };
      img.src = img.dataset.image;
      th.appendChild(img);
    }

    if (tagText) {
      var tag = document.createElement('span');
      tag.className = 'thumb-tag';
      tag.textContent = tagText;
      th.appendChild(tag);
    }
    var fl = document.createElement('span');
    fl.className = 'thumb-flag';
    var hasReal = !!(item.image || item.download || item.page);
    fl.textContent = kind === 'games'
      ? (item.live ? '可试玩' : CFG.flag)
      : (hasReal ? '已收录' : CFG.flag);
    th.appendChild(fl);
    return th;
  }

  /* SECTION: card */
  function buildCard(item) {
    var a = document.createElement('a');
    a.className = 'item-card gcard rv';
    /* 文章走各自独立的 HTML 文件；游戏带 page 时走独立介绍页，统一新标签页打开 */
    var href = item.file || item.page || item.link || B.itemUrl(CFG.type, item.id);
    a.setAttribute('href', href);
    if (CFG.newTab || item.page) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }

    var tagText = kind === 'articles' ? item.catLabel
      : kind === 'mods' ? item.loader
      : (item.live ? '可试玩' : item.page ? '可下载' : '敬请期待');
    a.appendChild(buildThumb(item, tagText));

    var body = document.createElement('div');
    body.className = 'item-body';
    var h = document.createElement('h3');
    h.textContent = CFG.nameOf(item);
    body.appendChild(h);

    var meta = document.createElement('div');
    meta.className = 'item-meta';
    CFG.metaOf(item).forEach(function (t, i) {
      if (i > 0) {
        var sep = document.createElement('i');
        sep.textContent = '·';
        meta.appendChild(sep);
      }
      meta.appendChild(document.createElement('span')).textContent = t;
    });
    body.appendChild(meta);

    var go = document.createElement('span');
    go.className = 'item-go';
    var goText = kind === 'articles' ? '阅读全文' : kind === 'mods' ? '查看详情 / 下载' : '打开';
    go.appendChild(document.createTextNode(goText));
    var svgWrap = document.createElement('span');
    svgWrap.innerHTML = ARROW;
    go.appendChild(svgWrap.firstChild);
    body.appendChild(go);

    a.appendChild(body);
    return a;
  }

  /* SECTION: render */
  function render() {
    grid.innerHTML = '';
    var list = CFG.items.filter(function (it) {
      return CFG.matchCat ? CFG.matchCat(it, curCat) : (curCat === 'all' || it.cat === curCat);
    });
    if (!list.length) {
      var em = document.createElement('div');
      em.className = 'empty';
      var b = document.createElement('b');
      b.textContent = CFG.emptyTitle;
      var s = document.createElement('span');
      s.textContent = CFG.emptyText;
      em.appendChild(b); em.appendChild(s);
      grid.appendChild(em);
      return;
    }
    list.forEach(function (it) { grid.appendChild(buildCard(it)); });
    grid.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); });
    var c = document.getElementById('list-count');
    if (c) c.textContent = list.length + ' 个条目';
  }

  /* SECTION: filters */
  var frow = document.getElementById('list-filters');
  function renderFilters() {
    if (!frow) return;
    frow.innerHTML = '';
    CFG.cats.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fbtn' + (c.key === curCat ? ' on' : '');
      b.textContent = c.label;
      b.addEventListener('click', function () {
        curCat = c.key;
        renderFilters();
        render();
      });
      frow.appendChild(b);
    });
  }

  renderFilters();
  render();
})();
