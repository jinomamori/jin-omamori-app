# 仁お守り Web アプリ（Next.js）

## セットアップ

### 前提条件
- Node.js 18 以上
- バックエンド（NestJS）が起動していること

### インストール

```bash
cd web
npm install
```

### 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集してバックエンドのURLを設定:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3001 を開いてください。

### ビルド

```bash
npm run build
npm start
```

---

## ページ構成

| パス | 説明 |
|------|------|
| `/` | ランディングページ |
| `/login` | ログイン |
| `/register` | 新規登録 |
| `/home` | ホーム（認証必須） |
| `/member-card` | 会員証（QRコード） |
| `/partner-stores` | 提携店一覧 |
| `/partner-stores/[id]` | 提携店詳細 |
| `/events` | 食事会イベント一覧 |
| `/events/[id]` | 食事会詳細 |
| `/shop` | グッズショップ |
| `/shop/[id]` | 商品詳細 |
| `/cart` | カート |
| `/checkout` | 決済（Stripe） |
| `/mypage` | マイページ |
| `/subscribe` | プラン加入 |

## PWA対応

- `public/manifest.json` に設定済み
- `public/service-worker.js` でオフライン対応
- `next.config.js` に `next-pwa` 設定済み

## アイコン生成

`public/icons/` に以下のサイズのPNGを配置してください：
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

`public/icons/icon.svg` をベースに生成することを推奨します。
