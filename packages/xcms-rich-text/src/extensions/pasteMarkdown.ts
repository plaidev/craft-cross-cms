import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface PasteMarkdownOptions {
  /**
   * ペーストされたテキストをMarkdownとして変換するかどうか
   * @default true
   */
  transformPastedText: boolean;
}

export const PasteMarkdown = Extension.create<PasteMarkdownOptions>({
  name: 'pasteMarkdown',

  addOptions() {
    return {
      transformPastedText: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteMarkdown'),
        props: {
          handlePaste: (_view, event) => {
            if (!this.options.transformPastedText) {
              return false;
            }

            const text = event.clipboardData?.getData('text/plain');
            if (!text) {
              return false;
            }

            if (!looksLikeMarkdown(text)) {
              return false;
            }

            try {
              // Markdownをパース
              if (!this.editor.markdown || typeof this.editor.markdown.parse !== 'function') {
                // Markdown extensionが利用できない場合はデフォルト処理に任せる
                return false;
              }

              const json = this.editor.markdown.parse(text);

              // パース成功時だけデフォルト動作を防ぐ
              event.preventDefault();

              // パースしたコンテンツを挿入
              this.editor.commands.insertContent(json);
              return true;
            } catch (error) {
              console.error('Failed to parse pasted Markdown:', error);
              // エラー時はデフォルト処理に任せる（text/htmlがあればそれを使う）
              return false;
            }
          },
        },
      }),
    ];
  },

  addStorage() {
    return {
      // 将来的な拡張のため
    };
  },
});

function looksLikeMarkdown(text: string): boolean {
  // 以下のパターンのいずれかにマッチすればMarkdownと判断
  const patterns = [
    /^#{1,6}\s/m, // 見出し: # ## ###
    /^[-*+]\s/m, // 箇条書き: - * +
    /^\d+\.\s/m, // 順序付きリスト: 1. 2.
    /^>\s/m, // 引用: >
    /```/, // コードブロック: ```
    /\*\*[^*]+\*\*/, // 太字: **text**
    /\*[^*]+\*/, // イタリック: *text*
    /\[.+\]\(.+\)/, // リンク: [text](url)
    /^---+$/m, // 水平線: ---
    /\|.+\|/, // テーブル: | cell | cell |
  ];

  return patterns.some((pattern) => pattern.test(text));
}
