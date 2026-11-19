# strapi-blog

English | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

An out-of-the-box, modern **multi-site Markdown blog platform** powered by **Strapi v5** (Headless CMS), **Next.js 16** (App Router SSR + Tailwind CSS v4), and **Nginx**, orchestrated with a single `docker-compose.yml`.

## Features

* **Out-of-the-Box Setup**: Pre-configured `Global`, `Site`, `Article`, `Category`, and `Tag` content types. On first boot, it automatically initializes locales, public API/comment permissions, and a starter `/life` site with a sample multilingual Markdown post.
* **4 Built-in Themes (Switchable in Strapi Admin)**: Choose a global theme or assign a different theme to each sub-site directly in Strapi Admin—no image rebuild required:
  * `default` — **Modern Editorial**: Clean Swiss-inspired editorial layout.
  * `warm` — **Warm Cozy Journal**: Soft linen backdrop, editorial serif headings, and warm rounded cards.
  * `anime` — **Anime Sakura Neon**: Pastel dot aura, sakura-violet gradients, and manga-style offset-shadow cards.
  * `cyber` — **Cyber Tech Matrix**: Subtle grid backdrop, terminal window framing, monospace metadata, and neon cyan accents.
* **Multi-Site Routing**: Create independent sub-blogs in Strapi (e.g., `/life`, `/tech`, `/notes`), each with its own home page, theme, accent color, categories, search, RSS (`/{site}/rss.xml`), and Sitemap (`/{site}/sitemap.xml`).
* **Native Markdown Authoring**: Uses Strapi's Markdown rich-text field, rendered on the frontend with GFM tables/task lists, syntax highlighting with one-click copy, KaTeX math formulas, automatic Table of Contents (TOC), and reading time estimation.
* **Built-in Strapi v5 MCP Server**: Ships with Strapi's native MCP server enabled at `/mcp`. Create an Admin API Token to let Cursor, Claude Desktop, or other MCP clients draft, edit, and publish posts via natural language.
* **Multi-Language (i18n)**: Built-in support for `zh-Hans` and `en` (extensible via `.env`). The default locale omits the URL prefix (`/life`), while secondary locales use `/en/life`.
* **Built-in Comment System**: Powered by `strapi-plugin-comments` with nested replies, bad-word filtering, optional pre-moderation (`COMMENTS_REQUIRE_APPROVAL`), and an adaptive light/dark UI.
* **Flexible Database Choice**: The backend image pre-bundles `better-sqlite3`, `pg`, and `mysql2` drivers. Switch between SQLite (zero-config default), PostgreSQL, and MySQL using `.env` only.

---

## Project Structure

```text
strapi-blog/
├── .env.example                 # Environment configuration template
├── docker-compose.yml           # Nginx + Next.js + Strapi (+ optional Postgres / MySQL profiles)
├── nginx/                       # Nginx reverse proxy Dockerfile & config template
├── backend/                     # Strapi v5 backend (schemas, MCP, comments plugin, bootstrap seed)
└── frontend/                    # Next.js 16 frontend (SSR, multi-site routing, Markdown, 4 themes)
```

---

## Quick Start

### 1. Create `.env`

```bash
cp .env.example .env
```

> Defaults to **SQLite** with zero external dependencies. For production deployments, update `PUBLIC_SITE_URL`, pick your database settings, and provide fixed random secrets.

### 2. Start the Stack

* **Default (SQLite):**
  ```bash
  docker compose up -d --build
  ```
* **With PostgreSQL:**
  Set `DATABASE_CLIENT=postgres`, `DATABASE_HOST=postgres`, `DATABASE_PORT=5432` in `.env`, then run:
  ```bash
  docker compose --profile postgres up -d --build
  ```
* **With MySQL:**
  Set `DATABASE_CLIENT=mysql`, `DATABASE_HOST=mysql`, `DATABASE_PORT=3306` in `.env`, then run:
  ```bash
  docker compose --profile mysql up -d --build
  ```

*(Podman users can substitute `podman compose` for `docker compose`.)*

### 3. Access URLs

Assuming `APP_PORT=8080` in `.env`:

* **Multi-Site Portal:** `http://localhost:8080/`
* **Starter Site (`/life`):** `http://localhost:8080/life`
* **English Version:** `http://localhost:8080/en/life`
* **Strapi Admin Panel:** `http://localhost:8080/admin` (register your first admin account on initial visit)
* **Strapi MCP Endpoint:** `http://localhost:8080/mcp`

> To make `/` redirect directly to a primary blog (e.g., `/life`) instead of the portal hub, set `DEFAULT_SITE_SLUG=life` in `.env`.

---

## Switching Themes & Adding Sites

1. Sign in at `http://localhost:8080/admin`.
2. **Global Portal Theme:** Open **Content Manager -> Global**, pick `default`, `warm`, `anime`, or `cyber` in `defaultTheme`, and save.
3. **Per-Site Theme & Branding:** Open **Content Manager -> Site**, edit an existing site or create a new one (e.g., `slug: tech`), and configure:
   * `theme`: `default` | `warm` | `anime` | `cyber`
   * `accentColor`: Hex color code (e.g., `#f59e0b`, `#ec4899`, `#06b6d4`)
4. Save and publish—changes take effect immediately on reload without rebuilding containers.

---

## Writing Posts via Strapi MCP

1. Log in to `http://localhost:8080/admin`.
2. Go to **Settings -> Admin API Tokens** (or **API Tokens**) and create a token with the desired Content Manager permissions.
3. Configure your MCP-compatible client (e.g., Cursor or Claude Desktop):
   * **URL:** `http://localhost:8080/mcp`
   * **Header:** `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. To disable MCP, set `STRAPI_MCP_ENABLED=false` in `.env` and restart `backend`.

---

## Comment Moderation

* By default, `COMMENTS_REQUIRE_APPROVAL=false` publishes guest comments immediately (with bad-word filtering enabled).
* Set `COMMENTS_REQUIRE_APPROVAL=true` in `.env` and restart `backend` to require manual approval in the Strapi Admin **Comments** panel before comments become public.
* You can also disable comments per article (`allowComments`) or globally (`NEXT_PUBLIC_COMMENTS_ENABLED=false`).

---

## Custom Theme Development

If you want to build a completely custom layout beyond the 4 built-in themes:

1. Add a new skin in [frontend/src/themes/skins.ts](frontend/src/themes/skins.ts) or implement the `BlogTheme` interface in [frontend/src/themes/types.ts](frontend/src/themes/types.ts).
2. Register it in `THEME_REGISTRY` inside [frontend/src/themes/index.ts](frontend/src/themes/index.ts).
3. Rebuild and restart the frontend container:
   ```bash
   docker compose up -d --build frontend
   ```
