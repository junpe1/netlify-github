# 作品ページをスプレッドシートで管理する案

作品の一覧と個別ページの内容は、`works-spreadsheet-template.csv` の列構成で管理できます。Google Sheets にこのCSVを読み込めば、1行が1作品になります。

TOPページではカテゴリーや年の絞り込みは表示せず、PROJECTSページに入った先だけでカテゴリーと年を選べる構成にしています。

## 列

- `slug`: ページID。URLやファイル名に使います。例: `yohaku`
- `title`: 日本語タイトル
- `title_en`: 英語タイトル。日本語タイトルがない作品に使います。
- `year`: 年。作品ページが生成される行の年だけがPROJECTSページの年フィルターに反映されます。
- `categories`: カテゴリー。PROJECTSページのカテゴリーフィルターに反映されます。複数ある場合はカンマ区切り。例: `Architecture,Urbanism`
- `meta`: 一覧右側に出す短い情報
- `summary`: 個別ページ本文
- `image_url`: 個別ページ画像URL
- `image_alt`: 画像の説明

## Google Sitesでの運用

Google Sites では、ページ自体をスプレッドシートから自動生成する機能は標準ではありません。そのため現実的には次のどちらかです。

1. Google Sheetsを台帳として使い、内容を更新したら該当ページへ貼り替える。
2. Google Sheetsを公開CSVにして、埋め込みHTML側で読み込み、一覧と個別表示を自動で描画する。

いまのデザインに近いのは 2 です。ただし、Google Sheetsを「ウェブに公開」する必要があります。公開したCSVのURLを埋め込みHTMLに設定すれば、作品の追加・年・カテゴリー・本文・画像URLをスプレッドシート側で管理できます。

## 推奨カテゴリ

```text
writing
direction
exhibition
publishing
community
workshop
```

## 推奨年

```text
2026
2025
2024
2023
2022
```
