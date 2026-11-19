# strapi-blog

一个开箱即用的现代化**多站点 Markdown 博客系统**，基于 **Strapi v5**（Headless CMS）+ **Next.js 16**（App Router SSR + Tailwind CSS v4）+ **Nginx** 反向代理构建，通过 `docker-compose.yml` 一键部署。

## 核心特性

* **开箱即用**：内置 `Global`、`Site`、`Article`、`Category`、`Tag` 数据模型；首次启动自动初始化多语言、公共 API 权限与基础示例站点（`/life`）。
* **多套内置主题，后台一键切换**：内置 **4 套风格迥异的主题**，可在 Strapi 后台针对全局或每个子站点单独切换（无需重编镜像）：
  * `default` — **Modern Editorial**：现代极简编辑风，清晰克制
  * `warm` — **Warm Cozy Journal**：温馨暖意手帐风，米白纸感、衬线标题与柔和圆角
  * `anime` — **Anime Sakura Neon**：樱花二次元霓虹风，粉紫渐变光晕与漫画描边卡片
  * `cyber` — **Cyber Tech Matrix**：科技极客矩阵风，网格背景、终端窗口与霓虹青高亮
* **类多站点架构**：在 Strapi 后台创建不同的 `Site`（如 `/life`、`/tech`、`/notes`），每个站点拥有独立的首页、主题风格、强调色、分类、文章、搜索、RSS（`/{site}/rss.xml`）和 Sitemap（`/{site}/sitemap.xml`）。
* **Markdown 原生写作**：正文使用 Strapi Markdown 富文本字段，前端支持 GFM 表格/任务列表、代码高亮与一键复制、KaTeX 数学公式、自动生成右侧目录（TOC）与阅读时长估算。
* **Strapi v5 原生 MCP 支持**：内置开启 Strapi 官方 MCP Server（`/mcp`），配合 Admin API Token 即可在 Cursor / Claude Desktop 中用自然语言读写、发布文章。
* **多国语言（i18n）**：默认支持简体中文（`zh-Hans`）与英文（`en`），默认语言自动隐藏 URL 前缀（如 `/life`），切换语言自动切换至 `/en/life`。
* **内置评论系统**：后端集成 `strapi-plugin-comments`（支持嵌套回复、敏感词过滤、可选先审后发），前端提供完整交互与深浅色自适应评论区。
* **数据库随心选**：后端镜像预装 `sqlite`、`postgres`、`mysql2` 驱动，仅通过 `.env` 的 `DATABASE_CLIENT` 即可切换，无需重编镜像。

---

## 目录结构

```text
strapi-blog/
├── .env.example                 # 环境变量模板
├── docker-compose.yml           # Nginx + Next.js + Strapi (+ 可选 Postgres / MySQL)
├── nginx/                       # Nginx 反向代理配置与镜像
├── backend/                     # Strapi v5 后端（模型、MCP、评论插件、Bootstrap Seed）
└── frontend/                    # Next.js 16 前端（SSR、多站点路由、Markdown、4 套内置主题）
```

---

## 快速开始（1 分钟拉起）

### 1. 准备 `.env`

```bash
cp .env.example .env
```

> 默认配置使用 **SQLite**，零外部依赖；如用于公网生产环境，建议修改 `PUBLIC_SITE_URL`、数据库选型并填入固定随机密钥。

### 2. 启动服务

* **默认（SQLite，最简一键启动）：**
  ```bash
  docker compose up -d --build
  ```
* **使用 PostgreSQL：**
  在 `.env` 中设置 `DATABASE_CLIENT=postgres`、`DATABASE_HOST=postgres`、`DATABASE_PORT=5432`，然后执行：
  ```bash
  docker compose --profile postgres up -d --build
  ```
* **使用 MySQL：**
  在 `.env` 中设置 `DATABASE_CLIENT=mysql`、`DATABASE_HOST=mysql`、`DATABASE_PORT=3306`，然后执行：
  ```bash
  docker compose --profile mysql up -d --build
  ```

### 3. 访问入口

假设 `.env` 中 `APP_PORT=8080`：

* **多站点总览首页**：`http://localhost:8080/`
* **默认示例站点（生活手记）**：`http://localhost:8080/life`
* **英文版示例站点**：`http://localhost:8080/en/life`
* **Strapi 管理后台**：`http://localhost:8080/admin`（首次访问需注册管理员账号）
* **Strapi MCP 端点**：`http://localhost:8080/mcp`

> 如果希望访问 `/` 直接进入 `/life` 或某个主博客（而非多站点聚合页），在 `.env` 设置 `DEFAULT_SITE_SLUG=life` 即可。

---

## 后台切换主题 & 创建更多站点

1. 登录 `http://localhost:8080/admin`。
2. **切换聚合页默认主题**：进入 **Content Manager -> Global**，在 `defaultTheme` 下拉中选择 `default`、`warm`、`anime` 或 `cyber` 并保存。
3. **为每个子站点单独设置主题**：进入 **Content Manager -> Site**，编辑任意站点（或新建如 `slug: tech`、`slug: acg`），设置：
   * `theme`：`default` / `warm` / `anime` / `cyber`（例如 `/life` 用 `warm`，`/tech` 用 `cyber`，`/acg` 用 `anime`）
   * `accentColor`：自定义强调色十六进制（如 `#f59e0b`、`#ec4899`、`#06b6d4`）
4. 保存并发布后，刷新前端页面即可实时生效，无需重启或重编镜像。

---

## 使用 Strapi MCP 用 AI 写博客

1. 登录 `http://localhost:8080/admin`。
2. 进入 **Settings -> Admin API Tokens**（或 **API Tokens**，按 Strapi Admin 提示生成具备内容管理权限的 Admin Token）。
3. 在 Cursor / Claude Desktop 等支持 HTTP Streamable MCP 的客户端中配置：
   * **URL**: `http://localhost:8080/mcp`
   * **Authorization**: `Bearer <YOUR_ADMIN_TOKEN>`
4. 如需关闭 MCP，可在 `.env` 设置 `STRAPI_MCP_ENABLED=false` 并重启 `backend`。

---

## 评论审核配置

* 默认配置 `COMMENTS_REQUIRE_APPROVAL=false`（访客发表评论后立即展示，内置敏感词过滤）。
* 如需改为**先审后发**，在 `.env` 设置 `COMMENTS_REQUIRE_APPROVAL=true` 并重启 `backend`；之后可在 Strapi 后台左侧 **Comments** 面板集中审核、屏蔽或回复评论。
* 也可在单篇文章的 `allowComments` 字段关闭评论，或在 `.env` 设置 `NEXT_PUBLIC_COMMENTS_ENABLED=false` 全局关闭评论区。

---

## 开发者深度定制前端主题

如果内置的 4 套主题仍无法满足需求，可以扩展或替换主题后重编前端镜像：

1. 参考 [frontend/src/themes/skins.ts](frontend/src/themes/skins.ts) 增加新的皮肤配置，或实现 [frontend/src/themes/types.ts](frontend/src/themes/types.ts) 中的 `BlogTheme` 接口。
2. 在 [frontend/src/themes/index.ts](frontend/src/themes/index.ts) 注册到 `THEME_REGISTRY`。
3. 重新编译并重启前端容器：
   ```bash
   docker compose up -d --build frontend
   ```
