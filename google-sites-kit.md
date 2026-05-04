# Google Sites 再現キット

このメモは、現在の「森純平とインテロバング」サイトを Google Sites でなるべく近く再現するための制作指示です。Google Sites は自由な CSS をサイト全体へ適用できないため、完全再現ではなく、濃い緑の罫線、控えめな文字、PROJECTS 一覧、記事ごとの個別ページという構成を優先します。

## 1. 推奨構成

Google Sites では、以下のページを作ります。

- Home
- Projects
- About
- 余白の研究室
- Civic Question Archive
- 夜のためのミュージアム
- Interrobang Papers
- まちの句読点
- Table of Small Questions

ナビゲーションには `PROJECTS`、`ABOUT`、`INQUIRIES` を表示します。`PROJECTS` と `ABOUT` はそれぞれ個別ページへリンクし、`INQUIRIES` はメールリンクにします。

## 2. テーマ設定

Google Sites の右側メニューで `Themes` からカスタムテーマを作ります。

- Theme name: `Interrobang Blue`
- Main color: `#173D2C`
- Background: `#FBFAF4`
- Text: `#173D2C`
- Secondary text: `#173D2C`
- Navigation: Top
- Site width: Full
- Font style: もっとも細く、癖が少ない sans 系

Google Sites のカスタムテーマでは、背景色、文字色、リンク、ディバイダー、サイト幅などを調整できます。より細かく寄せる場合は、各セクションの背景を `#FBFAF4` にして、文字・リンク・区切り線を `#173D2C` にします。

## 3. Home ページ

Header type はなるべく小さいものにします。大きなバナー画像は使いません。

ページ本文:

```text
ABOUT

森純平とインテロバング

JUNPEI MORIは、文章、編集、企画、ウェブ、展示の言葉を横断して活動しています。

INTERROBANGは、問いの輪郭を見つけ、まだ名前のついていない感覚を読み手や使い手に届くかたちへ整える制作室です。

Selected Projects
Inquiries
```

`Selected Projects` は Projects ページへ、`Inquiries` はメールリンクとして下部に置きます。

## 4. Projects ページ

最初は画像なしの一覧だけにします。1行ごとにテキストリンクを作り、右側にカテゴリと年を置きます。Google Sites で完全な表組みが難しい場合は、2カラムレイアウトを使います。

```text
PROJECTS

Selected Projects

Selected Projects                         2019 - 2026

余白の研究室                              Editorial Direction / 2026
Civic Question Archive                    Planning / Writing / 2025
夜のためのミュージアム                    Copy / Exhibition Text / 2025
Interrobang Papers                        Publishing / Identity / 2024
まちの句読点                              Community Editing / 2023
Table of Small Questions                  Workshop / Research / 2022
```

各タイトルは、それぞれの個別ページへリンクします。Projects ページには、カテゴリーと年のタグを置きます。

カテゴリー例:

```text
All / Writing / Direction / Exhibition / Publishing / Community / Workshop
```

年:

```text
All / 2026 / 2025 / 2024 / 2023 / 2022
```

## 5. 個別記事ページテンプレート

各記事ページはこの構成にします。

```text
[カテゴリ / 年]

[記事タイトル]

[メタ情報]

[本文]

[画像]

Back to Projects
```

画像は本文の下に1枚だけ置くと、Google Sites でも近い雰囲気になります。

## 6. About ページ

```text
ABOUT

問いを、かたちにする。

インテロバングは、疑問符と感嘆符が重なった記号です。わからなさに驚き、驚きから問い直す。その態度を名前にして、森純平は言葉と編集を中心に、文化と生活のあいだにあるプロジェクトへ伴走します。

Direction
企画設計、コンセプトメイク、プロジェクト編集

Writing
ステートメント、コピー、インタビュー、展示テキスト

Identity
ブランド言語、トーン設計、ウェブサイト構成
```

## 7. より見た目を寄せる方法

Google Sites の通常編集だけだと、細い濃緑の線や余白の正確な再現に限界があります。より近づけたい場合は、`google-sites-full-embed.html` の中身を Google Sites の `Insert` → `Embed` → `Embed code` に貼り付けます。

この方法だと、Google Sites の中に小さなカスタムサイトを埋め込む形になります。見た目はかなり寄せられますが、Google Sites ネイティブのページ編集とは少し違う扱いになります。
