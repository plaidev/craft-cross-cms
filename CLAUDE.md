# CLAUDE.md

## プロジェクト概要

Craft Cross CMS（xcms）のパッケージを提供するモノレポです。TipTap（ProseMirror）をベースにしたリッチテキスト機能など、HTMLとJSON間の変換機能を含むリッチテキスト編集・処理機能を提供します。

**命名規則**: パッケージは `@plaidev/xcms-*` の形式で公開されます（例: `@plaidev/xcms-rich-text`）。

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

`packages/core`ディレクトリ内から：

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
- **パッケージ**: `packages/xcms-rich-text`など、今後も増える予定

### パッケージ: @plaidev/xcms-rich-text

メインエントリポイント: `packages/xcms-rich-text/src/index.ts`

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

## テスト

- テストファイルは`*.test.ts`の命名規則を使用
- Vitestで実行（`vitest run --passWithNoTests`）
- テストは`src/`内のソースファイルと同じ場所に配置
