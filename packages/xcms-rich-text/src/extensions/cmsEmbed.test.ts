/**
 * @vitest-environment jsdom
 */
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { describe, expect, it, vi } from 'vitest';
import { generateCmsEmbedExtension } from './cmsEmbed.js';

describe('cmsEmbed Extension', () => {
  describe('addAttributes', () => {
    describe('type attribute', () => {
      it('should have default value of embed', () => {
        // given
        const CmsEmbed = generateCmsEmbedExtension({});
        const editor = new Editor({
          extensions: [StarterKit, CmsEmbed],
          content: {
            type: 'doc',
            content: [
              {
                type: 'embed',
                attrs: {},
              },
            ],
          },
        });

        // when
        const json = editor.getJSON();

        // then
        expect(json.content?.[0]?.attrs?.type).toBe('embed');

        editor.destroy();
      });
    });

    describe('url attribute', () => {
      it('should store url attribute', () => {
        // given
        const CmsEmbed = generateCmsEmbedExtension({});
        const editor = new Editor({
          extensions: [StarterKit, CmsEmbed],
          content: {
            type: 'doc',
            content: [
              {
                type: 'embed',
                attrs: {
                  url: 'https://youtube.com/watch?v=abc123',
                },
              },
            ],
          },
        });

        // when
        const json = editor.getJSON();

        // then
        expect(json.content?.[0]?.attrs?.url).toBe('https://youtube.com/watch?v=abc123');

        editor.destroy();
      });
    });

    describe('embedHtml attribute', () => {
      it('should store embedHtml attribute', () => {
        // given
        const CmsEmbed = generateCmsEmbedExtension({});
        const editor = new Editor({
          extensions: [StarterKit, CmsEmbed],
          content: {
            type: 'doc',
            content: [
              {
                type: 'embed',
                attrs: {
                  embedHtml: '<iframe src="https://example.com"></iframe>',
                },
              },
            ],
          },
        });

        // when
        const json = editor.getJSON();

        // then
        expect(json.content?.[0]?.attrs?.embedHtml).toBe(
          '<iframe src="https://example.com"></iframe>',
        );

        editor.destroy();
      });
    });
  });

  describe('renderHTML', () => {
    it('should render with data-embed-html when embedHtml is provided', () => {
      // given
      const CmsEmbed = generateCmsEmbedExtension({});
      const editor = new Editor({
        extensions: [StarterKit, CmsEmbed],
        content: {
          type: 'doc',
          content: [
            {
              type: 'embed',
              attrs: {
                type: 'embed',
                url: 'https://example.com',
                embedHtml: '<iframe src="https://example.com"></iframe>',
              },
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toContain('data-type="embed"');
      expect(html).toContain('data-embed-html');

      editor.destroy();
    });

    it('should render placeholder when embedHtml is not provided', () => {
      // given
      const CmsEmbed = generateCmsEmbedExtension({});
      const editor = new Editor({
        extensions: [StarterKit, CmsEmbed],
        content: {
          type: 'doc',
          content: [
            {
              type: 'embed',
              attrs: {
                type: 'embed',
                url: 'https://example.com',
                embedHtml: '',
              },
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toContain('embed-placeholder');
      expect(html).toContain('Embed Content Placeholder');

      editor.destroy();
    });
  });

  describe('commands', () => {
    describe('setEmbed', () => {
      it('should insert embed node with provided options', () => {
        // given
        const CmsEmbed = generateCmsEmbedExtension({});
        const editor = new Editor({
          extensions: [StarterKit, CmsEmbed],
          content: '<p>Some text</p>',
        });

        // when
        editor.commands.setEmbed({
          url: 'https://youtube.com/watch?v=abc123',
          html: '<iframe src="https://youtube.com/embed/abc123"></iframe>',
        });

        // then
        const json = editor.getJSON();
        const embedNode = json.content?.find((node) => node.type === 'embed');
        expect(embedNode).toBeDefined();
        expect(embedNode?.attrs?.url).toBe('https://youtube.com/watch?v=abc123');
        expect(embedNode?.attrs?.embedHtml).toBe(
          '<iframe src="https://youtube.com/embed/abc123"></iframe>',
        );

        editor.destroy();
      });
    });

    describe('removeEmbed', () => {
      it('should have removeEmbed command registered', () => {
        // given
        const CmsEmbed = generateCmsEmbedExtension({});
        const editor = new Editor({
          extensions: [StarterKit, CmsEmbed],
          content: '<p></p>',
        });

        // then
        expect(typeof editor.commands.removeEmbed).toBe('function');

        editor.destroy();
      });
    });
  });

  describe('renderer', () => {
    it('should set addNodeView when renderer is provided', () => {
      // given
      const renderer = vi.fn();

      // when
      const CmsEmbed = generateCmsEmbedExtension({ renderer });

      // then
      expect(CmsEmbed.config.addNodeView).toBe(renderer);
    });

    it('should not set addNodeView when renderer is not provided', () => {
      // when
      const CmsEmbed = generateCmsEmbedExtension({});

      // then
      expect(CmsEmbed.config.addNodeView).toBeUndefined();
    });
  });
});
