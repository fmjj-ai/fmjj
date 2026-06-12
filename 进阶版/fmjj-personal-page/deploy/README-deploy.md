# 部署说明

本项目是纯静态网页，不需要构建步骤。

## GitHub Pages

1. 新建一个仓库，例如 `fmjj-personal-page`。
2. 上传本文件夹中的全部文件，确保 `index.html` 位于仓库根目录。
3. 进入仓库 Settings → Pages。
4. Source 选择 `Deploy from a branch`，Branch 选择 `main`，目录选择 `/root`。
5. 保存后等待 GitHub Pages 生成链接。

## Netlify

1. 登录 Netlify。
2. 选择 Add new site → Deploy manually。
3. 将整个 `fmjj-personal-page` 文件夹拖入上传区域。
4. 发布后可在 Site settings 中修改站点名称。

## Cloudflare Pages

1. 登录 Cloudflare Pages。
2. 创建 Pages 项目。
3. 连接 Git 仓库或直接上传静态文件。
4. Framework preset 选择 None。
5. Build command 留空，Output directory 留空或填写 `/`。

## 部署后检查清单

- 首页是否能打开。
- 导航锚点是否能跳转。
- Bilibili iframe 是否能在页面内加载。
- 没有可嵌入音源的歌曲是否显示来源按钮。
- 本地照片与缩略图是否正常加载。
- 移动端是否正常折叠为单列。
- README 与 research 中的版权边界是否保留。
