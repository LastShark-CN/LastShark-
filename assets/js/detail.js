/* ============================================================
   LastShark 博客 · 详情页
   读取 ?type=article|mod|game&id=N，渲染标题、图片与占位正文。
   type=mod 时额外显示版本规格与下载按钮。
   ============================================================ */
(function () {
  'use strict';

  var B = window.BLOG;
  if (!B) return;
  var DATA = B.data;

  var params = new URLSearchParams(window.location.search);
  var type = params.get('type') || 'article';
  var id = params.get('id');

  /* 文章已改为每篇一个独立文件，旧链接自动转到对应文件 */
  if (type === 'article') {
    var hit = (DATA.ARTICLES || []).filter(function (a) { return String(a.id) === String(id); })[0];
    window.location.replace(hit && hit.file ? hit.file : 'articles.html');
    return;
  }

  var SRC = {
    article: { list: DATA.ARTICLES || [], back: 'articles.html', backLabel: '返回文章列表', crumb: '文章', name: function (x) { return x.title; } },
    mod: { list: DATA.MODS || [], back: 'mods.html', backLabel: '返回模组列表', crumb: '我的世界模组', name: function (x) { return x.name; } },
    game: { list: DATA.GAMES || [], back: 'games.html', backLabel: '返回小游戏', crumb: '小游戏', name: function (x) { return x.name; } }
  }[type];

  var main = document.getElementById('detail-main');
  var side = document.getElementById('detail-side');
  var crumbTitle = document.getElementById('crumb-title');

  function notFound(msg) {
    document.title = '未找到内容 · LastShark';
    if (crumbTitle) crumbTitle.textContent = '未找到内容';
    if (main) {
      main.innerHTML = '';
      var w = document.createElement('div');
      w.className = 'empty';
      var b = document.createElement('b');
      b.textContent = msg || '没有匹配的内容';
      var s = document.createElement('span');
      s.textContent = '请检查链接参数，或返回列表页重新选择。';
      w.appendChild(b); w.appendChild(s);
      main.appendChild(w);
      var back = document.createElement('a');
      back.className = 'btn btn-ghost';
      back.setAttribute('href', SRC ? SRC.back : 'index.html');
      back.textContent = SRC ? SRC.backLabel : '返回首页';
      main.appendChild(back);
    }
  }

  if (!SRC) { notFound('未知的内容类型'); return; }

  var item = SRC.list.filter(function (x) { return String(x.id) === String(id); })[0];
  if (!item) { notFound('没有找到编号为 ' + (id || '空') + ' 的内容'); return; }

  document.title = SRC.name(item) + ' · LastShark';
  if (crumbTitle) crumbTitle.textContent = SRC.name(item);

  /* SECTION: hero-image */
  var hero = document.getElementById('detail-hero');
  if (hero) {
    hero.style.setProperty('--g1', item.g1 || '#3b4a63');
    hero.style.setProperty('--g2', item.g2 || '#1b2432');
    var gl = document.createElement('span');
    gl.className = 'thumb-glyph';
    gl.textContent = item.image ? '' : (item.glyph || '◈');
    hero.appendChild(gl);
    if (item.image) {
      var img = document.createElement('img');
      img.dataset.image = item.image;
      img.alt = SRC.name(item);
      img.onerror = function () { img.style.display = 'none'; gl.textContent = item.glyph || '◈'; };
      img.src = img.dataset.image;
      hero.appendChild(img);
    }
  }

  /* SECTION: title-meta */
  var tt = document.getElementById('detail-title');
  if (tt) tt.textContent = SRC.name(item);

  var meta = document.getElementById('detail-meta');
  if (meta) {
    var chips = type === 'article'
      ? [item.catLabel, item.date, item.min + ' 分钟阅读']
      : type === 'mod'
        ? ['MC ' + item.mc, item.loader, item.ver]
        : [item.live ? '站内可玩' : '内容待补全'];
    chips.forEach(function (t) {
      meta.appendChild(document.createElement('span')).textContent = t;
    });
  }

  /* SECTION: body */
  var body = document.getElementById('detail-body');
  if (body) {
    if (item.sum) {
      var lead = document.createElement('p');
      lead.textContent = item.sum;
      body.appendChild(lead);
    }
    (item.body || []).forEach(function (t) {
      body.appendChild(document.createElement('p')).textContent = t;
    });
    var ph = document.createElement('div');
    ph.className = 'ph-block';
    ph.textContent = '内容占位区：把 data.js 里这一项的 body 数组替换成你的实际内容即可，段落数量不限。';
    body.appendChild(ph);
  }

  /* SECTION: actions */
  var acts = document.getElementById('detail-acts');
  if (acts) {
    acts.innerHTML = '';
    if (type === 'mod') {
      var dl = document.createElement('a');
      dl.className = 'btn btn-primary';
      if (item.download) {
        var isRemote = /^https?:/i.test(item.download);
        dl.setAttribute('href', item.download);
        if (isRemote) {
          dl.setAttribute('target', '_blank');
          dl.setAttribute('rel', 'noopener');
        } else {
          /* 站内文件直接触发下载，文件名保留原始名称 */
          dl.setAttribute('download', item.download.split('/').pop());
        }
        dl.textContent = '下载 ' + item.ver;
      } else {
        dl.setAttribute('href', '#');
        dl.textContent = '下载 ' + item.ver;
        dl.addEventListener('click', function (e) {
          e.preventDefault();
          B.toast('下载链接待补全：「' + item.name + '」');
        });
      }
      acts.appendChild(dl);

      var src = document.createElement('a');
      src.className = 'btn btn-ghost';
      src.setAttribute('href', '#');
      if (item.source === '本地原创') {
        src.textContent = '安装说明';
        src.addEventListener('click', function (e) {
          e.preventDefault();
          B.toast('Forge ' + item.mc + '：把 .jar 放入 mods 文件夹后启动游戏即可');
        });
      } else {
        src.textContent = '源码 / 发布页';
        src.addEventListener('click', function (e) {
          e.preventDefault();
          B.toast('发布页链接待补全：' + (item.source || ''));
        });
      }
      acts.appendChild(src);
    } else if (type === 'game' && item.live && item.play) {
      var play = document.createElement('a');
      play.className = 'btn btn-primary';
      play.setAttribute('href', item.play);
      play.textContent = '立即试玩';
      acts.appendChild(play);
    }
    var back = document.createElement('a');
    back.className = 'btn btn-ghost';
    back.setAttribute('href', SRC.back);
    back.textContent = SRC.backLabel;
    acts.appendChild(back);
  }

  /* SECTION: specs */
  var specs = document.getElementById('detail-specs');
  if (specs && type !== 'mod') specs.style.display = 'none';
  if (specs && type === 'mod') {
    specs.innerHTML = '';
    specs.appendChild(document.createElement('h3')).textContent = '版本信息';
    specs.querySelector('h3').className = 'side-title';
    var dl = document.createElement('dl');
    dl.style.margin = '0';
    dl.style.display = 'grid';
    dl.style.gap = '12px';
    [
      ['游戏版本', 'MC ' + item.mc],
      ['加载器', item.loader],
      ['模组版本', item.ver],
      ['来源', item.source || '待补充']
    ].forEach(function (row) {
      var wrap = document.createElement('div');
      wrap.className = 'spec-row';
      var dt = document.createElement('dt');
      dt.textContent = row[0];
      var dd = document.createElement('dd');
      dd.textContent = row[1];
      wrap.appendChild(dt); wrap.appendChild(dd);
      dl.appendChild(wrap);
    });
    specs.appendChild(dl);
  }

  /* SECTION: siblings */
  var sib = document.getElementById('detail-siblings');
  if (sib) {
    sib.innerHTML = '';
    var title = document.createElement('h3');
    title.className = 'side-title';
    title.textContent = type === 'article' ? '其他文章' : type === 'mod' ? '其他模组' : '其他小游戏';
    sib.appendChild(title);

    var listBox = document.createElement('div');
    listBox.className = 'side-list';
    var others = SRC.list.filter(function (x) { return String(x.id) !== String(item.id); }).slice(0, 4);
    if (!others.length) {
      listBox.appendChild(document.createElement('span')).textContent = '暂无其他内容';
    }
    others.forEach(function (o) {
      var a = document.createElement('a');
      a.className = 'side-item';
      a.setAttribute('href', B.detailUrl(type, o.id));
      var ico = document.createElement('span');
      ico.className = 'side-ico';
      ico.style.setProperty('--g1', o.g1 || '#3b4a63');
      ico.style.setProperty('--g2', o.g2 || '#1b2432');
      if (o.image) {
        var im = document.createElement('img');
        im.dataset.image = o.image;
        im.alt = '';
        im.loading = 'lazy';
        im.onerror = function () { im.style.display = 'none'; };
        im.src = im.dataset.image;
        ico.appendChild(im);
      }
      var gs = document.createElement('span');
      gs.textContent = o.image ? '' : (o.glyph || '◈');
      ico.appendChild(gs);
      a.appendChild(ico);

      var txt = document.createElement('span');
      txt.className = 'side-txt';
      var bb = document.createElement('b');
      bb.textContent = SRC.name(o);
      txt.appendChild(bb);
      var ii = document.createElement('i');
      ii.textContent = type === 'article' ? o.date : type === 'mod' ? ('MC ' + o.mc + ' · ' + o.ver) : (o.live ? '站内可玩' : '待补全');
      txt.appendChild(ii);
      a.appendChild(txt);
      listBox.appendChild(a);
    });
    sib.appendChild(listBox);
  }
})();
