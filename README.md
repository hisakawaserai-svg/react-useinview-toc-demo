# React useInView TOC Demo

`react-intersection-observer` の `useInView` を使い、スクロール位置に応じて目次の現在地を管理する方法を検証するデモです。

## Demo

- **Live Demo:** https://hisakawaserai-svg.github.io/react-useinview-toc-demo/
- **Qiita Article:** https://qiita.com/Serai/items/2dfd54817be60a7750c5

## Overview

セクションの表示状態に応じて目次の現在地を切り替える際、`threshold` や `rootMargin` の設定、表示状態の管理方法によって挙動がどう変わるのかを比較します。

## Patterns

| Pattern | Description |
| --- | --- |
| A | `threshold: 0.1`、`rootMargin: '0px'` で監視する |
| B | `threshold: 0`、`rootMargin: '-40% 0px'` に変更する |
| C | `true` / `false` の通知を使い、監視範囲内のセクションを一覧管理する |

AとBでは、スクロールして戻った際に現在地が正しく更新されない問題が残りました。Cでは、各セクションの表示状態を一覧で管理する方法を試しています。

## Tech Stack

- React
- TypeScript
- Vite
- `react-intersection-observer`

## Run Locally

```bash
npm install
npm run dev
```

起動後、ターミナルに表示されるローカル URL をブラウザで開いてください。

## Purpose

スクロールに応じた現在地の管理について、実際の挙動を比較しながら理解することを目的としています。
