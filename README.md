# スキルマップ作成ツール

あなたのスキルを可視化して成長を促進するインタラクティブな Web アプリケーションです。

## 🚀 機能

- **AI 軸・象限生成**: Vertex AI (Gemini)を使用してプロンプトからスキルマップの軸と象限を自動生成
- **インタラクティブキャンバス**: ドラッグ&ドロップでスキルラベルを 4 象限マトリックス上に配置
- **スキルラベル管理**: スキルの追加・編集・削除、カラーカスタマイズ
- **Google 認証**: NextAuth.js を使用したセキュアな認証システム
- **クラウドデプロイ**: Google Cloud Run による自動スケーリング対応

## 📁 プロジェクト構成

```
hackathon/
├── app/                           # Next.js アプリケーション
│   ├── src/app/                   # App Router ページ・API
│   ├── src/components/            # React コンポーネント
│   ├── src/lib/                   # ユーティリティ・設定
│   ├── Dockerfile                 # アプリケーション用 Docker 設定
│   └── README.md                  # アプリ開発者向けドキュメント
├── infra/                         # Terraform インフラ定義
│   ├── *.tf                       # Terraform 設定ファイル
│   ├── architecture.drawio        # システム構成図
│   └── README.md                  # インフラ構成・手順書
├── docs/                          # ドキュメント・設計資料
├── deploy.sh                      # デプロイ自動化スクリプト
├── cloudbuild.yaml               # Google Cloud Build 設定
├── Dockerfile                     # ルート用 Docker 設定（廃止予定）
└── README.md                      # このファイル
```

## 🛠️ 開発・デプロイ手順

### 1. ローカル開発

**詳細な開発環境セットアップは [app/README.md](./app/README.md) を参照**

```bash
cd app
npm install
npm run dev
```

### 2. 本番デプロイ

#### 前提条件

- Google Cloud CLI インストール・認証済み
- Terraform インストール済み
- Google Cloud プロジェクト作成済み

#### 🔧 インフラ構築

**詳細な手順は [infra/README.md](./infra/README.md) を参照**

```bash
# 1. インフラのみ構築（Artifact Registry、Firestore等）
./deploy.sh --infra-only

# 2. アプリケーションビルド
./deploy.sh --build-only

# 3. Cloud Run デプロイ
./deploy.sh --deploy-only
```

#### 🚀 ワンコマンドデプロイ

```bash
# 全体を一括デプロイ
./deploy.sh
```

### 3. デプロイ後の設定

1. **Google Cloud Console** で OAuth 設定を更新
2. **承認済みリダイレクト URI** に以下を追加：
   ```
   https://your-cloud-run-url/api/auth/callback/google
   ```

## 🏗️ アーキテクチャ

- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Next.js API Routes
- **認証**: NextAuth.js + Google OAuth 2.0
- **データベース**: Google Firestore
- **AI**: Google Vertex AI (Gemini)
- **ホスティング**: Google Cloud Run
- **CI/CD**: Google Cloud Build
- **インフラ**: Terraform

## 📚 ドキュメント

- **アプリ開発**: [app/README.md](./app/README.md)
- **インフラ**: [infra/README.md](./infra/README.md)
- **構成図**: [infra/architecture.drawio](./infra/architecture.drawio)
