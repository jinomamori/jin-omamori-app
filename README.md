# 仁お守りアプリ - プロジェクト概要

## 🎯 プロジェクト概要

「仁お守りアプリ」は、パーソナリティ「仁」のファンクラブ会員制アプリです。

### サブスクリプションプラン

| プラン | 月額 | 特典 |
|--------|------|------|
| スタンダード | ¥2,980 | 会員証 + 提携店で料理1品サービス（月1回） |
| ゴールド | ¥4,980 | スタンダード特典 + 居酒屋食事会（月1回） |
| VIP | ¥9,800 | ゴールド特典 + 焼肉食事会（月1回） |

## 📁 プロジェクト構成

```
jin-omamori/
├── backend/              # NestJS + PostgreSQL API
│   ├── src/
│   │   ├── auth/        # 認証（Apple ID / メール）
│   │   ├── users/       # ユーザー管理
│   │   ├── subscriptions/ # サブスク管理（Apple IAP）
│   │   ├── membership/  # 会員証・特典
│   │   ├── partner-stores/ # 提携店管理
│   │   ├── events/      # 食事会イベント
│   │   ├── products/    # グッズ管理
│   │   └── orders/      # 注文・決済（Stripe）
│   └── README.md
│
├── ios/                 # SwiftUI iOSアプリ
│   └── JinOmamori/
│       ├── Views/       # 各画面
│       ├── Services/    # API通信・StoreKit
│       ├── Models/      # データモデル
│       └── Utils/       # 共通UI・拡張
│
├── .github/workflows/   # CI/CD設定
├── PROJECT_SPEC.md      # 詳細設計書
└── README.md           # このファイル
```

## 🚀 クイックスタート

### バックエンド

```bash
cd backend
cp .env.example .env
# .envを編集

docker-compose up -d
npm install
npm run migration:run
npm run start:dev
```

### iOSアプリ

1. Xcode 15+ を開く
2. `ios/JinOmamori` フォルダを開く
3. Signing & Capabilities でTeamを設定
4. シミュレーターでビルド実行

## 🛠 技術スタック

### バックエンド
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + TypeORM
- **認証**: JWT + Apple Sign In
- **決済**: Apple IAP（サブスク）+ Stripe（物販）
- **Push**: APNs

### iOS
- **Framework**: SwiftUI
- **最低OS**: iOS 17+
- **決済**: StoreKit 2
- **認証**: Sign in with Apple

## 📱 主な機能

### 会員機能
- [x] Apple ID / メールログイン
- [x] サブスク課金（3プラン）
- [x] デジタル会員証（QRコード）
- [x] プッシュ通知

### 特典機能
- [x] 提携店一覧・検索
- [x] 提携店で料理1品サービス（月1回）
- [x] 食事会イベント参加登録
- [x] 参加確認ボタン

### グッズ機能
- [x] 商品一覧・詳細
- [x] カート機能
- [x] Stripe決済
- [x] 注文履歴

### 管理機能
- [x] 提携店登録・編集
- [x] 食事会イベント作成
- [x] 参加者一覧確認

## 📝 今後の拡張案

- [ ] チャット機能（会員同士）
- [ ] ライブ配信
- [ ] 抽選機能
- [ ] ポイントシステム
- [ ] お友達紹介キャンペーン

## 📄 ライセンス

© 2026 仁 Official Fan Club. All rights reserved.
