# Inorion DRUM 来訪ログ + 管理画面 セットアップ

## 1. 必要なパッケージ

```bash
npm install @vercel/kv
```

## 2. Vercel KV を作成

Vercelダッシュボード → プロジェクト → Storage → Create Database → KV。
作成すると自動で以下の環境変数がプロジェクトに追加される:

```
KV_URL
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

ローカル開発する場合は `vercel env pull .env.local` で取得できる。

## 3. 管理画面パスワードを設定

`.env.local`(ローカル)と Vercel のプロジェクト設定(本番)の両方に追加:

```
ADMIN_PASSWORD=好きなパスワード
```

## 4. このフォルダの中身をプロジェクトにコピー

```
app/api/log-visit/route.js
app/api/admin-stats/route.js
app/admin/page.jsx
lib/geoStats.js
```

すでに `app/` ディレクトリ(App Router)構成のNext.jsプロジェクトが前提。
Pages Router構成の場合は API Route の書き方を `pages/api/...` 形式に直す必要あり
(言ってもらえれば書き直すよ)。

## 5. メインアプリ側で1回だけ呼び出す

トップページ(タップ画面)が表示されたタイミングで、以下を1回だけ叩く:

```js
useEffect(() => {
  fetch('/api/log-visit', { method: 'POST' }).catch(() => {});
}, []);
```

失敗しても本体の体験は止めない設計にしてあるので、fetchの結果は無視してOK。

## 6. 管理画面を見る

`https://your-domain.com/admin` にアクセスして、設定したパスワードを入力。

- 国別の合計訪問数(棒グラフ)
- 日別の推移(棒グラフ)
- 7日 / 30日 / 90日 で切り替え可能

## メモ

- `x-vercel-ip-country` などのgeoヘッダーは **Vercelにデプロイした本番環境でのみ** 有効。
  ローカル開発中は country が常に `XX` になるのが正常な挙動。
- キー設計はシンプルな `visit:count:{国コード}:{日付}` のインクリメント方式。
  テーブル設計やマイグレーションは不要。データ量が増えて重くなってきたら
  Postgres(Vercel Postgres / Supabase)への移行を検討。
