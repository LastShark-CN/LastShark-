/* ============================================================
   LastShark 博客 · 全局日间 / 夜间主题
   - 在 <head> 中同步加载：首屏即确定主题，不会先闪一下深色
   - 偏好写入 localStorage，全站所有页面共享同一份选择
   - 切换按钮由本脚本自动创建并固定到右上角，
     因此各页面无需重复写按钮标记，也不依赖任何 id 查找
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'lastshark-theme';
  var root = document.documentElement;

  /* SECTION: store */
  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' ? 'light' : (v === 'dark' ? 'dark' : null);
    } catch (err) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (err) {}
  }

  /* 首屏立即应用，默认夜间 */
  root.setAttribute('data-theme', read() || 'dark');

  function isLight() { return root.getAttribute('data-theme') === 'light'; }

  /* SECTION: ui-refs */
  var btn = null;
  var label = null;

  function sync() {
    var dark = !isLight();
    if (btn) {
      btn.setAttribute('aria-checked', dark ? 'true' : 'false');
      btn.setAttribute('title', dark ? '当前夜间模式 · 点击切换到白天' : '当前白天模式 · 点击切换到夜间');
    }
    if (label) label.textContent = dark ? '夜间' : '白天';
  }

  /* SECTION: build-button */
  function build() {
    if (btn || !document.body) return;

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ttoggle ttoggle-fixed';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-label', '切换夜间模式与白天模式');

    var stars = document.createElement('span');
    stars.className = 'ttoggle-stars';
    stars.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 5; i++) stars.appendChild(document.createElement('i'));

    var clouds = document.createElement('span');
    clouds.className = 'ttoggle-clouds';
    clouds.setAttribute('aria-hidden', 'true');
    for (var j = 0; j < 2; j++) clouds.appendChild(document.createElement('i'));

    var knob = document.createElement('span');
    knob.className = 'ttoggle-knob';
    knob.setAttribute('aria-hidden', 'true');
    var sun = document.createElement('span');
    sun.className = 'ttoggle-sun';
    var moon = document.createElement('span');
    moon.className = 'ttoggle-moon';
    for (var k = 0; k < 3; k++) moon.appendChild(document.createElement('i'));
    knob.appendChild(sun);
    knob.appendChild(moon);

    label = document.createElement('span');
    label.className = 'ttoggle-text';

    btn.appendChild(stars);
    btn.appendChild(clouds);
    btn.appendChild(knob);
    btn.appendChild(label);

    btn.addEventListener('click', function () { API.toggle(); });
    document.body.appendChild(btn);
    sync();
  }

  /* SECTION: api */
  var API = {
    get: function () { return isLight() ? 'light' : 'dark'; },
    set: function (t) {
      var v = t === 'light' ? 'light' : 'dark';
      if (root.getAttribute('data-theme') === v) { sync(); return; }
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', v);
      write(v);
      sync();
      setTimeout(function () { root.classList.remove('theme-anim'); }, 640);
    },
    toggle: function () { API.set(isLight() ? 'dark' : 'light'); },
    /* 供需要自定义按钮外观的页面调用 */
    mount: build
  };
  window.BLOG_THEME = API;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
