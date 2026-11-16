/* ============================================================
   LastShark 博客 · WebGL 体素线框背景
   由 Inigo Quilez 的 voxel lines 着色器思路重写移植，
   噪声纹理由脚本程序化生成（替代原 iChannel0）。
   WebGL 不可用时自动退回 CSS 渐变背景（body.no-gl）。
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
    'uniform sampler2D iChannel0;',
    'vec3 gro=vec3(0.0);',
    'float noise(in vec3 x){',
    '  vec3 i=floor(x);vec3 f=fract(x);',
    '  f=f*f*(3.0-2.0*f);',
    '  vec2 uv=(i.xy+vec2(37.0,17.0)*i.z)+f.xy;',
    '  vec2 rg=texture2D(iChannel0,(uv+0.5)/256.0).yx;',
    '  return mix(rg.x,rg.y,f.z);',
    '}',
    'float mapTerrain(vec3 p){',
    '  p*=0.1;p.xz*=0.6;',
    '  float time=0.5+0.15*iTime;',
    '  float ft=fract(time);float it=floor(time);',
    '  ft=smoothstep(0.7,1.0,ft);time=it+ft;',
    '  float spe=1.4;float f;',
    '  f =0.5000*noise(p*1.00+vec3(0.0,1.0,0.0)*spe*time);',
    '  f+=0.2500*noise(p*2.02+vec3(0.0,2.0,0.0)*spe*time);',
    '  f+=0.1250*noise(p*4.01);',
    '  return 25.0*f-10.0;',
    '}',
    'float map(in vec3 c){',
    '  vec3 p=c+0.5;',
    '  float f=mapTerrain(p)+0.25*p.y;',
    '  f=mix(f,1.0,step(length(gro-p),5.0));',
    '  return step(f,0.5);',
    '}',
    'const vec3 lig=normalize(vec3(-0.4,0.3,0.7));',
    'float raycast(in vec3 ro,in vec3 rd,out vec3 oVos,out vec3 oDir){',
    '  vec3 pos=floor(ro);vec3 ri=1.0/rd;vec3 rs=sign(rd);',
    '  vec3 dis=(pos-ro+0.5+rs*0.5)*ri;',
    '  float res=-1.0;vec3 mm=vec3(0.0);',
    '  for(int i=0;i<110;i++){',
    '    if(map(pos)>0.5){res=1.0;break;}',
    '    mm=step(dis.xyz,dis.yzx)*step(dis.xyz,dis.zxy);',
    '    dis+=mm*rs*ri;pos+=mm*rs;',
    '  }',
    '  vec3 vos=pos;',
    '  vec3 mini=(pos-ro+0.5-0.5*vec3(rs))*ri;',
    '  float t=max(mini.x,max(mini.y,mini.z));',
    '  oDir=mm;oVos=vos;',
    '  return t*res;',
    '}',
    'vec3 path(float t,float ya){',
    '  vec2 p=100.0*sin(0.02*t*vec2(1.0,1.2)+vec2(0.1,0.9));',
    '  p+=50.0*sin(0.04*t*vec2(1.3,1.0)+vec2(1.0,4.5));',
    '  return vec3(p.x,18.0+ya*4.0*sin(0.05*t),p.y);',
    '}',
    'mat3 setCamera(in vec3 ro,in vec3 ta,float cr){',
    '  vec3 cw=normalize(ta-ro);',
    '  vec3 cp=vec3(sin(cr),cos(cr),0.0);',
    '  vec3 cu=normalize(cross(cw,cp));',
    '  vec3 cv2=normalize(cross(cu,cw));',
    '  return mat3(cu,cv2,-cw);',
    '}',
    'float maxcomp(in vec4 v){return max(max(v.x,v.y),max(v.z,v.w));}',
    'float isEdge(in vec2 uv,vec4 va,vec4 vb,vec4 vc,vec4 vd){',
    '  vec2 st=1.0-uv;',
    '  vec4 wb=smoothstep(0.85,0.99,vec4(uv.x,st.x,uv.y,st.y))*(1.0-va+va*vc);',
    '  vec4 wc=smoothstep(0.85,0.99,vec4(uv.x*uv.y,st.x*uv.y,st.x*st.y,uv.x*st.y))*(1.0-vb+vd*vb);',
    '  return maxcomp(max(wb,wc));',
    '}',
    'vec3 render(in vec3 ro,in vec3 rd){',
    '  vec3 col=vec3(0.0);',
    '  vec3 vos,dir;',
    '  float t=raycast(ro,rd,vos,dir);',
    '  if(t>0.0){',
    '    vec3 nor=-dir*sign(rd);',
    '    vec3 pos=ro+rd*t;',
    '    vec3 uvw=pos-vos;',
    '    vec3 v1=vos+nor+dir.yzx;vec3 v2=vos+nor-dir.yzx;',
    '    vec3 v3=vos+nor+dir.zxy;vec3 v4=vos+nor-dir.zxy;',
    '    vec3 v5=vos+nor+dir.zxy+dir.yzx;vec3 v6=vos+nor-dir.zxy+dir.yzx;',
    '    vec3 v7=vos+nor-dir.zxy-dir.yzx;vec3 v8=vos+nor+dir.zxy-dir.yzx;',
    '    vec3 v9=vos+dir.yzx;vec3 v10=vos-dir.yzx;',
    '    vec3 v11=vos+dir.zxy;vec3 v12=vos-dir.zxy;',
    '    vec3 v13=vos+dir.yzx+dir.zxy;vec3 v14=vos-dir.yzx+dir.zxy;',
    '    vec3 v15=vos-dir.yzx-dir.zxy;vec3 v16=vos+dir.yzx-dir.zxy;',
    '    vec4 vc=vec4(map(v1),map(v2),map(v3),map(v4));',
    '    vec4 vd=vec4(map(v5),map(v6),map(v7),map(v8));',
    '    vec4 va=vec4(map(v9),map(v10),map(v11),map(v12));',
    '    vec4 vb=vec4(map(v13),map(v14),map(v15),map(v16));',
    '    vec2 uv=vec2(dot(dir.yzx,uvw),dot(dir.zxy,uvw));',
    '    float www=1.0-isEdge(uv,va,vb,vc,vd);',
    '    vec3 wir=smoothstep(0.4,0.5,abs(uvw-0.5));',
    '    float vvv=(1.0-wir.x*wir.y)*(1.0-wir.x*wir.z)*(1.0-wir.y*wir.z);',
    '    col=vec3(0.5);',
    '    col+=0.8*vec3(0.1,0.3,0.4);',
    '    col*=1.0-0.75*(1.0-vvv)*www;',
    '    float dif=clamp(dot(nor,lig),0.0,1.0);',
    '    float bac=clamp(dot(nor,normalize(lig*vec3(-1.0,0.0,-1.0))),0.0,1.0);',
    '    float sky=0.5+0.5*nor.y;',
    '    float amb=clamp(0.75+pos.y/25.0,0.0,1.0);',
    '    vec2 st=1.0-uv;',
    '    vec4 wa=vec4(uv.x,st.x,uv.y,st.y)*vc;',
    '    vec4 wb2=vec4(uv.x*uv.y,st.x*uv.y,st.x*st.y,uv.x*st.y)*vd*(1.0-vc.xzyw)*(1.0-vc.zywx);',
    '    float occ=wa.x+wa.y+wa.z+wa.w+wb2.x+wb2.y+wb2.z+wb2.w;',
    '    occ=1.0-occ/8.0;occ=occ*occ;occ=occ*occ;occ*=amb;',
    '    vec3 lin=vec3(0.0);',
    '    lin+=2.5*dif*vec3(1.00,0.90,0.70)*(0.5+0.5*occ);',
    '    lin+=0.5*bac*vec3(0.15,0.10,0.10)*occ;',
    '    lin+=2.0*sky*vec3(0.40,0.30,0.15)*occ;',
    '    float lineglow=0.0;',
    '    lineglow+=smoothstep(0.4,1.0,uv.x)*(1.0-va.x*(1.0-vc.x));',
    '    lineglow+=smoothstep(0.4,1.0,1.0-uv.x)*(1.0-va.y*(1.0-vc.y));',
    '    lineglow+=smoothstep(0.4,1.0,uv.y)*(1.0-va.z*(1.0-vc.z));',
    '    lineglow+=smoothstep(0.4,1.0,1.0-uv.y)*(1.0-va.w*(1.0-vc.w));',
    '    lineglow+=smoothstep(0.4,1.0,uv.y*uv.x)*(1.0-vb.x*(1.0-vd.x));',
    '    lineglow+=smoothstep(0.4,1.0,uv.y*(1.0-uv.x))*(1.0-vb.y*(1.0-vd.y));',
    '    lineglow+=smoothstep(0.4,1.0,(1.0-uv.y)*(1.0-uv.x))*(1.0-vb.z*(1.0-vd.z));',
    '    lineglow+=smoothstep(0.4,1.0,(1.0-uv.y)*uv.x)*(1.0-vb.w*(1.0-vd.w));',
    '    vec3 linCol=2.0*vec3(5.0,0.6,0.0);',
    '    linCol*=(0.5+0.5*occ)*0.5;',
    '    lin+=lineglow*linCol;',
    '    col=col*lin;',
    '    col+=8.0*linCol*vec3(1.0,2.0,3.0)*(1.0-www);',
    '    col+=0.1*lineglow*linCol;',
    '    col*=min(0.12,exp(-0.062*t));',
    '    vec3 col2=vec3(1.3)*(0.5+0.5*nor.y)*occ*exp(-0.045*t);',
    '    float mi=cos(-0.7+0.5*iTime);',
    '    mi=smoothstep(0.70,0.75,mi);',
    '    col=mix(col,col2,mi*0.85);',
    '  }',
    '  col=pow(max(col,vec3(0.0)),vec3(0.45));',
    '  return col;',
    '}',
    'void main(void){',
    '  vec2 fragCoord=gl_FragCoord.xy;',
    '  vec2 p=(2.0*fragCoord-iResolution.xy)/min(iResolution.x,iResolution.y);',
    '  vec2 mo=iMouse;',
    '  float time=2.0*iTime+50.0*mo.x;',
    '  float cr=0.2*cos(0.1*iTime);',
    '  vec3 ro=path(time,1.0);',
    '  vec3 ta=path(time+5.0,1.0)-vec3(0.0,6.0,0.0);',
    '  gro=ro;',
    '  mat3 cam=setCamera(ro,ta,cr);',
    '  float r2=p.x*p.x*0.32+p.y*p.y;',
    '  p*=(7.0-sqrt(max(0.0,37.5-11.5*r2)))/(r2+1.0);',
    '  vec3 rd=normalize(cam*vec3(p.xy,-2.5));',
    '  vec3 col=render(ro,rd);',
    '  vec2 q=fragCoord/iResolution.xy;',
    '  col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.1);',
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

  /* SECTION: noise-texture */
  var N = 256, data = new Uint8Array(N * N * 4);
  for (var i = 0; i < N * N; i++) {
    data[i * 4] = (Math.random() * 256) | 0;
    data[i * 4 + 1] = (Math.random() * 256) | 0;
    data[i * 4 + 2] = (Math.random() * 256) | 0;
    data[i * 4 + 3] = 255;
  }
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(gl.getUniformLocation(prog, 'iChannel0'), 0);

  var uRes = gl.getUniformLocation(prog, 'iResolution');
  var uTime = gl.getUniformLocation(prog, 'iTime');
  var uMouse = gl.getUniformLocation(prog, 'iMouse');
  var uBright = gl.getUniformLocation(prog, 'uBright');

  /* SECTION: adaptive-scale */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  var scale = isMobile ? 0.30 : 0.46;
  var MIN_SCALE = isMobile ? 0.18 : 0.26;
  var W = 0, H = 0;

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    W = Math.max(2, Math.round(w * scale));
    H = Math.max(2, Math.round(h * scale));
    cv.width = W; cv.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(uRes, W, H);
  }
  resize();
  var rt = null;
  window.addEventListener('resize', function () {
    if (rt) clearTimeout(rt);
    rt = setTimeout(resize, 180);
  });

  gl.uniform1f(uBright, isMobile ? 2.35 : 1.95);

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
    mx += (tmx - mx) * 0.045;
    my += (tmy - my) * 0.045;
    gl.uniform2f(uMouse, mx + window.pageYOffset * 0.00012, my);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++; accMs += dt;
    if (frames >= 45) {
      var avg = accMs / frames;
      if (avg > 42 && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale * 0.78);
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
