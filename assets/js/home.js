/* ============================================================
   LastShark 博客 · 首页
   四个板块入口卡片（跳转到各自独立页面）+ 最新文章预览
   ============================================================ */
(function () {
  'use strict';

  var B = window.BLOG;
  if (!B) return;
  var DATA = B.data;

  /* SECTION: entries */
  var ENTRIES = [
    {
      href: 'photos.html', title: '照片墙',
      desc: '不规则错落排布的照片流，左右滑动浏览，点击任意一张打开独立预览窗。',
      stat: (DATA.PHOTOS || []).length + ' 个照片位',
      e1: '#c98b52', e2: '#4a2c17',
      icon: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="9" cy="10.2" r="1.7"/><path d="M4.4 17.2l4.8-3.8 3.6 2.8 2.8-2 3.9 3"/></svg>'
    },
    {
      href: 'articles.html', title: '文章',
      desc: '按分类浏览的简易卡片列表，只有标题与封面图，点击进入详情阅读。',
      stat: (DATA.ARTICLES || []).length + ' 篇示例',
      e1: '#4f9aa8', e2: '#152c33',
      icon: '<svg viewBox="0 0 24 24"><path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M14.6 3.7V7.4h3.6"/><path d="M9 12h7M9 15.6h5"/></svg>'
    },
    {
      href: 'mods.html', title: '我的世界模组',
      desc: '模组展示位：封面、版本与加载器信息齐备，详情页提供下载入口。',
      stat: (DATA.MODS || []).length + ' 个模组位',
      e1: '#6f9b4a', e2: '#25401a',
      icon: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4z"/><path d="M4 7.4l8 4.4 8-4.4M12 11.8V21"/></svg>'
    },
    {
      href: 'games.html', title: '小游戏',
      desc: '内置一个可直接试玩的像素小游戏，其余为待补全的游戏展示位。',
      stat: (DATA.GAMES || []).length + ' 个游戏位',
      e1: '#8a6fa8', e2: '#2a1f3d',
      icon: '<svg viewBox="0 0 24 24"><rect x="2.5" y="7.5" width="19" height="10" rx="4.2"/><path d="M7 10.8v3.4M5.3 12.5h3.4"/><circle cx="16" cy="11.6" r="1.05"/><circle cx="18.2" cy="14" r="1.05"/></svg>'
    }
  ];

  var eg = document.getElementById('entry-grid');
  if (eg) {
    ENTRIES.forEach(function (e) {
      var a = document.createElement('a');
      a.className = 'entry-card gcard rv';
      a.setAttribute('href', e.href);

      var ico = document.createElement('span');
      ico.className = 'entry-ico';
      ico.style.setProperty('--e1', e.e1);
      ico.style.setProperty('--e2', e.e2);
      ico.innerHTML = e.icon;
      a.appendChild(ico);

      var h = document.createElement('h3');
      h.textContent = e.title;
      a.appendChild(h);

      var p = document.createElement('p');
      p.textContent = e.desc;
      a.appendChild(p);

      var f = document.createElement('span');
      f.className = 'entry-foot';
      f.appendChild(document.createTextNode(e.stat + ' · 进入'));
      var w = document.createElement('span');
      w.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
      f.appendChild(w.firstChild);
      a.appendChild(f);

      eg.appendChild(a);
    });
    eg.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); });
  }

  /* SECTION: latest-articles */
  var latest = document.getElementById('latest-grid');
  if (latest) {
    var list = (DATA.ARTICLES || []).slice(0, 3);
    list.forEach(function (a) {
      var card = document.createElement('a');
      card.className = 'item-card gcard rv';
      card.setAttribute('href', a.file || B.itemUrl('article', a.id));
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener');

      var th = document.createElement('div');
      th.className = 'thumb';
      th.style.setProperty('--g1', a.g1 || '#3b4a63');
      th.style.setProperty('--g2', a.g2 || '#1b2432');
      var gl = document.createElement('span');
      gl.className = 'thumb-glyph';
      gl.textContent = a.image ? '' : (a.glyph || '◈');
      th.appendChild(gl);
      if (a.image) {
        var img = document.createElement('img');
        img.dataset.image = a.image;
        img.alt = a.title;
        img.loading = 'lazy';
        img.onerror = function () { img.style.display = 'none'; gl.textContent = a.glyph || '◈'; };
        img.src = img.dataset.image;
        th.appendChild(img);
      }
      var tag = document.createElement('span');
      tag.className = 'thumb-tag';
      tag.textContent = a.catLabel;
      th.appendChild(tag);
      var fl = document.createElement('span');
      fl.className = 'thumb-flag';
      fl.textContent = '待替换';
      th.appendChild(fl);
      card.appendChild(th);

      var body = document.createElement('div');
      body.className = 'item-body';
      var h = document.createElement('h3');
      h.textContent = a.title;
      body.appendChild(h);
      var m = document.createElement('div');
      m.className = 'item-meta';
      m.appendChild(document.createElement('span')).textContent = a.date;
      var sep = document.createElement('i');
      sep.textContent = '·';
      m.appendChild(sep);
      m.appendChild(document.createElement('span')).textContent = a.min + ' 分钟阅读';
      body.appendChild(m);
      var go = document.createElement('span');
      go.className = 'item-go';
      go.appendChild(document.createTextNode('阅读全文'));
      var w = document.createElement('span');
      w.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
      go.appendChild(w.firstChild);
      body.appendChild(go);
      card.appendChild(body);

      latest.appendChild(card);
    });
    latest.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); });
  }

  /* SECTION: hero-cta */
  var cta1 = document.getElementById('cta-photos');
  if (cta1) cta1.addEventListener('click', function () { window.location.href = 'photos.html'; });
  var cta2 = document.getElementById('cta-games');
  if (cta2) cta2.addEventListener('click', function () { window.location.href = 'games.html#stage'; });
})();
