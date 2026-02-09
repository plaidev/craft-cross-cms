# Changesets

パッケージの変更をリリースする際は、changeset ファイルを PR に含めてください。

## changeset の追加

```bash
pnpm changeset
```

対話形式で以下を入力します:

1. **対象パッケージ** — 変更したパッケージを選択
2. **バージョン種別** — `patch` / `minor` / `major` を選択
3. **summary** — 変更内容の要約（CHANGELOG に記載される）

### バージョン種別の選び方

- **patch** (`0.0.1` → `0.0.2`): バグ修正、re-export の追加など後方互換な変更
- **minor** (`0.1.0` → `0.2.0`): 新機能の追加
- **major** (`0.0.x` → `1.0.0`): 破壊的変更（API の削除・変更など）

### summary の書き方

- CHANGELOG に載るため、利用者目線で何が変わったかを書く
- 英語で記述する
- 例: `add re-exports for getSchema, HTMLContent, and Slice`

## リリースフロー

1. changeset を含む PR を `main` にマージ
2. GitHub Actions が自動で Release PR（バージョン更新 + CHANGELOG 生成）を作成
3. Release PR をマージすると npm にパッケージが公開される

## 参考

- [changesets ドキュメント](https://github.com/changesets/changesets)
- [よくある質問](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
