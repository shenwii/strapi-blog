# strapi-blog

一个开箱即用的现代化**多站点 Markdown 博客系统**，基于 **Strapi v5**（Headless CMS）+ **Next.js 16**（App Router SSR + Tailwind CSS v4）+ **Nginx** 反向代理构建，通过 `docker-compose.yml` 一键部署。

## 核心特性

* **开箱即用**：内置 `Global`、`Site`、`Article`、`Category`、`Tag` 数据模型；首次启动自动初始化多语言、公共 API 权限与示例数据（`/home-assistant` 与 `/life`）。
* **类多站点架构**：在 Strapi 后台创建不同的 `Site`（如 `/home-assistant`、`/life`），每个站点拥有独立的首页、分类、文章、搜索、主题强调色、RSS（`/{site}/rss.xml`）和 Sitemap（`/{site}/sitemap.xml`）。
* **Markdown 原生写作**：正文使用 Strapi Markdown 富文本字段，前端支持 GFM 表格/任务列表、代码高亮与一键复制、KaTeX 数学公式、自动生成右侧目录（TOC）与阅读时长估算。
* **Strapi v5 原生 MCP 支持**：内置开启 Strapi 官方 MCP Server（`/mcp`），配合 Admin API Token 即可在 Cursor / Claude Desktop 中用自然语言读写、发布文章。
* **多国语言（i18n）**：默认支持简体中文（`zh-Hans`）与英文（`en`），默认语言自动隐藏 URL 前缀（如 `/home-assistant`），切换语言自动切换至 `/en/home-assistant`。
* **内置评论系统**：后端集成 `strapi-plugin-comments`（支持嵌套回复、敏感词过滤、可选先审后发），前端提供完整交互与深浅色自适应评论区。
* **数据库随心选**：后端镜像预装 `sqlite`、`postgres`、`mysql2` 驱动，仅通过 `.env` 的 `DATABASE_CLIENT` 即可切换，无需重编镜像。
* **主题可独立定制**：前端 UI 视图完全抽离在 `frontend/src/themes/` 下；更换或自研主题只需新增主题目录并在 `frontend/src/themes/index.ts` 切换后重新构建前端镜像。

---

## 目录结构

```text
strapi-blog/
├── .env.example                 # 环境变量模板
├── docker-compose.yml           # Nginx + Next.js + Strapi (+ 可选 Postgres / MySQL)
├── nginx/                       # Nginx 反向代理配置与镜像
├── backend/                     # Strapi v5 后端（模型、MCP、评论插件、Bootstrap Seed）
└── frontend/                    # Next.js 16 前端（SSR、多站点路由、Markdown、主题）
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
* **示例站点 1（HA 技术站）**：`http://localhost:8080/home-assistant`
* **示例站点 2（生活手记）**：`http://localhost:8080/life`
* **英文版示例站点**：`http://localhost:8080/en/home-assistant`
* **Strapi 管理后台**：`http://localhost:8080/admin`（首次访问需注册管理员账号）
* **Strapi MCP 端点**：`http://localhost:8080/mcp`

> 如果希望访问 `/` 直接进入某个主博客（而非多站点聚合页），在 `.env` 设置 `DEFAULT_SITE_SLUG=home-assistant` 即可。

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

## 定制或更换前端主题

所有页面渲染逻辑与后端数据请求完全解耦，主题接口定义在 `frontend/src/themes/types.ts`：

1. 复制 `frontend/src/themes/default` 为 `frontend/src/themes/my-theme`。
2. 按需修改 `PortalView`、`SiteHomeView`、`ArticleDetailView`、`TaxonomyView`、`SearchView` 的组件与 Tailwind 样式。
3. 修改 `frontend/src/themes/index.ts`：
   ```ts
   import { myTheme } from './my-theme';
   export const activeTheme = myTheme;
   ```
4. 重新编译并重启前端容器：
   ```bash
   docker compose up -d --build frontend
   ```
