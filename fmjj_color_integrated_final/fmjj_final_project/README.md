# 封茗囧菌 Mandi Sa 彩色整合改版项目

打开方式：直接双击 `index.html` 可查看页面。为了让第三方播放器 iframe 更稳定，建议在本文件夹中运行：

```bash
python3 server.py
```

然后浏览器打开 `http://127.0.0.1:8000`。

## 本次整合内容

- 以“彩色版”为视觉基础，保留淡黄、淡粉、薄荷青玻璃卡片风格。
- 加入“动态粒子版”的鼠标移动星星 / 音符粒子、卡片浮动回弹、Hero 卡片延迟滚入和关键词自动左移跑马灯。
- 将个人档案改为“个人信息与风格关键词”。
- “代表曲目 · 网页内播放”改为进阶版的左侧热门曲目列表 + 右侧大播放器布局，同时保留 Apple Music、Spotify、Bilibili、YouTube 等网页内播放选项。
- “热门歌曲采样”替换为“多平台热门曲目线索”的内容，但保留彩色版列表卡片风格。
- 时间线改为居中竖线、一左一右交错的“从翻唱到原创 / 唱跳 / 专辑”结构。
- 相册保留彩色版原照片墙，并新增参考 solo 囧菌相册的卷轴相册模式。
- 来源与文件结构区改为金色平台卡片风格，并补充图标。
- 右上角加入 solo 版本的本地 BGM mp3 控制按钮。

## 图片处理说明

- 整合版图片没有复制进最终项目，也没有作为相册参考使用。
- solo 相册只保留本次需求提到可参考的囧菌相册相关素材；“近期照片、粉丝壁纸、可爱日常、日常照片、黑白童子”等不需要的类别没有加入。
- 风象双子封面版源文件中第一张封面为外链图片，最终页面作为相册补充引用，未把外链图片二次打包为本地文件。

## 关于音乐播放与网易云接口

网页默认使用项目内已有且相对明确的 Apple Music、Spotify、Bilibili、YouTube iframe 或外部入口。网易云部分只保留搜索入口和候选核对表，不默认启用 outchain iframe，避免错播。

核对表位置：

```text
data/audio_interface_audit.json
docs/AUDIO_INTERFACE_AUDIT.md
```

其中已标注明显冲突项，例如 solo 中同一个网易云 ID 同时对应多个曲目的情况。

## 文件结构

```text
fmjj_final_project/
  index.html
  server.py
  package.json
  netlify.toml
  vercel.json
  audio/
    bgm.mp3
  assets/
    css/style.css
    js/site-data.js
    js/app.js
    images/
      originals/        # 彩色版原图素材
      gallery/          # 彩色版网页相册图
      brand/            # SVG 视觉元素和曲目卡
      solo_gallery/     # 本次允许保留的 solo 卷轴相册素材
  data/
    profile.json
    platforms.json
    music_catalog.json
    images_manifest.json
    sources.json
    site_data_full.json
    audio_interface_audit.json
  docs/
    RESEARCH_NOTES.md
    RIGHTS_AND_SOURCES.md
    DEPLOYMENT.md
    AUDIO_INTERFACE_AUDIT.md
  prompts/
    site-design-prompt.md
    follow-up-edit-prompt.md
```
