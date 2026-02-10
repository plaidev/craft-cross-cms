/**
 * @vitest-environment jsdom
 */
import type { MarkdownLexerConfiguration, MarkdownToken } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { describe, expect, it, vi } from 'vitest';
import { generateCmsImage, ResolveAssetFn } from './cmsImage.js';

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

describe('cmsImage Extension', () => {
  describe('parseHTML', () => {
    it('should parse data-asset-id attribute', () => {
      // given
      const html = '<img data-asset-id="asset123" src="https://example.com/image.jpg" />';

      // when
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.attrs?.id).toBe('asset123');

      editor.destroy();
    });

    it('should parse src attribute', () => {
      // given
      const html = '<img data-asset-id="asset123" src="https://example.com/image.jpg" />';

      // when
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.attrs?.src).toBe('https://example.com/image.jpg');

      editor.destroy();
    });

    it('should parse alt attribute', () => {
      // given
      const html =
        '<img data-asset-id="asset123" src="https://example.com/image.jpg" alt="Test image" />';

      // when
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.attrs?.alt).toBe('Test image');

      editor.destroy();
    });

    it('should parse width and height attributes', () => {
      // given
      const html =
        '<img data-asset-id="asset123" src="https://example.com/image.jpg" width="800" height="600" />';

      // when
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.attrs?.width).toBe('800');
      expect(json.content?.[0]?.attrs?.height).toBe('600');

      editor.destroy();
    });
  });

  describe('renderHTML', () => {
    it('should render with resolveAsset when asset is found', () => {
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
        altText: 'Resolved alt text',
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

      const CmsImage = generateCmsImage({ resolveAsset });
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: {
          type: 'doc',
          content: [
            {
              type: 'cmsImage',
              attrs: { id: 'asset123' },
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toContain('src="https://cdn.example.com/resolved.jpg"');
      expect(html).toContain('alt="Resolved alt text"');
      expect(html).toContain('width="1200"');
      expect(html).toContain('height="800"');

      editor.destroy();
    });

    it('should render with empty src when resolveAsset is not provided', () => {
      // given
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: {
          type: 'doc',
          content: [
            {
              type: 'cmsImage',
              attrs: { id: 'asset123' },
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toContain('data-asset-id="asset123"');

      editor.destroy();
    });

    it('should render with empty src when asset is not found', () => {
      // given
      const resolveAsset: ResolveAssetFn = () => null;

      const CmsImage = generateCmsImage({ resolveAsset });
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: {
          type: 'doc',
          content: [
            {
              type: 'cmsImage',
              attrs: { id: 'asset123' },
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toContain('<img');
      expect(html).toContain('src=""');

      editor.destroy();
    });
  });

  describe('Markdown', () => {
    it('should render markdown format', () => {
      // given
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: {
          type: 'doc',
          content: [
            {
              type: 'cmsImage',
              attrs: { id: 'asset123' },
            },
          ],
        },
      });

      // when
      const nodeJson = editor.getJSON().content![0]!;
      const result = CmsImage.config.renderMarkdown?.(nodeJson, stubHelpers, stubCtx);

      // then
      expect(result).toBe('![image](asset123)\n\n');

      editor.destroy();
    });

    it('should return empty string when id is not a string', () => {
      // given
      const CmsImage = generateCmsImage({});
      const editor = new Editor({
        extensions: [StarterKit, CmsImage],
        content: {
          type: 'doc',
          content: [
            {
              type: 'cmsImage',
              attrs: { id: null },
            },
          ],
        },
      });

      // when
      const nodeJson = editor.getJSON().content![0]!;
      const result = CmsImage.config.renderMarkdown?.(nodeJson, stubHelpers, stubCtx);

      // then
      expect(result).toBe('');

      editor.destroy();
    });
  });

  describe('markdownTokenizer', () => {
    it('should tokenize markdown image syntax', () => {
      // given
      const src = '![image](abc123)';
      const CmsImage = generateCmsImage({});
      const tokenizer = CmsImage.config.markdownTokenizer;

      // when
      const result = tokenizer?.tokenize(src, stubTokens, stubLexer);

      // then
      expect(result).toEqual({
        type: 'cmsImage',
        raw: '![image](abc123)',
        id: 'abc123',
      });
    });

    it('should return undefined for non-matching input', () => {
      // given
      const src = 'Just some text';
      const CmsImage = generateCmsImage({});
      const tokenizer = CmsImage.config.markdownTokenizer;

      // when
      const result = tokenizer?.tokenize(src, stubTokens, stubLexer);

      // then
      expect(result).toBeUndefined();
    });

    it('should find start position of markdown image', () => {
      // given
      const src = 'Some text ![image](abc123) more text';
      const CmsImage = generateCmsImage({});
      const { start } = CmsImage.config.markdownTokenizer ?? {};

      // when
      const result = typeof start === 'function' ? start(src) : undefined;

      // then
      expect(result).toBe(10);
    });
  });

  describe('imageRenderer', () => {
    it('should set addNodeView when imageRenderer is provided', () => {
      // given
      const imageRenderer = vi.fn();

      // when
      const CmsImage = generateCmsImage({ imageRenderer });

      // then
      expect(CmsImage.config.addNodeView).toBe(imageRenderer);
    });

    it('should not set addNodeView when imageRenderer is not provided', () => {
      // when
      const CmsImage = generateCmsImage({});

      // then
      expect(CmsImage.config.addNodeView).toBeUndefined();
    });
  });
});
