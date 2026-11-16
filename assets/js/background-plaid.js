/* ============================================================
   LastShark 博客 · 阅读页背景（无限格纹）
   按用户提供的格纹着色器思路重写移植：
   - 保留 rot() 旋转、tex() 格纹判定、递归 uv 变换与 fog 衰减
   - 输出改为暗色主题（格纹发光叠加在黑底上），与站点玻璃质感统一
   - 除法加 epsilon 保护，避免 uv.y=0 时出现 inf/NaN
   - 分辨率按设备自适应，帧时间偏高时自动降档
   WebGL 不可用时退回 CSS 渐变背景（body.no-gl）。
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('bg-canvas');
  if (!cv) return;

  var gl = null;
  try {
    var opts = { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' };
    gl = cv.getContext('webgl', opts) || cv.getContext('experimental-webgl', opts);
  } catch (err) { gl = null; }

  function fallback() {
    document.body.classList.add('no-gl');
    cv.style.display = 'none';
  }
  if (!gl) { fallback(); return; }

  /* SECTION: shaders */
  var VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 iResolution;',
    'uniform float iTime;',
    'uniform vec2 iMouse;',
    'uniform float uBright;',
    'vec2 rot(vec2 p,float a){',
    '  float ca=cos(a),sa=sin(a);',
    '  return vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y);',
    '}',
    'vec3 tex(vec2 uv){',
    '  vec3 c=vec3(fract(uv.x),fract(uv.y),fract(uv.y));',
    '  if(mod(uv.x*2.0,2.0)<0.9) return vec3(0.0);',
    '  if(mod(uv.y,1.0)<0.9) return vec3(0.0);',
    '  return c;',
    '}',
    'void main(void){',
    '  float M=iTime*0.5;',
    '  float fog=1.0;',
    '  vec2 uv=2.0*(gl_FragCoord.xy/iResolution.xy)-1.0;',
    '  uv*=vec2(iResolution.x/iResolution.y,1.0);',
    '  uv=rot(uv,-iMouse.y*0.62);',
    '  vec3 c=vec3(0.0);',
    '  for(int i=0;i<15;i++){',
    '    float d=max(abs(uv.y/(float(i)+1.0)),1e-4);',
    '    c=tex(vec2(uv.x/d+M+iMouse.x*2.2,abs(uv.y)));',
    '    if(length(c)>0.5) break;',
    '    uv=uv.yx*1.3;',
    '    fog*=0.9;',
    '  }',
    '  float lit=clamp(c.x,0.0,1.0);',
    '  vec3 warm=vec3(1.00,0.60,0.28);',
    '  vec3 cool=vec3(0.40,0.84,1.00);',
    '  vec3 tint=mix(warm,cool,clamp(c.z,0.0,1.0));',
    '  vec3 col=tint*(0.22+0.78*lit)*fog*fog;',
    '  col+=vec3(0.010,0.014,0.024);',
    '  vec2 q=gl_FragCoord.xy/iResolution.xy;',
    '  col*=0.62+0.38*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.12);',
    '  col*=uBright;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(log || 'shader compile failed');
    }
    return s;
  }

  var prog;
  try {
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
  } catch (err) {
    fallback();
    return;
  }
  gl.useProgram(prog);

  /* SECTION: geometry */
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'iResolution');
  var uTime = gl.getUniformLocation(prog, 'iTime');
  var uMouse = gl.getUniformLocation(prog, 'iMouse');
  var uBright = gl.getUniformLocation(prog, 'uBright');

  /* SECTION: adaptive-scale */
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  var scale = isMobile ? 0.42 : 0.62;
  var MIN_SCALE = isMobile ? 0.24 : 0.32;

  function resize() {
    var w = Math.max(2, Math.round(window.innerWidth * scale));
    var h = Math.max(2, Math.round(window.innerHeight * scale));
    cv.width = w; cv.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }
  resize();
  var rt = null;
  window.addEventListener('resize', function () {
    if (rt) clearTimeout(rt);
    rt = setTimeout(resize, 180);
  });

  gl.uniform1f(uBright, isMobile ? 1.15 : 1.0);

  /* SECTION: pointer */
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  function pointer(e) {
    var cx = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    var cy = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    tmx = (cx / window.innerWidth) - 0.5;
    tmy = (cy / window.innerHeight) - 0.5;
  }
  window.addEventListener('pointermove', pointer, { passive: true });
  window.addEventListener('pointerdown', pointer, { passive: true });

  /* SECTION: loop */
  var t0 = performance.now(), frames = 0, accMs = 0, lastFrame = t0, visible = true, stopped = false;
  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible) lastFrame = performance.now();
  });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || stopped) return;
    var dt = now - lastFrame;
    lastFrame = now;
    if (reduce && frames > 0) return;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++; accMs += dt;
    if (frames >= 45) {
      if (accMs / frames > 40 && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale * 0.8);
        resize();
      }
      frames = 0; accMs = 0;
    }
  }
  requestAnimationFrame(frame);

  cv.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    stopped = true;
    document.body.classList.add('no-gl');
  }, false);
})();
