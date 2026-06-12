# 部署说明

这个项目是纯静态站点，不需要构建。

## 本地预览

```bash
cd fengming-jiongjun-site
python3 -m http.server 8000
```

浏览器打开本地服务地址即可。

## Vercel

1. 新建项目并上传本文件夹，或连接 Git 仓库。
2. Framework Preset 选择 `Other`。
3. Build Command 留空。
4. Output Directory 留空或填 `.`。
5. 部署。

项目内已包含 `vercel.json`：

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}
      ]
    }
  ]
}
```

## Netlify

1. 将文件夹拖拽到 Netlify Drop，或连接 Git 仓库。
2. Build command 留空。
3. Publish directory 填 `.`。
4. 部署。

## GitHub Pages

1. 新建仓库，将本文件夹内容提交到仓库根目录。
2. Settings → Pages。
3. Source 选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/root`。
4. 保存后等待 Pages 发布。

## 注意

- Apple Music、Bilibili、YouTube 与远程图片都依赖外网访问。
- 某些平台可能因地区、登录状态、防盗链或浏览器策略限制播放，这是平台限制。
- 若用于公开站点，建议补充隐私/版权说明，并确认所有图片授权。
