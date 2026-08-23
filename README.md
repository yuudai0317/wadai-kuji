# トークテーマくじ引き

交流会向けのトークテーマくじ引きアプリです。GitHub と Netlify をつなぐだけで公開でき、
「くじをクラウドに同期する」をオンにすると、**同じURLを開いた全端末でテーマと履歴が共有**されます。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | アプリ本体（ビルド不要） |
| `netlify/functions/kuji.mjs` | 同期API。`/api/kuji` で公開されます |
| `netlify.toml` | 公開設定（publish・functions・キャッシュ） |
| `package.json` | 同期APIが使う `@netlify/blobs` |

データは Netlify Blobs に保存されます。別途データベースの契約は不要です。

## 公開手順（GitHub 連携・所要5分ほど）

1. [Netlify](https://app.netlify.com/) にログイン（GitHub アカウントでログインすると連携が楽です）。
2. **Add new site → Import an existing project → GitHub** を選び、リポジトリ `yuudai0317/wadai-kuji` を選択。
   - 初回は *Configure the Netlify app on GitHub* が表示されるので、このリポジトリへのアクセスを許可します。
3. ブランチと設定を確認します。`netlify.toml` があるので、基本はそのままで大丈夫です。
   - Branch to deploy: 公開したいブランチ（`master`、または動作確認用なら作業ブランチ）
   - Build command: 空欄
   - Publish directory: `.`
4. **Deploy site** を押すと、1分ほどで `https://<サイト名>.netlify.app` が発行されます。これが公開リンクです。
5. サイト名は **Site configuration → Change site name** で好きな名前に変更できます（例: `merit-wadai-kuji.netlify.app`）。

以降は、このブランチに push するたびに自動で再デプロイされます。

## 同期の使い方

1. 公開URLを開く → 「テーマを編集」→ **くじをクラウドに同期する** をオン。
2. テーマを登録すると自動で保存されます（画面下部に「保存しました（時刻）」と表示）。
3. 別の端末で同じURLを開き、同じく同期をオンにすると同じテーマ・履歴が出ます。
   他端末の変更は5秒ごとに自動で反映されます。「今すぐ同期」で即時反映もできます。

- 同期をオンにしたとき、すでに保存済みのくじがある場合は「読み込む／上書きする」を選べます。
- 同期をオフにしている間、内容はその端末の中だけで保持されます。
- ローカルでファイルを直接開いた場合は API がないため、自動的にブラウザ内保存に切り替わります。

## 同期API

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/kuji` | 保存済みのくじを返します（未保存なら `null`） |
| POST | `/api/kuji` | `{themes, drawn, exclude, updatedAt}` を保存します |

くじは1サイトにつき1つ保存されます（URLを共有した全員が同じくじを見ます）。

## ローカルで動かす

```bash
npm install
npx netlify dev     # http://localhost:8888 で /api/kuji ごと動作します
```

`index.html` を直接ブラウザで開いても動きますが、その場合の同期はブラウザ内保存になります。
