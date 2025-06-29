# スキルマップ作成ツール

あなたのスキルを可視化して成長を促進するインタラクティブな Web アプリケーションです。

## 機能

- **AI 軸・象限生成**: Vertex AI (Gemini)を使用してプロンプトからスキルマップの軸と象限を自動生成
- **インタラクティブキャンバス**: ドラッグ&ドロップでスキルラベルを 4 象限マトリックス上に配置
- **スキルラベル管理**: スキルの追加・編集・削除、カラーカスタマイズ
- **Google 認証**: NextAuth.js を使用したセキュアな認証システム

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI
- **認証**: NextAuth.js (Google OAuth)
- **アニメーション**: Framer Motion
- **AI**: Google Vertex AI (Gemini 1.5 Flash)

## ローカル開発環境のセットアップ

### 前提条件

以下がインストールされていることを確認してください：

- Node.js (18.18.0 以上)
- npm, pnpm, または yarn
- Google Cloud CLI

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd hackathon/app

# 依存関係をインストール
pnpm install
# または
npm install
```

### 2. Google Cloud CLI の設定

1. **Google Cloud CLI のインストール:**[インストール手順](https://cloud.google.com/sdk/docs/install?hl=ja#installation_instructions)

1. **認証設定:**

    ```bash
    # 1. Googleアカウントでログイン
    gcloud auth login

    # 2. プロジェクトを設定
    gcloud config set project skill-map-464210

    # 3. アプリケーションデフォルト認証情報を設定（重要！）
    gcloud auth application-default login
    ```

1. **認証確認:**

    ```bash
    # 認証状態の確認
    gcloud auth list

    # プロジェクト設定の確認
    gcloud config list

    # Vertex AIアクセスのテスト
    gcloud ai models list --region=asia-northeast1
    ```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=skill-map-464210

# Vertex AI Configuration
VERTEX_AI_LOCATION=asia-northeast1
VERTEX_AI_MODEL=gemini-1.5-flash

# Firestore Configuration
FIRESTORE_DATABASE_ID=(default)
```

### 4. 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev
# または
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

## プロジェクト構造

```
app/
├── src/
│   ├── app/                # App Router
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── page.tsx        # メインページ
│   │   ├── providers.tsx   # SessionProvider
│   │   ├── signin/         # サインインページ
│   │   ├── api/            # API Routes
│   │   └── components/     # アプリ固有コンポーネント
│   ├── components/ui/      # 共通UIコンポーネント
│   └── lib/               # ユーティリティ・設定
├── public/                # 静的ファイル
├── .env.local            # 環境変数（gitignore対象）
└── package.json          # 依存関係
```

### 認証状態のリセット

```bash
# 認証情報をクリア
gcloud auth revoke --all

# 再度認証
gcloud auth login
gcloud auth application-default login
```

## 開発チーム向け情報

新しい開発者がプロジェクトに参加する場合：

1. **リポジトリアクセス**: GitHub リポジトリへのアクセス権を付与
2. **GCP アクセス**: プロジェクトオーナーが Google Cloud プロジェクトへのアクセス権を付与
3. **環境変数**: `.env.local`ファイルの設定値を共有
4. **認証設定**: 上記の「Google Cloud CLI の設定」手順を実行

