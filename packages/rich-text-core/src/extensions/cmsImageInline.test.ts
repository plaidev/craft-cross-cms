/**
 * @vitest-environment jsdom
 */
import type { MarkdownLexerConfiguration, MarkdownToken } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import { TableKit } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';
import { assert, describe, expect, it } from 'vitest';
import { generateCmsImage, type ResolveAssetFn } from './cmsImage.js';
import { generateCmsImageInline } from './cmsImageInline.js';

const stubHelpers = {
  renderChildren: () => '',
  wrapInBlock: () => '',
  indent: (c: string) => c,
};
const stubCtx = { index: 0, level: 0 };
const stubTokens: MarkdownToken[] = [];
const stubLexer: MarkdownLexerConfiguration = {
  inlineTokens: () => [],
  blockTokens: () => [],
};

const createEditor = (
  content: unknown,
  options?: {
    resolveAsset?: ResolveAssetFn;
  },
) => {
  const CmsImage = generateCmsImage({ resolveAsset: options?.resolveAsset });
  const CmsImageInline = generateCmsImageInline({ resolveAsset: options?.resolveAsset });

  return new Editor({
    extensions: [
      StarterKit,
      CmsImage,
      CmsImageInline,
      Link.configure({ openOnClick: false }),
      TableKit,
    ],
    content: content as Record<string, unknown>,
  });
};

const collectNodes = (
  json: Record<string, unknown>,
  typeName: string,
): Array<Record<string, unknown>> => {
  const nodes: Array<Record<string, unknown>> = [];
  if (json.type === typeName) nodes.push(json);
  if (Array.isArray(json.content)) {
    for (const c of json.content)
      nodes.push(...collectNodes(c as Record<string, unknown>, typeName));
  }
  return nodes;
};

describe('cmsImageInline parseHTML', () => {
  it('親要素がaタグのimgをcmsImageInlineとしてパースする', () => {
    // given
    const html =
      '<p><a href="https://example.com"><img data-asset-id="asset1" src="https://example.com/img.jpg"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect(inlineImages).toHaveLength(1);
    expect((inlineImages[0].attrs as Record<string, unknown>).id).toBe('asset1');

    editor.destroy();
  });

  it('親要素がaタグでないimgはcmsImageInlineとしてパースしない', () => {
    // given
    const html = '<img data-asset-id="asset1">';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect(inlineImages).toHaveLength(0);

    const blockImages = collectNodes(json as Record<string, unknown>, 'cmsImage');
    expect(blockImages).toHaveLength(1);

    editor.destroy();
  });

  it('data-asset-id属性をパースする', () => {
    // given
    const html = '<p><a href="https://example.com"><img data-asset-id="myasset123"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect((inlineImages[0].attrs as Record<string, unknown>).id).toBe('myasset123');

    editor.destroy();
  });

  it('src属性をパースする', () => {
    // given
    const html =
      '<p><a href="https://example.com"><img data-asset-id="asset1" src="https://cdn.example.com/img.jpg"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect((inlineImages[0].attrs as Record<string, unknown>).src).toBe(
      'https://cdn.example.com/img.jpg',
    );

    editor.destroy();
  });

  it('alt属性をパースする', () => {
    // given
    const html =
      '<p><a href="https://example.com"><img data-asset-id="asset1" alt="代替テキスト"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect((inlineImages[0].attrs as Record<string, unknown>).alt).toBe('代替テキスト');

    editor.destroy();
  });

  it('width・height属性をパースする', () => {
    // given
    const html =
      '<p><a href="https://example.com"><img data-asset-id="asset1" width="800" height="600"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    const attrs = inlineImages[0].attrs as Record<string, unknown>;
    expect(attrs.width).toBe('800');
    expect(attrs.height).toBe('600');

    editor.destroy();
  });

  it('親aタグのhrefをLink Markとして保持する', () => {
    // given
    const html = '<p><a href="https://example.com/link"><img data-asset-id="asset1"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const images = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    const marks = images[0].marks as Array<Record<string, unknown>>;
    expect(marks).toBeDefined();
    const linkMark = marks.find((m) => m.type === 'link');
    expect(linkMark).toBeDefined();
    expect((linkMark!.attrs as Record<string, unknown>).href).toBe('https://example.com/link');

    editor.destroy();
  });

  it('親aタグのtarget属性をLink Markとして保持する', () => {
    // given
    const html =
      '<p><a href="https://example.com" target="_blank"><img data-asset-id="asset1"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();

    // then
    const images = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    const marks = images[0].marks as Array<Record<string, unknown>>;
    const linkMark = marks.find((m) => m.type === 'link');
    expect((linkMark!.attrs as Record<string, unknown>).target).toBe('_blank');

    editor.destroy();
  });
});

describe('cmsImageInline renderHTML', () => {
  it('resolveAssetなしでdata-asset-idを含むimgをレンダリングする', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'cmsImageInline',
              attrs: { id: 'asset1' },
            },
          ],
        },
      ],
    };

    // when
    const editor = createEditor(content);
    const html = editor.getHTML();

    // then
    expect(html).toContain('data-asset-id="asset1"');

    editor.destroy();
  });

  it('resolveAssetで解決したアセット情報でレンダリングする', () => {
    // given
    const resolveAsset: ResolveAssetFn = (assetId) => ({
      id: assetId,
      sys: {
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null,
        publishedAt: null,
      },
      title: 'Test image',
      description: 'Test description',
      altText: 'Resolved alt',
      tagIds: [],
      file: {
        name: 'resolved.jpg',
        mimeType: 'image/jpeg',
        src: 'https://cdn.example.com/resolved.jpg',
        size: 102400,
        width: 1200,
        height: 800,
      },
    });

    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'cmsImageInline',
              attrs: { id: 'asset1' },
            },
          ],
        },
      ],
    };

    // when
    const editor = createEditor(content, { resolveAsset });
    const html = editor.getHTML();

    // then
    expect(html).toContain('src="https://cdn.example.com/resolved.jpg"');
    expect(html).toContain('alt="Resolved alt"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');

    editor.destroy();
  });

  it('アセットが見つからない場合空srcでレンダリングする', () => {
    // given
    const resolveAsset: ResolveAssetFn = () => null;

    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'cmsImageInline',
              attrs: { id: 'asset1' },
            },
          ],
        },
      ],
    };

    // when
    const editor = createEditor(content, { resolveAsset });
    const html = editor.getHTML();

    // then
    expect(html).toContain('src=""');

    editor.destroy();
  });
});

describe('cmsImageInline Link Mark統合', () => {
  it('setLinkコマンドでLink Markを適用できる', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'cmsImageInline', attrs: { id: 'img1' } }],
        },
      ],
    };
    const editor = createEditor(content);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection({ from: imagePos, to: imagePos + 1 });
    editor.commands.setLink({ href: 'https://example.com' });

    // then
    const json = editor.getJSON();
    const images = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    const marks = images[0].marks as Array<Record<string, unknown>>;
    const linkMark = marks.find((m) => m.type === 'link');
    expect(linkMark).toBeDefined();
    expect((linkMark!.attrs as Record<string, unknown>).href).toBe('https://example.com');

    editor.destroy();
  });

  it('Link Mark付きのHTMLがaでimgをラップしてレンダリングされる', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'cmsImageInline',
              attrs: { id: 'img1' },
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
      ],
    };

    // when
    const editor = createEditor(content);
    const html = editor.getHTML();

    // then
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('data-asset-id="img1"');
    expect(html).toContain('target="_blank"');

    editor.destroy();
  });

  it('<a>でラップされた<img>のHTMLをcmsImageInline + Link Markとしてパースできる', () => {
    // given: Link付きHTMLをレンダリング
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'cmsImageInline',
              attrs: { id: 'img1' },
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
      ],
    };
    const editor1 = createEditor(content);
    const html = editor1.getHTML();
    editor1.destroy();

    // when: 出力HTMLを再パース
    const editor2 = createEditor(html);
    const json = editor2.getJSON();

    // then: cmsImageInline + Link Mark として復元される
    const images = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);
    const marks = images[0].marks as Array<Record<string, unknown>>;
    const linkMark = marks.find((m) => m.type === 'link');
    expect(linkMark).toBeDefined();
    expect((linkMark!.attrs as Record<string, unknown>).href).toBe('https://example.com');

    editor2.destroy();
  });

  it('Link付与→Undoで画像とリンクが正しく巻き戻る', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '前' },
            { type: 'cmsImageInline', attrs: { id: 'img1' } },
            { type: 'text', text: '後' },
          ],
        },
      ],
    };
    const editor = createEditor(content);

    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });

    // when: Link付与 → Undo
    editor.commands.setTextSelection({ from: imagePos, to: imagePos + 1 });
    editor.commands.setLink({ href: 'https://example.com' });
    expect(editor.getHTML()).toContain('href="https://example.com"');

    editor.commands.undo();

    // then
    expect(editor.getHTML()).not.toContain('href=');
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);

    editor.destroy();
  });

  it('Link付与→unsetLinkで画像が消えない', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '前' },
            { type: 'cmsImageInline', attrs: { id: 'img1' } },
            { type: 'text', text: '後' },
          ],
        },
      ],
    };
    const editor = createEditor(content);

    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });

    // when: Link付与 → unsetLink
    editor.commands.setTextSelection({ from: imagePos, to: imagePos + 1 });
    editor.commands.setLink({ href: 'https://example.com' });
    expect(editor.getHTML()).toContain('href=');

    editor.commands.setTextSelection({ from: imagePos, to: imagePos + 1 });
    editor.commands.unsetLink();

    // then
    expect(editor.getHTML()).not.toContain('href=');
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);

    editor.destroy();
  });
});

describe('cmsImageInline Markdown', () => {
  it('Link Mark付きで [![image](id)](url) 形式のマークダウンをレンダリングする', () => {
    // given
    const CmsImageInline = generateCmsImageInline({});
    const nodeJson = {
      type: 'cmsImageInline',
      attrs: { id: 'asset123' },
      marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
    };

    // when
    const result = CmsImageInline.config.renderMarkdown?.(nodeJson, stubHelpers, stubCtx);

    // then
    expect(result).toBe('[![image](asset123)](https://example.com)');
  });

  it('Link Markなしで ![image](id) 形式のマークダウンをレンダリングする', () => {
    // given
    const CmsImageInline = generateCmsImageInline({});
    const nodeJson = {
      type: 'cmsImageInline',
      attrs: { id: 'asset123' },
    };

    // when
    const result = CmsImageInline.config.renderMarkdown?.(nodeJson, stubHelpers, stubCtx);

    // then
    expect(result).toBe('![image](asset123)');
  });

  it('idがnullのとき空文字列を返す', () => {
    // given
    const CmsImageInline = generateCmsImageInline({});
    const nodeJson = {
      type: 'cmsImageInline',
      attrs: { id: null },
    };

    // when
    const result = CmsImageInline.config.renderMarkdown?.(nodeJson, stubHelpers, stubCtx);

    // then
    expect(result).toBe('');
  });
});

describe('cmsImageInline markdownTokenizer', () => {
  it('[![image](id)](url) 構文をトークナイズする', () => {
    // given
    const src = '[![image](abc123)](https://example.com)';
    const CmsImageInline = generateCmsImageInline({});
    const tokenizer = CmsImageInline.config.markdownTokenizer;

    // when
    const result = tokenizer?.tokenize(src, stubTokens, stubLexer);

    // then
    expect(result).toEqual({
      type: 'cmsImageInline',
      raw: '[![image](abc123)](https://example.com)',
      id: 'abc123',
      href: 'https://example.com',
    });
  });

  it('リンク付き画像構文の開始位置を検出する', () => {
    // given
    const src = 'Some text [![image](abc123)](https://example.com)';
    const CmsImageInline = generateCmsImageInline({});
    const { start } = CmsImageInline.config.markdownTokenizer ?? {};
    assert(typeof start === 'function');

    // when
    const result = start(src);

    // then
    expect(result).toBe(10);
  });

  it('通常の ![image](id) にはマッチしない', () => {
    // given
    const src = '![image](abc123)';
    const CmsImageInline = generateCmsImageInline({});
    const tokenizer = CmsImageInline.config.markdownTokenizer;

    // when
    const result = tokenizer?.tokenize(src, stubTokens, stubLexer);

    // then
    expect(result).toBeUndefined();
  });
});

describe('cmsImageInline parseMarkdown', () => {
  it('トークンからparagraph > cmsImageInline + Link MarkのJSONを生成する', () => {
    // given
    const CmsImageInline = generateCmsImageInline({});
    const token = {
      type: 'cmsImageInline',
      raw: '[![image](abc123)](https://example.com)',
      id: 'abc123',
      href: 'https://example.com',
    } as unknown as MarkdownToken;
    const createdNodes: Array<{ type: string; attrs?: unknown; content?: unknown[] }> = [];
    const helpers = {
      parseInline: () => [],
      parseChildren: () => [],
      createTextNode: () => ({ type: 'text', text: '' }),
      createNode: (type: string, attrs?: unknown, content?: unknown[]) => {
        const node: Record<string, unknown> = { type };
        if (attrs) node.attrs = attrs;
        if (content) node.content = content;
        createdNodes.push(node as { type: string; attrs?: unknown; content?: unknown[] });
        return node;
      },
      applyMark: () => ({ mark: '', content: [] }),
    };

    // when
    const result = CmsImageInline.config.parseMarkdown?.(token, helpers as never);

    // then: paragraph でラップされている
    expect(result).toBeDefined();
    expect((result as Record<string, unknown>).type).toBe('paragraph');

    // cmsImageInline ノードが content に含まれる
    const content = (result as Record<string, unknown>).content as Array<Record<string, unknown>>;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe('cmsImageInline');
    expect((content[0].attrs as Record<string, unknown>).id).toBe('abc123');

    // Link Mark が付与されている
    const marks = content[0].marks as Array<Record<string, unknown>>;
    expect(marks).toHaveLength(1);
    expect(marks[0].type).toBe('link');
    expect((marks[0].attrs as Record<string, unknown>).href).toBe('https://example.com');
  });
});

describe('block cmsImage と inline cmsImageInline の共存', () => {
  it('既存block cmsImageのJSONがそのまま読み込める', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        { type: 'cmsImage', attrs: { id: 'block1' } },
        { type: 'paragraph', content: [{ type: 'text', text: 'テキスト' }] },
        { type: 'cmsImage', attrs: { id: 'block2' } },
      ],
    };

    // when
    const editor = createEditor(content);
    const json = editor.getJSON();
    const html = editor.getHTML();

    // then
    expect(html).toContain('data-asset-id="block1"');
    expect(html).toContain('data-asset-id="block2"');

    const blockImages = collectNodes(json as Record<string, unknown>, 'cmsImage');
    expect(blockImages).toHaveLength(2);

    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect(inlineImages).toHaveLength(0);

    editor.destroy();
  });

  it('<a><img>をcmsImageInline、単独<img>をcmsImageとしてパースする', () => {
    // given
    const html =
      '<img data-asset-id="standalone"><p>テキスト<a href="https://example.com"><img data-asset-id="linked"></a></p>';

    // when
    const editor = createEditor(html);
    const json = editor.getJSON();
    const outputHtml = editor.getHTML();

    // then
    expect(outputHtml).toContain('data-asset-id="standalone"');
    expect(outputHtml).toContain('data-asset-id="linked"');
    expect(outputHtml).toContain('href="https://example.com"');

    const blockImages = collectNodes(json as Record<string, unknown>, 'cmsImage');
    expect(blockImages).toHaveLength(1);
    expect((blockImages[0].attrs as Record<string, unknown>).id).toBe('standalone');

    const inlineImages = collectNodes(json as Record<string, unknown>, 'cmsImageInline');
    expect(inlineImages).toHaveLength(1);
    expect((inlineImages[0].attrs as Record<string, unknown>).id).toBe('linked');

    editor.destroy();
  });

  it('block cmsImageをcmsImageInlineに変換してLinkを付与できる', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        { type: 'cmsImage', attrs: { id: 'convert-me' } },
        { type: 'paragraph', content: [{ type: 'text', text: '後続テキスト' }] },
      ],
    };
    const editor = createEditor(content);

    // when: block cmsImage の位置を取得
    let imagePos = -1;
    let imageNode: unknown = null;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImage' && imagePos === -1) {
        imagePos = pos;
        imageNode = node;
      }
    });

    // block → paragraph > cmsImageInline に変換
    const { tr, schema } = editor.state;
    const inlineType = schema.nodes.cmsImageInline;
    const inlineNode = inlineType.create({ id: 'convert-me' });
    const paragraph = schema.nodes.paragraph.create(null, inlineNode);
    tr.replaceWith(imagePos, imagePos + (imageNode as { nodeSize: number }).nodeSize, paragraph);
    editor.view.dispatch(tr);

    // 変換後の位置を再取得して Link 付与
    let inlinePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') inlinePos = pos;
    });
    editor.commands.setTextSelection({ from: inlinePos, to: inlinePos + 1 });
    editor.commands.setLink({ href: 'https://example.com', target: '_blank' });

    // then
    const html = editor.getHTML();
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('data-asset-id="convert-me"');
    expect(html).toContain('後続テキスト');

    editor.destroy();
  });

  it('テーブルセル内のblock cmsImageも共存で問題なし', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [{ type: 'cmsImage', attrs: { id: 'tbl-block' } }],
                },
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'セル2' }] }],
                },
              ],
            },
          ],
        },
      ],
    };

    // when
    const editor = createEditor(content);
    const html = editor.getHTML();

    // then
    expect(html).toContain('data-asset-id="tbl-block"');

    const blockImages = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImage');
    expect(blockImages).toHaveLength(1);

    editor.destroy();
  });
});

describe('cmsImageInline エディタ操作安全性', () => {
  const baseContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '前' },
          { type: 'cmsImageInline', attrs: { id: 'img1' } },
          { type: 'text', text: '後' },
        ],
      },
    ],
  };

  it('画像の前にテキスト入力しても画像が消えない', () => {
    // given
    const editor = createEditor(baseContent);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection(imagePos);
    editor.commands.insertContent('追加');

    // then
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);

    editor.destroy();
  });

  it('画像の後にテキスト入力しても画像が消えない', () => {
    // given
    const editor = createEditor(baseContent);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection(imagePos + 1);
    editor.commands.insertContent('追加');

    // then
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);

    editor.destroy();
  });

  it('画像直後でBackspaceすると画像が削除される', () => {
    // given
    const editor = createEditor(baseContent);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection(imagePos + 1);
    editor.commands.deleteRange({ from: imagePos, to: imagePos + 1 });

    // then
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(0);

    editor.destroy();
  });

  it('画像を選択してDeleteしても他のコンテンツが壊れない', () => {
    // given
    const editor = createEditor(baseContent);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setNodeSelection(imagePos);
    editor.commands.deleteSelection();

    // then
    const html = editor.getHTML();
    expect(html).toContain('前');
    expect(html).toContain('後');
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(0);

    editor.destroy();
  });

  it('画像のみの段落でEnterしても画像が消えない', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'cmsImageInline', attrs: { id: 'img1' } }],
        },
      ],
    };
    const editor = createEditor(content);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection(imagePos + 1);
    editor.commands.splitBlock();

    // then
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    expect(images).toHaveLength(1);

    editor.destroy();
  });

  it('テーブルセル内の画像にLink付与しても消えない', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'cmsImageInline', attrs: { id: 'tbl-img1' } }],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'セル2' }] }],
                },
              ],
            },
          ],
        },
      ],
    };
    const editor = createEditor(content);

    // when
    let imagePos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') imagePos = pos;
    });
    editor.commands.setTextSelection({ from: imagePos, to: imagePos + 1 });
    editor.commands.setLink({ href: 'https://example.com', target: '_blank' });

    // then
    const html = editor.getHTML();
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('data-asset-id="tbl-img1"');

    editor.destroy();
  });

  it('複数画像が連続する段落で1つ削除しても他が消えない', () => {
    // given
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'cmsImageInline', attrs: { id: 'a' } },
            { type: 'cmsImageInline', attrs: { id: 'b' } },
            { type: 'cmsImageInline', attrs: { id: 'c' } },
          ],
        },
      ],
    };
    const editor = createEditor(content);

    // when: 2番目の画像を選択して削除
    const positions: number[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'cmsImageInline') positions.push(pos);
    });
    editor.commands.setNodeSelection(positions[1]);
    editor.commands.deleteSelection();

    // then
    const images = collectNodes(editor.getJSON() as Record<string, unknown>, 'cmsImageInline');
    const ids = images.map((n) => (n.attrs as Record<string, unknown>).id);
    expect(ids).toEqual(['a', 'c']);

    editor.destroy();
  });
});
