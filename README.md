# 森純平とインテロバング サイト運用

このサイトは、Google Sheetsを作品管理台帳として使い、Netlifyで公開する構成です。

## Google Sheetsで管理する流れ

1. `works-spreadsheet-template.csv` をGoogle Sheetsに読み込みます。
2. 作品を1行ずつ編集します。
3. Google Sheetsで「ファイル」から「共有」または「ウェブに公開」を選び、CSVとして公開します。
4. 公開CSVのURLをNetlifyの環境変数 `SHEET_CSV_URL` に入れます。

`SHEET_CSV_URL` が未設定のときは、手元の `works-spreadsheet-template.csv` から生成されます。

`categories` 列に入れた値がPROJECTSページのカテゴリーフィルターになります。複数カテゴリは `Architecture,Urbanism` のようにカンマで区切ります。

`year` 列は年フィルターに使います。作品ページが生成される行の年だけがPROJECTSページに表示されます。

## Netlifyの設定

Netlifyでは、このリポジトリをGitHubなどに置いてから読み込みます。

- Build command: `node scripts/build-from-sheets.mjs`
- Publish directory: `public`
- Environment variable: `SHEET_CSV_URL`

`netlify.toml` にも同じ設定を書いてあります。

## Gitの基本

最初の一度だけ:

```bash
git init
git add .
git commit -m "Set up spreadsheet-driven Netlify site"
git branch -M main
git remote add origin <GitHubのリポジトリURL>
git push -u origin main
```

更新するとき:

```bash
git status
git add .
git commit -m "Update site"
git push
```

Google Sheetsの内容だけを変えた場合は、Git操作なしでNetlifyの再デプロイを押せば反映できます。
