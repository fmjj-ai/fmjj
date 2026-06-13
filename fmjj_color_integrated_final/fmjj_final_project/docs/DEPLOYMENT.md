# 部署说明

## 本地预览

```bash
python3 server.py
```

打开：`http://127.0.0.1:8000`

直接双击 `index.html` 也能打开。因为本项目使用 `assets/js/site-data.js` 而不是 fetch JSON，所以 file:// 也可加载主要内容；但第三方音乐 iframe 更推荐通过本地 HTTP 服务预览。

## Netlify

1. 登录 Netlify。
2. 选择 Add new site → Deploy manually。
3. 把整个 `fengming_jiongjun_site_full` 文件夹拖进去。
4. 发布后入口就是根目录 `index.html`。

## Vercel

1. 新建项目，把本文件夹作为项目根目录。
2. Framework Preset 选 Other。
3. Build Command 留空。
4. Output Directory 留空或填 `.`。
5. Deploy。

## GitHub Pages

1. 把本文件夹内容提交到 GitHub 仓库。
2. Settings → Pages。
3. Source 选 `Deploy from a branch`，branch 选 `main`，目录选 `/root`。
4. 保存后等待 Pages 构建完成。

## 注意

公开部署时，图片、音乐和平台 iframe 的可用性取决于第三方平台。请保留 `docs/RIGHTS_AND_SOURCES.md` 中的素材来源与权利说明。
