# strapi-blog

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

**Strapi v5**（Headless CMS）+ **Next.js 16**（App Router SSR + Tailwind CSS v4）+ **Nginx** リバースプロキシで構成された、すぐに使えるモダンな **マルチサイト対応 Markdown ブログシステム** です。`docker-compose.yml` でワンコマンドデプロイが可能です。

## 主な特徴

* **すぐに使える初期構成**：`Global`、`Site`、`Article`、`Category`、`Tag` のデータモデルを事前定義済み。初回起動時に多言語（i18n）、公開 API / コメント権限、サンプルサイト（`/life`）と多言語 Markdown 記事を自動初期化します。
* **4 種類のビルトインテーマ（管理画面から切替可能）**：イメージの再ビルド不要で、グローバルおよびサイトごとにテーマを切り替えられます：
  * `default` — **Modern Editorial**：洗練されたモダン・エディトリアルスタイル。
  * `warm` — **Warm Cozy Journal**：生成り色の紙面、セリフ体の見出し、温かみのある丸角カード。
  * `anime` — **Anime Sakura Neon**：パステルグラデーションとコミック調オフセットシャドウのポップなスタイル。
  * `cyber` — **Cyber Tech Matrix**：グリッド背景、ターミナル風ウィンドウ、等幅メタデータとネオンシアンのテック系スタイル。
* **マルチサイト構成**：Strapi 管理画面から複数の `Site`（例：`/life`、`/tech`、`/notes`）を作成でき、各サイトごとに独立したトップページ、テーマ、アクセントカラー、カテゴリ、記事検索、RSS（`/{site}/rss.xml`）、Sitemap（`/{site}/sitemap.xml`）を持てます。
* **ネイティブ Markdown 執筆**：Strapi の Markdown リッチテキストフィールドを採用。フロントエンドでは GFM テーブル / タスクリスト、コピーボタン付きシンタックスハイライト、KaTeX 数式、自動目次（TOC）、読了時間表示に対応しています。
* **Strapi v5 ネイティブ MCP 対応**：`/mcp` エンドポイントで Strapi 公式 MCP サーバーを有効化。Admin API Token を発行するだけで、Cursor や Claude Desktop から自然言語で記事の作成・編集・公開が可能です。
* **多言語対応（i18n）**：デフォルトで `zh-Hans` と `en` をサポート（`.env` で拡張可能）。デフォルト言語は URL プレフィックスなし（`/life`）、他言語は `/en/life` でアクセスできます。
* **ビルトインコメント機能**：`strapi-plugin-comments` を統合し、ネスト返信、NG ワードフィルタ、事前承認モード（`COMMENTS_REQUIRE_APPROVAL`）、ライト/ダーク対応 UI を備えています。
* **柔軟なデータベース選択**：バックエンドイメージに `better-sqlite3`、`pg`、`mysql2` をすべて同梱。`.env` の `DATABASE_CLIENT` を変更するだけで SQLite（初期設定）/ PostgreSQL / MySQL を切り替えられます。

---

## ディレクトリ構成

```text
strapi-blog/
├── .env.example                 # 環境変数テンプレート
├── docker-compose.yml           # Nginx + Next.js + Strapi（+ 任意で Postgres / MySQL）
├── nginx/                       # Nginx リバースプロキシ設定および Dockerfile
├── backend/                     # Strapi v5 バックエンド（スキーマ、MCP、コメント、初期シード）
└── frontend/                    # Next.js 16 フロントエンド（SSR、マルチサイト、Markdown、4 テーマ）
```

---

## クイックスタート

### 1. `.env` の準備

```bash
cp .env.example .env
```

> 初期設定は外部 DB 不要の **SQLite** です。本番環境では `PUBLIC_SITE_URL` や DB 設定、固定のランダムシークレットを設定してください。

### 2. 起動

* **デフォルト（SQLite）：**
  ```bash
  docker compose up -d --build
  ```
* **PostgreSQL を使用する場合：**
  `.env` で `DATABASE_CLIENT=postgres`、`DATABASE_HOST=postgres`、`DATABASE_PORT=5432` を設定し、以下を実行：
  ```bash
  docker compose --profile postgres up -d --build
  ```
* **MySQL を使用する場合：**
  `.env` で `DATABASE_CLIENT=mysql`、`DATABASE_HOST=mysql`、`DATABASE_PORT=3306` を設定し、以下を実行：
  ```bash
  docker compose --profile mysql up -d --build
  ```

> Podman を使用する場合は `docker compose` を `podman compose` に置き換えてください。

### 3. アクセス URL

`.env` で `APP_PORT=8080` の場合：

* **マルチサイトポータル：** `http://localhost:8080/`
* **サンプルサイト（`/life`）：** `http://localhost:8080/life`
* **英語版サンプルサイト：** `http://localhost:8080/en/life`
* **Strapi 管理画面：** `http://localhost:8080/admin`（初回アクセス時に管理者アカウントを作成してください）
* **Strapi MCP エンドポイント：** `http://localhost:8080/mcp`

> `/` へのアクセス時にポータルではなく特定のブログへ直接リダイレクトしたい場合は、`.env` で `DEFAULT_SITE_SLUG=life` を指定してください。

---

## テーマ切り替えとサイトの追加

1. `http://localhost:8080/admin` にログインします。
2. **全体ポータルのテーマ設定**：**Content Manager -> Global** を開き、`defaultTheme` から `default` / `warm` / `anime` / `cyber` を選択して保存します。
3. **サイトごとのテーマ設定**：**Content Manager -> Site** で既存サイトを編集（または `slug: tech` 等を新規作成）し、以下を設定します：
   * `theme`：`default` | `warm` | `anime` | `cyber`
   * `accentColor`：16 進カラーコード（例：`#f59e0b`、`#ec4899`、`#06b6d4`）
4. 保存・公開（Publish）すると、再ビルドなしで即座に反映されます。

---

## Strapi MCP を使った AI 記事執筆

1. `http://localhost:8080/admin` にログインします。
2. **Settings -> Administration Panel -> Admin Tokens**（注意：`Settings -> API Tokens` は `/api/*` 専用のため、`/mcp` に使うと `401` になります）から必要な権限を持つ Admin Token を作成します。
3. Cursor や Claude Desktop などの MCP クライアントに以下を設定します：
   * **URL：** `http://localhost:8080/mcp`
   * **Header：** `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
4. MCP を無効化する場合は、`.env` で `STRAPI_MCP_ENABLED=false` を設定して `backend` を再起動してください。

---

## コメントの承認設定

* デフォルトでは `COMMENTS_REQUIRE_APPROVAL=false` となっており、投稿されたコメントは即時公開されます（NG ワードフィルタ有効）。
* 事前承認制にする場合は `.env` で `COMMENTS_REQUIRE_APPROVAL=true` を設定して `backend` を再起動してください。Strapi 管理画面の **Comments** パネルから承認・非表示・返信が行えます。
* 記事単位（`allowComments`）または全体（`NEXT_PUBLIC_COMMENTS_ENABLED=false`）でのコメント無効化も可能です。

---

## カスタムテーマの開発

組み込みの 4 テーマ以外に独自のレイアウトを作りたい場合：

1. [frontend/src/themes/skins.ts](frontend/src/themes/skins.ts) に新しいスキンを追加するか、[frontend/src/themes/types.ts](frontend/src/themes/types.ts) の `BlogTheme` インターフェースを実装します。
2. [frontend/src/themes/index.ts](frontend/src/themes/index.ts) の `THEME_REGISTRY` に登録します。
3. フロントエンドコンテナを再ビルドして再起動します：
   ```bash
   docker compose up -d --build frontend
   ```
