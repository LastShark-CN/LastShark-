/* ============================================================
   LastShark 博客 · 数据文件
   所有需要补全的内容都集中在这里：
   - SITE    站点基本信息
   - PHOTOS  照片墙（image 填公网图片地址后自动替换渐变占位）
   - ARTICLES 文章（简易标题 + 图片，点击跳转 detail.html）
   - MODS   我的世界模组（简易标题 + 图片，点击跳转 detail.html）
   - GAMES  小游戏（简易标题 + 图片，点击跳转 detail.html）
   字段说明见每项注释。
   ============================================================ */
(function (global) {
  'use strict';

  /* SECTION: site */
  var SITE = {
    name: 'LastShark',
    tagline: '摄影 · 写作 · 模组 · 小游戏',
    status: '框架已就绪 · 内容待补全',
    heroTitleA: 'Last',
    heroTitleB: 'Shark',
    heroDesc: '这里是个人博客的骨架版本：照片墙、文章、我的世界模组与小游戏四个板块已拆成独立页面，正文、图片与下载链接都留了明确占位，替换 data.js 即可上线。',
    heroChips: ['摄影 / 写作', 'Minecraft Modding', '独立小游戏'],
    footer: '© LastShark · 多页个人博客框架'
  };

  /* SECTION: photos */
  /* image: 填图片公网地址（留空则显示渐变占位）
     rot/dy/pw/gap: 不规则排布参数，可微调
     ar: 照片比例；stack: 是否叠压在前一张上；dark: 深色相纸；taped: 用胶带固定 */
  var PHOTO_BASE = [
    { ar: '1/1',   pw: 210, g1: '#4b6b8f', g2: '#1a2434' },
    { ar: '4/5',   pw: 240, g1: '#c98b52', g2: '#4a2c17' },
    { ar: '3/4',   pw: 196, g1: '#5d8a6b', g2: '#1c2f26' },
    { ar: '16/10', pw: 286, g1: '#8a6fa8', g2: '#2a1f3d' },
    { ar: '5/4',   pw: 224, g1: '#c2686b', g2: '#3a1c20' },
    { ar: '3/4',   pw: 206, g1: '#4f9aa8', g2: '#152c33' },
    { ar: '1/1',   pw: 252, g1: '#b0924e', g2: '#33290f' },
    { ar: '4/5',   pw: 232, g1: '#6d7f9c', g2: '#20283a' },
    { ar: '16/10', pw: 278, g1: '#a85f7d', g2: '#33161f' },
    { ar: '1/1',   pw: 200, g1: '#5fa88a', g2: '#152e26' },
    { ar: '5/4',   pw: 244, g1: '#9a7050', g2: '#2e1e13' },
    { ar: '3/4',   pw: 192, g1: '#5b7fb0', g2: '#161f30' },
    { ar: '4/5',   pw: 258, g1: '#b58445', g2: '#33230d' },
    { ar: '1/1',   pw: 222, g1: '#6a9c78', g2: '#1b2a20' }
  ];
  /* 用 assets/pictures/ 下的真实图片替换照片墙槽位。
     thumb 为照片墙/列表用的小图（长边 720px，约 0.8MB 总量），
     large 为灯箱预览用的中图（长边 1600px），原图留在 assets/pictures/ 不直接加载。 */
  var PHOTO_OVERRIDE = {
    1: {
      image: 'assets/pictures/thumbs/image.jpg',
      large: 'assets/pictures/large/image.jpg',
      ar: '3/4',
      title: '插画 · 紫苑色的午后',
      meta: '2026 · 收藏',
      desc: '粉发双马尾的女仆装插画，淡紫与白的色调，背景散落着时钟数字。'
    },
    2: {
      image: 'assets/pictures/thumbs/image-3.jpg',
      large: 'assets/pictures/large/image-3.jpg',
      ar: '2/3',
      title: '插画 · 持镰的少女',
      meta: '2026 · 收藏',
      desc: '黑发红缎带的 Q 版少女，扛着一柄比人还高的黑镰，红黑洋装配高跟鞋。'
    },
    3: {
      image: 'assets/pictures/thumbs/Image_1767156304943_851.jpg',
      large: 'assets/pictures/large/Image_1767156304943_851.jpg',
      ar: '16/11',
      title: '插画 · 圣诞礼物堆',
      meta: '2026 · 收藏',
      desc: '蓝发双马尾的少女抱着礼物盒坐在圣诞树旁，四周垂着星星挂饰。'
    },
    4: {
      image: 'assets/pictures/thumbs/Image_1767398581226_492.jpg',
      large: 'assets/pictures/large/Image_1767398581226_492.jpg',
      ar: '4/3',
      title: '插画 · 花火夜行',
      meta: '2026 · 收藏',
      desc: '烟花夜空下回眸的少女，青绿长发随风铺开，手持折扇，衣摆缀着绒花。'
    },
    5: {
      image: 'assets/pictures/thumbs/IMG20260108113054.jpg',
      large: 'assets/pictures/large/IMG20260108113054.jpg',
      ar: '4/3',
      title: '手办 · 展柜近拍',
      meta: '2026-01-08 · 实拍',
      desc: '展柜里的古风手办近景：红衣广袖、白玉双兔底座，背后是戏曲人物圆框画。'
    },
    6: {
      image: 'assets/pictures/thumbs/IMG20260108113058.jpg',
      large: 'assets/pictures/large/IMG20260108113058.jpg',
      ar: '4/3',
      title: '手办 · 展柜全景',
      meta: '2026-01-08 · 实拍',
      desc: '同一尊手办的亚克力展示盒全景，粉色樱花背景板与云纹装饰完整入镜。'
    },
    7: {
      image: 'assets/pictures/thumbs/IMG20260108113103.jpg',
      large: 'assets/pictures/large/IMG20260108113103.jpg',
      ar: '4/3',
      title: '手办 · 俯视角度',
      meta: '2026-01-08 · 实拍',
      desc: '从展示盒顶部俯拍的视角，能看清手办的坐姿动线与底座纹样。'
    }
  };
  var PHOTOS = PHOTO_BASE.map(function (p, i) {
    var o = {
      id: i + 1,
      no: (i < 9 ? '0' : '') + (i + 1),
      title: '照片标题占位 ' + (i + 1),
      meta: '2026 · 地点占位',
      desc: '照片说明占位：替换成这张照片的拍摄背景或想记录的一句话。',
      image: '',
      ar: p.ar, pw: p.pw, g1: p.g1, g2: p.g2,
      rot: (((i * 37) % 17) - 8) * 0.72,
      dy: (((i * 53) % 9) - 4) * 7,
      gap: 6 + ((i * 29) % 13),
      stack: i % 4 === 3,
      overlap: -(18 + ((i * 17) % 26)),
      dark: i % 5 === 2,
      taped: i % 3 === 1,
      tape: ((i * 23) % 13) - 6
    };
    /* 单张覆盖：用 assets/pictures/ 下的本地图替换指定槽位的占位 */
    var ov = PHOTO_OVERRIDE[o.id];
    if (ov) { for (var k in ov) { if (Object.prototype.hasOwnProperty.call(ov, k)) o[k] = ov[k]; } }
    return o;
  });

  /* SECTION: articles */
  /* 每篇文章都是一个独立的 HTML 文件，放在 articles/ 目录下：
     - file: 文章文件路径（相对站点根目录），列表卡片点击后在新标签页打开
     - image: 封面图地址（留空显示渐变占位）
     这里只保留列表页展示需要的字段（标题、分类、日期、封面），
     正文与章节写在各自的 HTML 文件里，不再经过 id 查询或数据拼装。
     新增文章：在 articles/ 下建一个 HTML 文件，再在这个数组里加一条即可。 */
  var ARTICLES = [
    {
      id: 1, cat: 'tech', catLabel: '技术', date: '2026-11-08', min: 8,
      title: '用 WebGL 把体素地形做成网页背景',
      sum: '记录一次着色器移植：噪声纹理怎么生成、DDA 光线步进的性能取舍，以及移动端如何自适应降分辨率。',
      tags: ['WebGL', 'GLSL'], image: '', g1: '#4f9aa8', g2: '#152c33', glyph: '◈',
      file: 'articles/webgl-voxel-background.html'
    },
    {
      id: 2, cat: 'photo', catLabel: '摄影', date: '2026-10-22', min: 6,
      title: '城市夜拍的三次失败与一次侥幸',
      sum: '同一台机器、同一个路口，三次曝光全废，第四次却因为一列进站的地铁拿到了想要的画面。',
      tags: ['夜景', '街拍'], image: '', g1: '#c98b52', g2: '#4a2c17', glyph: '◉',
      file: 'articles/night-street-photo.html'
    },
    {
      id: 3, cat: 'game', catLabel: '游戏', date: '2026-09-30', min: 11,
      title: '给 Minecraft 写第一个模组时踩的坑',
      sum: '从环境搭建到事件注册，把新手最容易卡住的几个点整理成清单，省掉反复翻文档的时间。',
      tags: ['Mod', 'Java'], image: '', g1: '#8a6fa8', g2: '#2a1f3d', glyph: '▣',
      file: 'articles/minecraft-first-mod.html'
    },
    {
      id: 4, cat: 'life', catLabel: '生活', date: '2026-08-14', min: 4,
      title: '把书桌搬到窗边之后的一个月',
      sum: '光线变了，作息也跟着变了。这是一篇关于环境如何悄悄改写习惯的短记录。',
      tags: ['随笔'], image: '', g1: '#5d8a6b', g2: '#1c2f26', glyph: '◇',
      /* 短文示例：全文只有一章，目录里仍然显示这一章的标题 */
      file: 'articles/desk-by-window.html'
    },
    {
      id: 5, cat: 'tech', catLabel: '技术', date: '2026-07-05', min: 9,
      title: '多页博客拆分之后，维护成本降了多少',
      sum: '把单文件拆成 HTML + CSS + JS 多页结构的实测记录：改一处样式要动几个文件，值不值得。',
      tags: ['前端', 'HTML'], image: '', g1: '#5b7fb0', g2: '#161f30', glyph: '◆',
      file: 'articles/multipage-blog-split.html'
    },
    {
      id: 6, cat: 'photo', catLabel: '摄影', date: '2026-06-11', min: 7,
      title: '如何把杂乱的照片排成一面墙',
      sum: '错落、旋转、重叠——不规则排列其实有规律可循，关键是控制视觉重心的分布。',
      tags: ['排版', '视觉'], image: '', g1: '#b58445', g2: '#33230d', glyph: '▤',
      file: 'articles/photo-wall-layout.html'
    }
  ];
  var ARTICLE_CATS = [
    { key: 'all', label: '全部' },
    { key: 'tech', label: '技术' },
    { key: 'life', label: '生活' },
    { key: 'game', label: '游戏' },
    { key: 'photo', label: '摄影' }
  ];

  /* SECTION: mods */
  /* download: 下载地址。站内文件（如 assets/mods/ 下的 .jar）会被当作本地下载处理；
     外部 http(s) 地址则在新标签页打开。留空时按钮只提示待补全。 */
  var MODS = [
    {
      id: 1, name: '炼金工艺', mc: '1.20.1', loader: 'Forge', ver: '1.0.0-r13',
      sum: '原创模组：黑金剑、5×5 超级工作台与星陨遗迹军械库。当九重星轨坠入熔炉，炼金术士将星辰的尸骸锻成了剑。',
      image: 'assets/mods/alchemy-icon.png', g1: '#3d3350', g2: '#141021', glyph: '⚗',
      download: 'assets/mods/炼金工艺1.0.0.jar', source: '本地原创',
      body: [
        '【黑金剑】基础伤害 9178、攻速 1.6，右键劈出贯穿 32 格的黑金剑气。',
        '【超级工作台】5×5 锻造台，强力兵刃各有专属的 5×5 铸法，武器越强越难铸，虚空结晶只认终焉之刃。',
        '【星陨遗迹军械库】星尘剑、遗迹大剑、湮灭、降临、天使圣裁、荒芜、黎明之光七柄兵刃，星尘与遗迹两套护甲、朝圣者镇守的遗迹，以及星轨、圣裁与黑洞等华丽特效。',
        '凡人以血肉挑战概念，而概念早已在熔炉旁等候多时。'
      ]
    },
    {
      id: 2, name: '结构日志', mc: '1.20.4', loader: 'NeoForge', ver: 'v1.1.0',
      sum: '在世界中记录你探索过的结构与坐标，支持导出成清单。示例条目，待替换。',
      image: '', g1: '#4a7f9b', g2: '#152c40', glyph: '🧭', download: '', source: '本地构建',
      body: ['模组介绍占位：功能列表与使用方式。', '第二段占位：导出格式示例。']
    },
    {
      id: 3, name: '像素光影轻量版', mc: '1.19.2', loader: 'Fabric', ver: 'v0.9.7',
      sum: '为低配机器优化的光影方案，保留体积光但砍掉昂贵反射。示例条目，待替换。',
      image: '', g1: '#9b7a4a', g2: '#3a2a12', glyph: '☀', download: '', source: '本地构建',
      body: ['模组介绍占位：性能数据与画质取舍。', '第二段占位：推荐设置档位。']
    },
    {
      id: 4, name: '背包整理器', mc: '1.21.1', loader: 'Fabric', ver: 'v2.0.1',
      sum: '一键排序、自动补堆叠、按模组归类，附可配置的快捷键。示例条目，待替换。',
      image: '', g1: '#8a5fa8', g2: '#2c1a40', glyph: '🎒', download: '', source: '本地构建',
      body: ['模组介绍占位：快捷键与配置文件位置。', '第二段占位：常见问题。']
    }
  ];

  /* SECTION: games */
  /* live: true 表示站内可直接试玩；
     page: 独立介绍页地址（新标签页打开），用于有下载或长文介绍的游戏；
     两者可同时存在：卡片优先跳介绍页，介绍页内再提供试玩入口。 */
  var GAMES = [
    {
      id: 1, name: '方块矿工', sum: '内置可试玩：接住矿石得分，躲开 TNT，爱心回血。',
      image: '', g1: '#c98b52', g2: '#4a2c17', glyph: '◆', live: true, play: 'games.html#stage',
      body: ['玩法说明占位：计分规则、难度曲线与操作方式。', '第二段占位：后续计划（新道具、排行榜）。']
    },
    {
      id: 2, name: 'Shoot Demo', sum: '简单射击小游戏，半成品（0.1.1-alpha）。分卷下载，仅限 Windows 10 及以上。',
      image: '', g1: '#7a3a3a', g2: '#241014', glyph: '✛', live: false, play: '',
      page: 'shoot-demo.html',
      win: true, ver: '0.1.1-alpha', size: '312.3 MB · 32 分卷',
      body: [
        '一款简单的射击小游戏：移动、瞄准、开火，清掉屏幕上的目标。',
        '目前为半成品，版本号 0.1.1-alpha；关卡与数值只做到能跑通的程度。',
        '下载为 32 个分卷压缩包，需集齐后合并解压；仅支持 Windows 10 及以上系统。'
      ]
    },
    {
      id: 3, name: '像素跑酷', sum: '横向卷轴跳跃，关卡编辑器待补全。',
      image: '', g1: '#5d8a6b', g2: '#1c2f26', glyph: '▣', live: false, play: '',
      body: ['游戏介绍占位：操作方式与关卡设计。']
    },
    {
      id: 4, name: '记忆翻牌', sum: '经典配对玩法，主题素材待补全。',
      image: '', g1: '#8a6fa8', g2: '#2a1f3d', glyph: '◈', live: false, play: '',
      body: ['游戏介绍占位：难度分级与计时规则。']
    },
    {
      id: 5, name: '方块消除', sum: '同色连消，计分与音效待补全。',
      image: '', g1: '#4f9aa8', g2: '#152c33', glyph: '◉', live: false, play: '',
      body: ['游戏介绍占位：消除规则与连击设计。']
    }
  ];

  /* SECTION: export */
  global.BLOG_DATA = {
    SITE: SITE,
    PHOTOS: PHOTOS,
    ARTICLES: ARTICLES,
    ARTICLE_CATS: ARTICLE_CATS,
    MODS: MODS,
    GAMES: GAMES
  };
})(window);
