# 封茗囧菌 Mandi Sa 个人网页资料包（完整离线素材版）

打开方式：直接双击 `index.html` 即可查看页面；为了让第三方播放器 iframe 更稳定，建议在本文件夹中运行：

```bash
python3 server.py
```

然后浏览器打开 `http://127.0.0.1:8000`。

## 这次补齐了什么

- `assets/images/originals/`：下载到本地的原始图片素材。
- `assets/images/gallery/`：网页实际使用的压缩 WebP 图片与缩略图。
- `data/`：结构化采集数据，包括个人档案、平台、曲目、来源、图片清单与完整总数据。
- `docs/`：采集说明、来源说明、权利说明、部署说明。
- `prompts/`：页面设计提示词和后续改图/改版提示词。
- `assets/js/site-data.js`：网页运行时直接加载的数据，避免 `file://` 下 fetch JSON 失败。

## 关于音乐播放

网页没有打包任何未授权音频文件。点击曲目后，会在页面右侧切换 Apple Music、Spotify、Bilibili 或 YouTube 的公开内嵌播放器。受平台、地区、登录状态、第三方 Cookie 和浏览器自动播放策略影响，有些播放器需要在 iframe 内再点一次播放按钮。

网易云音乐没有强行填写歌曲 ID，因为未能稳定核验每首歌的 ID。`data/platforms.json` 里保留了网易云搜索入口；如果你确认了歌曲 ID，可以按下面模板补进 `assets/js/site-data.js` 的对应曲目：

```html
<iframe src="https://music.163.com/outchain/player?type=2&id=歌曲ID&auto=0&height=66"></iframe>
```

## 文件结构

```text
fengming_jiongjun_site_full/
  index.html
  server.py
  package.json
  netlify.toml
  vercel.json
  assets/
    css/style.css
    js/site-data.js
    js/app.js
    images/
      originals/        # 原图素材
      gallery/          # WebP 压缩图和缩略图
      brand/            # 原创 SVG 视觉元素和曲目卡
  data/
    profile.json
    platforms.json
    music_catalog.json
    images_manifest.json
    sources.json
    site_data_full.json
  docs/
    RESEARCH_NOTES.md
    RIGHTS_AND_SOURCES.md
    DEPLOYMENT.md
  prompts/
    site-design-prompt.md
    follow-up-edit-prompt.md
```
