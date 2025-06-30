# デプロイ手順

## 前提条件

1. Google Cloud CLI がインストールされていること
2. Terraform がインストールされていること
3. Docker がインストールされていること
4. Google Cloud Project が作成されていること

## 1. Google Cloud 環境の準備（設定プロファイル使用）

### 1.1 新しい設定プロファイルを作成（会社用と個人用を分離）

```bash
# 新しい設定プロファイルを作成
gcloud config configurations create skill-map-personal

# 現在の設定プロファイルを確認
gcloud config configurations list
```

### 1.2 個人用アカウントでログインとプロジェクト設定

```bash
# 個人用Googleアカウントでログイン
gcloud auth login

# プロジェクトを設定
gcloud config set project skill-map-464210

# アプリケーションデフォルト認証情報を設定
gcloud auth application-default login

# 設定確認
gcloud config list
gcloud auth list
```

### 1.3 必要な API を有効化

```bash
# 必要なAPIを有効化（Terraformでも実行されますが、事前に有効化しておくとスムーズです）
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 1.4 設定プロファイルの切り替え方法

```bash
# 会社用に戻す場合
gcloud config configurations activate default

# 個人用（今回のプロジェクト）に切り替える場合
gcloud config configurations activate skill-map-personal

# 全ての設定プロファイルを確認
gcloud config configurations list
```

## 2. Terraform でインフラ構築

⚠️ **重要**: Terraform で Cloud Run サービスを作成する前に、参照する Docker イメージを先にビルドして Artifact Registry にプッシュする必要があります。

### 2.1 基本インフラの構築（Docker イメージなし）

```bash
# infraディレクトリに移動
cd infra

# terraform.tfvarsファイルを作成
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvarsを編集して実際の値を設定（詳細は下記セクション参照）

# Terraformを初期化
terraform init

# 実行計画を確認
terraform plan

# 基本インフラのみを構築（Cloud Runサービス以外）
terraform apply -target=google_project_service.required_apis -target=google_firestore_database.skill_map_db -target=google_artifact_registry_repository.skill_map_repo -target=google_service_account.cloud_run_sa -target=google_project_iam_member.firestore_user
```

### 2.2 Docker イメージのビルドとプッシュ

```bash
# プロジェクトルートディレクトリに戻る
cd ..

# Docker認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# Dockerイメージをビルド（appフォルダ構造対応）
docker build -t asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest .

# Artifact Registryにプッシュ
docker push asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest
```

### 2.3 Cloud Run サービスのデプロイ

```bash
# infraディレクトリに戻る
cd infra

# 残りのリソース（Cloud Runサービス）を構築
terraform apply
```

## 4. アプリケーションのデプロイ（代替手法）

### 方法 1: Cloud Build を使用（推奨）

```bash
# プロジェクトルートディレクトリで実行
gcloud builds submit --config cloudbuild.yaml .
```

### 方法 2: 手動デプロイ

```bash
# 1. コンテナイメージをビルド
docker build -t asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest .

# 2. Artifact Registryにプッシュ
docker push asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest

# 3. Cloud Runにデプロイ
gcloud run deploy skill-map-service \
  --image asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated
```

## 5. 動作確認

```bash
# Cloud RunのURLを取得
terraform output cloud_run_url

# または
gcloud run services describe skill-map-service --region asia-northeast1 --format 'value(status.url)'
```

## 6. Google OAuth 設定の更新

Google Cloud Console（https://console.cloud.google.com/）で：

1. API とサービス → 認証情報
2. OAuth 2.0 クライアント ID を選択
3. 承認済みのリダイレクト URI に以下を追加：
   ```
   https://YOUR_CLOUD_RUN_URL/api/auth/callback/google
   ```

## 7. 環境変数の確認

デプロイ後、以下の環境変数が正しく設定されていることを確認：

- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CLOUD_PROJECT
- FIRESTORE_DATABASE_ID

## トラブルシューティング

### 認証エラーが発生した場合

**エラー例:**

```
Error: Attempted to load application default credentials since neither `credentials` nor `access_token` was set in the provider block.
```

**解決方法:**

```bash
# 正しい設定プロファイルがアクティブかどうか確認
gcloud config configurations list

# skill-map-personalプロファイルに切り替え
gcloud config configurations activate skill-map-personal

# アプリケーションデフォルト認証情報を再設定
gcloud auth application-default login

# 設定確認
gcloud config list
gcloud auth list
```

### 設定プロファイルが混在している場合

```bash
# 現在アクティブな設定プロファイルを確認
gcloud config configurations list

# 間違ったプロファイルを使っている場合の切り替え
gcloud config configurations activate skill-map-personal

# プロジェクトが正しく設定されているか確認
gcloud config get-value project
```

### Cloud Run サービスが起動しない場合

```bash
# ログを確認
gcloud logs read --limit 50 --service skill-map-service --region asia-northeast1
```

### Firestore アクセスエラーの場合

```bash
# サービスアカウントの権限を確認
gcloud projects get-iam-policy skill-map-464210
```

### コンテナビルドエラーの場合

```bash
# ローカルでDockerビルドをテスト
docker build -t test-build .
docker run -p 3000:3000 test-build
```

### Docker イメージが見つからないエラーの場合

**エラー例:**

```
Error: Error waiting to create Service: Error waiting for Creating Service: Error code 5, message: Revision 'skill-map-service-00001-87t' is not ready and cannot serve traffic. Image 'asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest' not found.
```

**解決方法:**

```bash
# 1. Artifact Registryにイメージが存在するか確認
gcloud artifacts docker images list asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo

# 2. イメージが存在しない場合、手順2.2に従ってビルド・プッシュ
cd ..  # プロジェクトルートに移動
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
docker build -t asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest .
docker push asia-northeast1-docker.pkg.dev/skill-map-464210/skill-map-repo/skill-map:latest

# 3. 再度Terraformを実行
cd infra
terraform apply
```

### Terraform 状態の復旧が必要な場合

```bash
# 現在のTerraform状態を確認
terraform state list

# 失敗したCloud Runリソースを削除（必要に応じて）
terraform state rm google_cloud_run_v2_service.skill_map_service

# 再度apply
terraform apply
```
