# 森純平とインテロバング サイト運用

このサイトは、Google Sheetsを作品管理台帳として使い、Netlifyで公開する構成です。

## Google Sheetsで管理する流れ

1. `works-spreadsheet-template.csv` をGoogle Sheetsに読み込みます。
2. 作品を1行ずつ編集します。
3. Google Sheetsで「ファイル」から「共有」または「ウェブに公開」を選び、CSVとして公開します。
4. 公開CSVのURLをNetlifyの環境変数 `SHEET_CSV_URL` に入れます。

現在の作品シートは、何も設定しなくても標準で次のCSVを読みに行く設定にしています。Netlifyの `SHEET_CSV_URL` に同じURLを入れておくと、管理画面でも確認しやすいです。

```txt
https://docs.google.com/spreadsheets/d/1QxVhkYq3JwMbO4keaEf5hJIkd3jme-QPvGga1NJgbas/export?format=csv&gid=0
```

編集用URLを入れてもビルド時にCSV用URLへ変換しますが、Netlifyには上のCSV URLを入れておくと確認しやすいです。

手元の作業でGoogle Sheetsを読めない場合だけ、下書き用の `works-spreadsheet-template.csv` から生成されます。

`タグ` 列に入れた値がPROJECTSページのカテゴリーフィルターになります。複数カテゴリは `Architecture,Urbanism` のようにカンマで区切ります。

`年` 列は年フィルターに使います。作品ページが生成される行の年だけがPROJECTSページに表示されます。

シートの1行目は次の列名に揃えるのが基本です。英語列名でも動きますが、編集しやすいので日本語名にしています。

```txt
ページID,タイトル,英語タイトル,年,タグ,表示情報,説明,画像URL,画像説明,表示順,TOP表示,関連リンク
```

`TOP表示` に `true` を入れた行がTOPページに表示されます。空欄の場合は、シートの上から5件がTOPに表示されます。

`関連リンク` は `https://...` を入れると個別ページに表示されます。複数ある場合は改行、または `リンク名 | https://...` の形で入れられます。

英語の `slug,title,title_en,year,categories,meta,summary,image_url,image_alt,sort_order,featured,related_links` もそのまま読めます。誤って `meta` 列が2つある場合は、2つ目の `meta` を本文用の `説明` として扱います。

ABOUT本文もGoogle Sheetsで管理できます。別タブに `about-content-template.csv` と同じ `key,value` 形式を作り、そのタブの公開CSV URLをNetlifyの環境変数 `ABOUT_CSV_URL` に入れてください。未設定の場合は手元の `about-content-template.csv` から生成されます。

## Netlifyの設定

Netlifyでは、このリポジトリをGitHubなどに置いてから読み込みます。

- Build command: `node scripts/build-from-sheets.mjs`
- Publish directory: `public`
- Environment variable: `SHEET_CSV_URL`
- Optional environment variable: `ABOUT_CSV_URL`

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

Netlifyでは、対象サイトの `Deploys` から `Trigger deploy` → `Deploy site` を押します。シート更新だけでは自動更新されないため、手動デプロイかBuild Hookが必要です。
