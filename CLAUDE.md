# CLAUDE.md

## プロジェクト概要

Craft Cross CMS（xcms）のパッケージを提供するモノレポです。TipTap（ProseMirror）をベースにしたリッチテキスト機能など、HTMLとJSON間の変換機能を含むリッチテキスト編集・処理機能を提供します。

**命名規則**: パッケージは `@craft-cross-cms/*` の形式で公開されます（例: `@craft-cross-cms/rich-text-core`）。

## コマンド

### ビルド

```bash
pnpm build         # 全パッケージをビルド（turbo使用）
pnpm dev           # watchモードで開発（turbo使用）
```

### テスト

```bash
pnpm test          # 全テストを実行（turbo使用）
```

`packages/rich-text-core`ディレクトリ内から：

```bash
pnpm test          # vitestでテストを実行（テストがなくても成功）
pnpm test:coverage # カバレッジレポート付きでテストを実行
```

### リント・フォーマット

```bash
pnpm lint                # 全リンターを実行（eslint、knip、prettier）
pnpm lint:eslint         # ESLintを実行
pnpm lint:knip           # Knip（未使用コード検出）を実行
pnpm lint:prettier       # Prettierフォーマットチェック
pnpm fix                 # 全問題を自動修正
pnpm fix:eslint          # ESLint問題を自動修正
pnpm fix:prettier        # Prettierフォーマットを自動修正
```

## アーキテクチャ

### モノレポ構造

- **Turboベースのモノレポ**: Turborepoを使用してパッケージ間のビルドとタスクを管理
- **pnpmワークスペース**: pnpmのワークスペースとカタログ機能で依存関係を管理
- **パッケージ**: `packages/rich-text-core`など、今後も増える予定

### パッケージ: @craft-cross-cms/rich-text-core

メインエントリポイント: `packages/rich-text-core/src/index.ts`

**主要なエクスポート:**

**Tiptap Core再エクスポート:**

- `Editor`: TipTapエディタインスタンス
- `generateHTML()`: JSONからHTMLを生成
- `generateJSON()`: HTMLからJSONを生成
- `generateText()`: JSONからプレーンテキストを生成
- 型: `JSONContent`, `Extensions`

**拡張機能ビルダー:**

- `buildTiptapExtensions()`: オプションのカスタムレンダラーを使用して全TipTap拡張機能を組み立てるメイン関数
- `CustomClass`: ノードにカスタムCSSクラスを追加する拡張機能
- `CLASS_NAME_PATTERN`: クラス名検証用の正規表現パターン
- `isValidClassName()`: クラス名検証ユーティリティ
- 型: `ResolveAssetFn`

**エディタオプション:**

- `RICH_TEXT_EDITOR_OPTIONS`: エディタで利用可能な全機能を列挙した定数
- 型: `RichTextEditorOptions`

### パッケージ: @craft-cross-cms/content-references

メインエントリポイント: `packages/content-references/src/index.ts`

- `buildCmsReferencePlan()`: モデル定義の `fields` から reference フィールドの plan（`field` / `refModel` / `multiple`）を導出
- `resolveCmsReferences()`: plan と注入された `fetchByIds` で reference フィールドを参照先コンテンツに置き換える（1階層のみ、未解決は `null` / 配列から除外、`$in` 上限 50 でチャンク、失敗時は全体 reject）
- 依存ゼロ。解決ルールは `packages/content-references/README.md` が正本

## テスト

- テストファイルは`*.test.ts`の命名規則を使用
- Vitestで実行（`vitest run --passWithNoTests`）
- テストは`src/`内のソースファイルと同じ場所に配置
