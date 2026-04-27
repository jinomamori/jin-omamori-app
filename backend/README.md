# 仁お守りアプリ — バックエンドAPI

NestJS + PostgreSQL (TypeORM) によるRESTful APIサーバー

## クイックスタート

```bash
# 1. 環境変数設定
cp .env.example .env
# .env を編集

# 2. DockerでDB起動
docker-compose up -d

# 3. マイグレーション
npm run migration:run

# 4. 開発サーバー起動
npm run start:dev
```

サーバーが `http://localhost:3000` で起動します。

## 必要な環境変数

| 変数 | 説明 | 例 |
|------|------|-----|
| DB_HOST | データベースホスト | localhost |
| DB_PORT | データベースポート | 5432 |
| DB_USERNAME | DBユーザー名 | jin_user |
| DB_PASSWORD | DBパスワード | jin_password |
| DB_DATABASE | DB名 | jin_omamori |
| JWT_SECRET | JWT署名キー | your-secret-key |
| JWT_EXPIRES_IN | JWT有効期限 | 7d |
| APPLE_CLIENT_ID | Apple Bundle ID | com.jinomamori.app |
| APPLE_TEAM_ID | Apple Team ID | XXXXXX |
| APPLE_KEY_ID | Apple Key ID | XXXXXX |
| APPLE_PRIVATE_KEY | Apple秘密鍵 | -----BEGIN... |
| STRIPE_SECRET_KEY | Stripe Secret | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Stripe Webhook | whsec_... |

## APIエンドポイント

### 認証
- POST `/api/auth/apple` - Apple IDログイン
- POST `/api/auth/register` - メール登録
- POST `/api/auth/login` - メールログイン

### ユーザー
- GET `/api/users/me` - プロフィール取得
- PUT `/api/users/me` - プロフィール更新

### サブスクリプション
- GET `/api/subscriptions/status` - プラン確認
- POST `/api/subscriptions/verify` - レシート検証
- POST `/api/subscriptions/webhook` - Apple通知

### 会員証・特典
- GET `/api/membership` - 会員証情報
- POST `/api/benefits/use-partner` - 提携店特典利用
- GET `/api/benefits/status` - 利用状況

### 提携店
- GET `/api/partner-stores` - 一覧
- GET `/api/partner-stores/:id` - 詳細

### 食事会イベント
- GET `/api/events` - 一覧
- GET `/api/events/:id` - 詳細
- POST `/api/events/:id/rsvp` - 参加登録

### グッズ
- GET `/api/products` - 商品一覧
- POST `/api/orders` - 注文作成
- POST `/api/orders/:id/pay` - 決済

### 管理者専用
- POST `/api/admin/partner-stores` - 提携店登録
- POST `/api/admin/events` - 食事会作成
- GET `/api/admin/events/:id/participants` - 参加者一覧

---

## 詳細セットアップ

### 認証

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/api/auth/register` | メール登録 | 不要 |
| POST | `/api/auth/login` | メールログイン | 不要 |
| POST | `/api/auth/apple` | Apple IDログイン | 不要 |

#### POST /api/auth/register
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "仁ファン太郎"
}
```

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/apple
```json
{
  "identityToken": "Apple IDトークン（JWT形式）",
  "displayName": "仁ファン太郎"
}
```

レスポンス例:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "仁ファン太郎",
    "memberNumber": "JIN-123456789"
  }
}
```

### ユーザー管理（JWT必須）

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/users/me` | プロフィール取得 |
| PUT | `/api/users/me` | プロフィール更新 |

リクエストヘッダー:
```
Authorization: Bearer <accessToken>
```

#### PUT /api/users/me
```json
{
  "displayName": "新しい表示名",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

---

## マイグレーション

```bash
# マイグレーション実行
npm run migration:run

# マイグレーション生成（Entityを変更後）
npm run migration:generate -- -n MigrationName

# マイグレーション戻し
npm run migration:revert
```

---

## Docker（フルスタック起動）

```bash
# プロジェクトルートから
docker-compose up -d
```

- PostgreSQL: `localhost:5432`
- API: `http://localhost:3000`

---

## プロジェクト構成

```
backend/
├── src/
│   ├── main.ts                    # エントリーポイント
│   ├── app.module.ts              # ルートモジュール
│   ├── auth/                      # 認証モジュール
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/auth.dto.ts
│   ├── users/                     # ユーザー管理モジュール
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/update-profile.dto.ts
│   ├── common/
│   │   ├── guards/jwt-auth.guard.ts
│   │   └── decorators/current-user.decorator.ts
│   └── database/
│       ├── data-source.ts         # TypeORM DataSource（CLI用）
│       ├── entities/              # Entityクラス
│       └── migrations/            # マイグレーションファイル
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```
