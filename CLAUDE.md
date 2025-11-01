# AI エージェント用ドキュメント

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## GitHub 操作ルール

- ユーザーから PR を出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってから PR を出すようにする
- develop や main への直接 push は禁止です
- Prisma のマイグレーションを含む差分は自動デプロイで環境を壊しうるので、ユーザーに許可を取ってから実行してください
- ロジックにまつわる変更をしたあとの Push の前には、プロジェクトルートで　`pnpm check-types` と `pnpm check` を行ってから Push するようにしてください
- PR 作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください

## プロジェクト概要

このプロジェクトは、Next.js、Hono、tRPC を組み合わせた Turborepo モノレポ構成のフルスタックアプリケーションです。Cloudflare Workers 上で動作し、SendGrid を使用したお問い合わせフォーム機能を実装する予定です。

## アーキテクチャ

### モノレポ構成

```
apps/
  web/       - Next.js 16 フロントエンド (ポート3001)
  server/    - Hono サーバー + tRPC API (ポート3000)
packages/
  api/       - tRPC ルーター定義とビジネスロジック
  db/        - Drizzle ORM スキーマとデータベース操作
```

### 技術スタック詳細

- **フロントエンド**: Next.js 16 (App Router), React 19, TailwindCSS 4, shadcn/ui
- **バックエンド**: Hono (Cloudflare Workers), tRPC 11
- **データベース**: Drizzle ORM + SQLite/Turso (Cloudflare D1)
- **デプロイ**: Cloudflare Workers/Pages (OpenNext)
- **ツール**: Turborepo, Biome (linter/formatter), Husky
- **パッケージマネージャー**: pnpm 10.18.3

### データフロー

1. `apps/web` - Next.js クライアント側から tRPC クライアントで API 呼び出し
2. `apps/server` - Hono サーバーが tRPC リクエストを受け取る
3. `packages/api` - tRPC ルーターがリクエストを処理
4. `packages/db` - Drizzle ORM でデータベース操作

## 開発コマンド

### 基本操作

```bash
# 依存関係インストール
pnpm install

# すべてのアプリを開発モードで起動
pnpm dev

# Web のみ起動 (localhost:3001)
pnpm dev:web

# Server のみ起動 (localhost:3000)
pnpm dev:server

# ビルド
pnpm build

# 型チェック
pnpm check-types

# Biome でリント&フォーマット
pnpm check
```

### データベース操作

```bash
# スキーマを DB に反映
pnpm db:push

# Drizzle Studio 起動
pnpm db:studio

# マイグレーション生成
pnpm db:generate

# マイグレーション実行
pnpm db:migrate
```

### デプロイ (Cloudflare)

```bash
# Web アプリデプロイ
cd apps/web && pnpm deploy

# Server デプロイ
cd apps/server && pnpm deploy

# Server 開発サーバー (Wrangler)
cd apps/server && pnpm dev
```

## コーディング規約

### Biome 設定

- インデント: タブ
- クォート: ダブルクォート
- インポートの自動整理: 有効
- Tailwind クラスの自動ソート: 有効 (clsx, cva, cn 関数)

### 重要なルール

- `useExhaustiveDependencies`: info レベル (React hooks 依存配列)
- パラメータの再代入禁止
- const assertion 推奨
- enum は初期化必須
- 不要な型注釈は禁止

## 環境変数

### 必須環境変数 (お問い合わせフォーム実装時)

```
SENDGRID_API_KEY              # SendGrid API キー
FROM_EMAIL                     # 送信元メールアドレス
ADMIN_EMAIL                    # 管理者宛メールアドレス
SITE_NAME                      # サイト名
TURNSTILE_SECRET               # Cloudflare Turnstile Secret Key
NEXT_PUBLIC_TURNSTILE_SITE_KEY # Turnstile Site Key (public)
```

### 設定場所

- `apps/server/.env` - サーバー側環境変数
- `apps/web/.env.local` - Web 側環境変数 (NEXT*PUBLIC*\* のみ)
- Cloudflare デプロイ時: Wrangler Secrets または Pages Environment Variables

## お問い合わせフォーム機能の実装予定

このプロジェクトは、Cloudflare Workers 上で動作する SendGrid + Turnstile を使ったお問い合わせフォームを実装します。

### フォーム仕様

- **入力項目**: 名前、メールアドレス、お問い合わせ内容
- **バリデーション**: zod による型安全なバリデーション
- **スパム対策**: Cloudflare Turnstile
- **メール送信**: SendGrid API (管理者通知 + ユーザー自動返信)

### API エンドポイント

- 想定: `/api/contact` (Next.js API Route または tRPC プロシージャ)

## 型安全性

- すべてのワークスペースで TypeScript strict モード
- tRPC により フロントエンド ↔ バックエンド 間で型共有
- Drizzle ORM により DB スキーマから型生成
- zod によるランタイムバリデーション

## Cloudflare D1 ローカル開発

- Wrangler の `wrangler dev` コマンドでローカル D1 が自動起動
- `.env` は不要な場合が多い (wrangler.toml で設定)

## Git フック

Husky + lint-staged により、コミット前に自動で Biome チェックが実行されます。

## パッケージ間の依存関係

- `apps/web` → `packages/api` (tRPC クライアント)
- `apps/server` → `packages/api`, `packages/db`
- `packages/api` → `packages/db`

パッケージ間は workspace プロトコル (`workspace:*`) で参照されています。

## Catalog 機能

pnpm workspace の catalog 機能により、共通パッケージのバージョンを一元管理:

- `hono`, `@trpc/server`, `@trpc/client`, `dotenv`, `zod`, `typescript`, `tsdown`
