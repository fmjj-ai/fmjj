# 封茗囧菌 Mandi Sa 个人音乐网页

这是一个可直接打开的静态网页项目，整理了封茗囧菌的公开个人资料、热门曲目线索、各平台主页、照片墙、巡演/生日会信息和网页内嵌播放器。

## 如何运行

最简单：双击 `index.html`。

更稳定：在本文件夹打开终端运行：

```bash
python3 -m http.server 8080
```

然后在浏览器访问 `http://localhost:8080`。

## 重要说明

- 页面数据已经内嵌到 `assets/js/data.js`，因此不依赖本地 `fetch`，直接打开 `index.html` 也能渲染。
- 网页内播放使用 Bilibili 官方 iframe 嵌入；项目不下载、不缓存、不重新分发音乐文件。
- 部分歌曲没有找到稳定可嵌入播放器，只提供官方/平台来源按钮。
- 照片与视觉素材已本地化打包：页面 `<img>` 使用 `assets/images/photos/thumbs/` 中的本地缩略图，点击可打开 `assets/images/photos/` 中的本地大图。
- `photos.json` 中仍保留来源核验链接，但这些链接只作为出处说明，不再作为图片显示地址。
- GSAP 动效使用 CDN；无法联网时会自动退回到 CSS / IntersectionObserver 的基础动效。

## 文件结构

```text
fmjj-personal-page/
├── index.html
├── README.md
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   ├── js/data.js
│   ├── data/*.json
│   ├── images/photos/          # 本地原图
│   ├── images/photos/thumbs/   # 页面使用的本地缩略图
│   └── svg/fmjj-mark.svg
├── research/资料收集.md
├── prompts/网页生成提示词.md
└── deploy/README-deploy.md
```

## 更新资料

原始结构化数据在 `assets/data/`。如果你修改了 JSON，可以运行下面的脚本重新生成 `assets/js/data.js`：

```bash
python3 - <<'PY'
from pathlib import Path
import json
root = Path('.')
data = {}
for name in ['profile','platforms','tracks','charts','photos','tour']:
    data[name] = json.loads((root/'assets'/'data'/f'{name}.json').read_text(encoding='utf-8'))
(root/'assets'/'js'/'data.js').write_text('window.FMJJ_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';
', encoding='utf-8')
PY
```

## 图片维护

- 新增图片时，把原图放进 `assets/images/photos/`。
- 建议同时生成宽度不超过 900px 的缩略图，放进 `assets/images/photos/thumbs/`，以免照片墙加载过慢。
- 在 `assets/data/photos.json` 中把 `src` 指向本地缩略图，把 `hires` 指向本地原图，把 `source` 保留为核验页面。
- 公开发布或商用前，请确认图片授权；第三方图集素材在本项目中只作为资料聚合示例。

## 版权与署名

本页面是 fan-made 信息聚合页。音乐、图片、视频、平台标识及相关素材版权归原权利方所有。项目不包含音频文件；图片已按当前需求本地打包，公开发布前请确认对应授权。
