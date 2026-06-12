# 封茗囧菌 Mandi Sa 非官方个人资料页

这是一个可直接打开的静态网页项目，包含：个人资料、热门曲目、站内嵌入播放器、平台主页、公开图源照片墙、时间线、设计色系、资料来源与版权说明。

## 如何运行

最简单：双击 `index.html`。

推荐本地服务预览：

```bash
python3 -m http.server 8000
```

然后在浏览器打开本地地址。由于页面使用 Apple Music、Bilibili、YouTube 与远程图片，播放和照片展示需要联网。

## 文件结构

```text
fengming-jiongjun-site/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/data.js
│   ├── js/app.js
│   ├── data/site-data.json
│   └── img/*.svg
├── RESEARCH.md
├── PROMPTS.md
├── DEPLOY.md
├── LICENSE-NOTES.md
├── vercel.json
└── package.json
```

## 音源说明

页面没有下载、复制或打包任何受版权保护的音频文件。曲目播放通过平台官方 iframe 嵌入实现：

- Apple Music：多数情况下是试听或需登录/订阅。
- Bilibili：视频/音乐视频嵌入。
- YouTube Topic：平台分发音源嵌入。
- 网易云音乐、QQ 音乐：保留搜索入口；未核实 song/outchain ID 前不猜直链，避免“找错”。

需要补充网易云站内播放器时，可在 `assets/js/data.js` 的对应曲目 `sources` 中添加：

```js
{"name":"网易云音乐","type":"embed","embed":"https://music.163.com/outchain/player?type=2&id=已核验歌曲ID&auto=0&height=66","url":"https://music.163.com/#/song?id=已核验歌曲ID"}
```

## 图片说明

照片/视觉图采用公开图源远程展示，并保留来源入口；未将图片下载进项目包。商用、二创发布或印刷前请自行取得授权。

## 资料更新

主要数据在 `assets/js/data.js` 与 `assets/data/site-data.json`。更新数据后刷新页面即可。
