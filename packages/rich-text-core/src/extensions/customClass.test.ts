/**
 * @vitest-environment jsdom
 */
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { describe, expect, it } from 'vitest';
import { CustomClass } from './customClass.js';

describe('CustomClass Extension', () => {
  describe('parseHTML', () => {
    it('should parse span with class attribute as customClass mark', () => {
      // given
      const html = '<p><span class="custom-highlight">テキスト</span></p>';

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.content?.[0]?.marks).toEqual([
        { type: 'customClass', attrs: { class: 'custom-highlight' } },
      ]);

      editor.destroy();
    });

    it('should parse span with multiple classes as customClass mark', () => {
      // given with multiple classes
      const html = '<p><span class="custom-highlight another-class">テキスト</span></p>';

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.content?.[0]?.marks).toEqual([
        { type: 'customClass', attrs: { class: 'custom-highlight another-class' } },
      ]);

      editor.destroy();
    });

    it('should not parse span without class attribute', () => {
      // given
      const html = '<p><span>テキスト</span></p>';

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then
      const json = editor.getJSON();
      expect(json.content?.[0]?.content?.[0]).toEqual({
        type: 'text',
        text: 'テキスト',
      });

      editor.destroy();
    });
  });

  describe('renderHTML', () => {
    it('should render customClass mark as span with class attribute and data attribute', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'custom-highlight' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe(
        '<p><span data-custom-class="true" class="custom-highlight">テキスト</span></p>',
      );

      editor.destroy();
    });

    it('should not render class attribute when class is null', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: null } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class contains uppercase letters', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'MyClass' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should render class attribute with multiple classes separated by space', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'my-class another-class' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe(
        '<p><span data-custom-class="true" class="my-class another-class">テキスト</span></p>',
      );

      editor.destroy();
    });

    it('should not render class attribute when class has leading space', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: ' my-class' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class has trailing space', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'my-class ' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class has consecutive spaces', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'my-class  another-class' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class contains special characters', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: 'my@class' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class is empty string', () => {
      // given
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'テキスト',
                marks: [{ type: 'customClass', attrs: { class: '' } }],
              },
            ],
          },
        ],
      };

      // when
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });
  });

  describe('commands', () => {
    describe('setCustomClass', () => {
      it('should apply customClass mark to selected text', () => {
        // given
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p>テキスト</p>',
        });

        // when
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.setCustomClass({ class: 'my-class' });

        // then
        const html = editor.getHTML();
        expect(html).toBe('<p><span data-custom-class="true" class="my-class">テキスト</span></p>');

        editor.destroy();
      });

      it('should update existing customClass mark', () => {
        // given
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p><span data-custom-class="true" class="old-class">テキスト</span></p>',
        });

        // when
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.setCustomClass({ class: 'new-class' });

        // then
        const html = editor.getHTML();
        expect(html).toBe(
          '<p><span data-custom-class="true" class="new-class">テキスト</span></p>',
        );

        editor.destroy();
      });
    });

    describe('unsetCustomClass', () => {
      it('should remove customClass mark from selected text', () => {
        // given
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p><span data-custom-class="true" class="my-class">テキスト</span></p>',
        });

        // when
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.unsetCustomClass();

        // then
        const html = editor.getHTML();
        expect(html).toBe('<p>テキスト</p>');

        editor.destroy();
      });

      it('should do nothing if customClass mark is not present', () => {
        // given
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p>テキスト</p>',
        });

        // when
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.unsetCustomClass();

        // then
        const html = editor.getHTML();
        expect(html).toBe('<p>テキスト</p>');

        editor.destroy();
      });
    });
  });

  describe('options', () => {
    it('should merge HTMLAttributes from options', () => {
      // given
      const editor = new Editor({
        extensions: [
          StarterKit,
          CustomClass.configure({
            HTMLAttributes: {
              'data-custom': 'true',
            },
          }),
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'テキスト',
                  marks: [{ type: 'customClass', attrs: { class: 'my-class' } }],
                },
              ],
            },
          ],
        },
      });

      // when
      const html = editor.getHTML();

      // then
      expect(html).toBe(
        '<p><span data-custom-class="true" data-custom="true" class="my-class">テキスト</span></p>',
      );

      editor.destroy();
    });
  });
});
