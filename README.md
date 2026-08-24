# 話題のくじ

雑談が続く **500の問いかけ** を内蔵した、くじ引きアプリです。
登録もログインも不要で、開いてボタンを押すだけで話題が決まります。

ビルド工程のない静的サイトなので、GitHub と Netlify をつなぐだけで公開できます。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | アプリ本体（HTML1枚で完結。外部ライブラリ・API・ビルド不要） |
| `netlify.toml` | 公開設定（`index.html` をそのまま配信するだけ） |
| `setup-500theme.sh` | GitHub リポジトリ作成〜Netlify 公開までのセットアップスクリプト |

サーバー処理もデータベースもありません。**同期機能はありません**ので、
各端末が独立して動作します（引いた履歴はその端末の画面だけに残ります）。

## 使い方

1. 上部のボタンでカテゴリを選びます（「すべて」なら500問すべてが対象）。
2. **くじを引く** を押すと、約3.5秒かけて候補が流れ、話題が1つ決まります。
3. 一度出た話題は再び出ません。残り数はボタンの下に表示されます。
4. 直近10件が「これまでの話題」に残ります。
5. 出しきったカテゴリは、別のカテゴリを選べば続けられます。

ページを再読み込みすると、履歴と「出した話題」はリセットされます。

## 収録テーマ（10カテゴリ × 50問 ＝ 500問）

| カテゴリ | 内容 |
| --- | --- |
| 自己紹介・その人らしさ | 最近ハマっていること、性格、こだわりなど |
| 食べ物・お店 | 好きな料理、行きつけ、食の好みなど |
| 旅行・おでかけ | 行った場所、行きたい国、旅のスタイルなど |
| 子ども時代・思い出 | 学生時代、昔の遊び、家族の思い出など |
| 仕事・働き方 | きっかけ、やりがい、働き方の好みなど |
| 趣味・エンタメ | 映画、音楽、本、スポーツ、推しなど |
| もしも・空想 | 宝くじが当たったら、超能力、タイムトラベルなど |
| 価値観・ちょっと深い話 | 幸せ、選択、大事にしていることなど |
| 笑える失敗談・あるある | 寝坊、忘れ物、言い間違いなど |
| 季節・日常のこと | 季節の過ごし方、家事、生活習慣など |

問いかけの重複はありません。

## 公開手順

### A. スクリプトでまとめて行う（おすすめ）

このリポジトリを手元にクローンして、同梱の `setup-500theme.sh` を実行します。
`gh` CLI（[cli.github.com](https://cli.github.com/)）にログイン済みであることが前提です。

```bash
gh auth login                          # 未ログインの場合のみ
bash setup-500theme.sh                 # GitHub に 500Theme を作成して push
bash setup-500theme.sh --netlify       # 続けて Netlify にデプロイし公開URLを表示
```

サイト名を決めたい場合:

```bash
SITE_NAME=merit-500theme bash setup-500theme.sh --netlify
# → https://merit-500theme.netlify.app
```

### B. 画面から手動で行う（所要5分ほど）

1. GitHub で新しいリポジトリ **`500Theme`** を作成します（public / README なしの空リポジトリ）。
2. 手元で `index.html` `netlify.toml` `README.md` を push します。

   ```bash
   git init -b main
   git add index.html netlify.toml README.md
   git commit -m "話題のくじ（500問）を公開する"
   git remote add origin https://github.com/<あなたのID>/500Theme.git
   git push -u origin main
   ```

3. [Netlify](https://app.netlify.com/) にログイン（GitHub アカウントでのログインが楽です）。
4. **Add new site → Import an existing project → GitHub** を選び、リポジトリ `500Theme` を選択。
   - 初回は *Configure the Netlify app on GitHub* が出るので、このリポジトリへのアクセスを許可します。
5. 設定を確認します。`netlify.toml` があるので基本はそのままで大丈夫です。
   - Branch to deploy: `main`
   - Build command: **空欄**
   - Publish directory: **`.`**
6. **Deploy site** を押すと、1分ほどで `https://<サイト名>.netlify.app` が発行されます。これが公開リンクです。
7. サイト名は **Site configuration → Change site name** で変更できます（例: `merit-500theme.netlify.app`）。

以降は `main` に push するたびに自動で再デプロイされます。

## テーマを増やす・書き換える

`index.html` の中の `THEME_DATA` を編集してください。

```js
const THEME_DATA = [
  {
    category: "自己紹介・その人らしさ",
    themes: [
      "最近ハマっていることは何ですか？",
      // ...
    ]
  },
  // ...
];
```

カテゴリを増やすと、上部のボタンも自動で増えます。
件数が50でなくても動作しますが、残り数の分母表示（`50` と `500`）は
固定値なので、件数を変える場合は `updateMeta()` 内の数値も合わせてください。

## ローカルで確認する

`index.html` をブラウザで直接開くだけで動きます。サーバーは不要です。

```bash
npx http-server .    # http://localhost:8080 で確認する場合
```
