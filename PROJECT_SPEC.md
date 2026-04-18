# 仁お守りアプリ — プロジェクト設計書

## 1. アプリ概要

| 項目 | 内容 |
|------|------|
| アプリ名 | 仁お守りアプリ |
| プラットフォーム | iOS（ネイティブ） |
| 種別 | 会員制ファンクラブアプリ（サブスクリプション型） |
| 収益モデル | 月額サブスク + グッズ販売 |

### サブスクリプションプラン

| プラン | 月額 | 特典 |
|--------|------|------|
| スタンダード | ¥2,980 | ファンクラブ会員証（応援枠） |
| ゴールド | ¥4,980 | 居酒屋月1回無料（アプリで会員証提示） |
| VIP | ¥9,800 | 焼肉月1回無料（アプリで会員証提示） |

---

## 2. 技術スタック

| レイヤー | 技術 | 理由 |
|----------|------|------|
| **iOS フロント** | Swift / SwiftUI | Apple推奨、モダンUI構築 |
| **バックエンド** | Node.js (NestJS) | REST API、管理画面 |
| **データベース** | PostgreSQL | リレーショナルデータ、信頼性 |
| **認証** | Firebase Auth / Sign in with Apple | Apple審査必須対応 |
| **課金** | StoreKit 2 (Apple IAP) | サブスク管理、Apple必須 |
| **グッズ決済** | Stripe | 物販はIAP対象外、外部決済可 |
| **プッシュ通知** | APNs + Firebase Cloud Messaging | リアルタイム通知 |
| **管理画面** | React (Next.js) | グッズ・会員管理用Web |

### Apple審査ポイント
- **サブスク（デジタル会員証）** → Apple IAP **必須**（30%手数料）
- **物理グッズ** → 外部決済（Stripe）OK
- **Sign in with Apple** → 必須
- アプリ内でサブスクのキャンセル方法を明示

---

## 3. 画面構成

```
📱 アプリ画面構成
│
├── 🔐 認証フロー
│   ├── スプラッシュ画面
│   ├── ログイン画面（Apple ID / メール）
│   └── 新規登録画面
│
├── 🏠 ホーム（タブ1）
│   ├── お知らせ・ニュースフィード
│   └── プラン紹介・アップグレード案内
│
├── 🎫 会員証（タブ2）
│   ├── デジタル会員証表示（プラン名・会員番号・QRコード）
│   ├── 利用特典の説明
│   └── 今月の特典利用状況（ゴールド/VIP）
│
├── 🛍️ グッズショップ（タブ3）
│   ├── 商品一覧
│   ├── 商品詳細
│   ├── カート
│   ├── 配送先入力
│   └── 決済（Stripe）
│
├── 👤 マイページ（タブ4）
│   ├── プロフィール編集
│   ├── サブスク管理（プラン変更・キャンセル）
│   ├── 注文履歴
│   ├── 通知一覧
│   └── 設定（通知設定・ログアウト等）
```

---

## 4. 機能一覧 × プラン対応

| 機能 | 未課金 | スタンダード (¥2,980) | ゴールド (¥4,980) | VIP (¥9,800) |
|------|--------|----------------------|-------------------|--------------|
| アプリDL・閲覧 | ✅ | ✅ | ✅ | ✅ |
| 会員登録・ログイン | ✅ | ✅ | ✅ | ✅ |
| デジタル会員証 | ❌ | ✅ | ✅ | ✅ |
| プッシュ通知 | ✅ | ✅ | ✅ | ✅ |
| グッズ購入 | ❌ | ✅ | ✅ | ✅ |
| 居酒屋月1回無料 | ❌ | ❌ | ✅ | ✅ |
| 焼肉月1回無料 | ❌ | ❌ | ❌ | ✅ |

※ゴールド・VIPの特典利用：アプリの会員証画面を店舗で提示。会計はオーナー負担。

---

## 5. データベース設計（主要テーブル）

### users
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| email | VARCHAR | メールアドレス |
| apple_id | VARCHAR | Apple ID連携 |
| display_name | VARCHAR | 表示名 |
| avatar_url | VARCHAR | プロフィール画像 |
| member_number | VARCHAR | 会員番号 |
| created_at | TIMESTAMP | 登録日 |

### subscriptions
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| plan | ENUM | standard / gold / vip |
| apple_transaction_id | VARCHAR | Apple IAP ID |
| status | ENUM | active / expired / cancelled |
| started_at | TIMESTAMP | 開始日 |
| expires_at | TIMESTAMP | 有効期限 |

### benefit_usage（特典利用履歴）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| benefit_type | ENUM | izakaya / yakiniku |
| used_at | TIMESTAMP | 利用日時 |
| month | VARCHAR | 対象月（例：2026-04） |

### products（グッズ）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| name | VARCHAR | 商品名 |
| description | TEXT | 説明 |
| price | INTEGER | 価格（円） |
| image_url | VARCHAR | 商品画像 |
| stock | INTEGER | 在庫数 |

### orders
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| total_price | INTEGER | 合計金額 |
| status | ENUM | pending / paid / shipped / delivered |
| shipping_address | JSONB | 配送先 |
| stripe_payment_id | VARCHAR | Stripe決済ID |
| created_at | TIMESTAMP | 注文日 |

### order_items
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| product_id | UUID | FK → products |
| quantity | INTEGER | 数量 |
| unit_price | INTEGER | 単価 |

---

## 6. API設計（主要エンドポイント）

### 認証
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/auth/apple` | Apple IDログイン |
| POST | `/api/auth/register` | メール登録 |
| POST | `/api/auth/login` | メールログイン |

### ユーザー
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/users/me` | プロフィール取得 |
| PUT | `/api/users/me` | プロフィール更新 |

### サブスクリプション
| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/subscriptions/verify` | Apple IAP レシート検証 |
| GET | `/api/subscriptions/status` | 現在のプラン確認 |
| POST | `/api/subscriptions/webhook` | Apple Server通知受信 |

### 会員証・特典
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/membership` | 会員証情報（プラン・会員番号・QR） |
| GET | `/api/benefits/status` | 今月の特典利用状況 |
| POST | `/api/benefits/use` | 特典利用記録（店舗確認時） |

### グッズ
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/products` | 商品一覧 |
| GET | `/api/products/:id` | 商品詳細 |
| POST | `/api/orders` | 注文作成 |
| POST | `/api/orders/:id/pay` | Stripe決済実行 |
| GET | `/api/orders` | 注文履歴 |

### 通知
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/notifications` | 通知一覧 |

---

## 7. 開発ロードマップ

### Phase 1：基盤構築（3週間）
- プロジェクトセットアップ（Xcode / バックエンド）
- 認証機能（Apple ID / メール）
- ユーザー管理API
- 基本UI骨組み（タブバー、ナビゲーション）

### Phase 2：サブスク & 会員証（3週間）
- StoreKit 2 連携（3プラン）
- Apple IAP レシート検証サーバー
- デジタル会員証画面（QRコード付き）
- 特典利用状況の表示・記録
- 管理画面（会員管理）

### Phase 3：グッズ販売（3週間）
- 商品管理（管理画面）
- 商品一覧・詳細画面
- カート・注文フロー
- Stripe決済連携
- 配送先管理

### Phase 4：仕上げ & リリース（2週間）
- プッシュ通知実装
- UIデザイン仕上げ・アニメーション
- Apple審査対応（ガイドライン確認）
- TestFlight β テスト
- App Store 申請

**合計想定期間：約11週間（約3ヶ月）**

---

## 8. Apple 審査対策チェックリスト

- [ ] Sign in with Apple 実装
- [ ] サブスクはApple IAP経由で課金
- [ ] サブスクのキャンセル方法をアプリ内に明記
- [ ] 利用規約・プライバシーポリシーを用意
- [ ] 自動更新の説明を明記
- [ ] 物理グッズ決済はIAPを使わない（Stripe使用）
- [ ] App Tracking Transparency 対応（iOS 14.5+）
- [ ] 最低限の無料コンテンツ/情報を用意

---

*作成日: 2026-04-18*
*ステータス: 確定 — 開発開始待ち*
