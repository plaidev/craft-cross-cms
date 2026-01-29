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
      // given: HTMLコンテンツにspan[class]が含まれる
      const html = '<p><span class="custom-highlight">テキスト</span></p>';

      // when: EditorにHTMLを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then: customClassマークとして認識される
      const json = editor.getJSON();
      expect(json.content?.[0]?.content?.[0]?.marks).toEqual([
        { type: 'customClass', attrs: { class: 'custom-highlight' } },
      ]);

      editor.destroy();
    });

    it('should parse span with multiple classes as customClass mark', () => {
      // given: HTMLコンテンツにspan[class]で複数クラスが含まれる
      const html = '<p><span class="custom-highlight another-class">テキスト</span></p>';

      // when: EditorにHTMLを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then: customClassマークとして認識される
      const json = editor.getJSON();
      expect(json.content?.[0]?.content?.[0]?.marks).toEqual([
        { type: 'customClass', attrs: { class: 'custom-highlight another-class' } },
      ]);

      editor.destroy();
    });

    it('should not parse span without class attribute', () => {
      // given: HTMLコンテンツにclassのないspanが含まれる
      const html = '<p><span>テキスト</span></p>';

      // when: EditorにHTMLを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content: html,
      });

      // then: customClassマークとして認識されない
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
      // given: customClassマークを持つJSON
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: span[class]とdata-custom-class属性として出力される
      const html = editor.getHTML();
      expect(html).toBe(
        '<p><span data-custom-class="true" class="custom-highlight">テキスト</span></p>',
      );

      editor.destroy();
    });

    it('should not render class attribute when class is null', () => {
      // given: customClassマークでclass属性がnull
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: classがnullの場合でもspanタグとdata属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class contains uppercase letters', () => {
      // given: customClassマークで大文字を含むclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should render class attribute with multiple classes separated by space', () => {
      // given: customClassマークで複数クラスをスペース区切りで指定
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: 複数クラスとdata属性が正しく出力される
      const html = editor.getHTML();
      expect(html).toBe(
        '<p><span data-custom-class="true" class="my-class another-class">テキスト</span></p>',
      );

      editor.destroy();
    });

    it('should not render class attribute when class has leading space', () => {
      // given: customClassマークで先頭にスペースを含むclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class has trailing space', () => {
      // given: customClassマークで末尾にスペースを含むclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class has consecutive spaces', () => {
      // given: customClassマークで連続スペースを含むclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class contains special characters', () => {
      // given: customClassマークで特殊文字を含むclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });

    it('should not render class attribute when class is empty string', () => {
      // given: customClassマークで空文字列のclass
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

      // when: EditorにJSONを設定
      const editor = new Editor({
        extensions: [StarterKit, CustomClass],
        content,
      });

      // then: バリデーションで無効と判定されclass属性は出力されないが、data属性は残る
      const html = editor.getHTML();
      expect(html).toBe('<p><span data-custom-class="true">テキスト</span></p>');

      editor.destroy();
    });
  });

  describe('commands', () => {
    describe('setCustomClass', () => {
      it('should apply customClass mark to selected text', () => {
        // given: テキストが選択された状態のEditor
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p>テキスト</p>',
        });

        // when: setCustomClassコマンドを実行
        editor.commands.setTextSelection({ from: 1, to: 5 }); // "テキスト"を選択
        editor.commands.setCustomClass({ class: 'my-class' });

        // then: customClassマークとdata属性が適用される
        const html = editor.getHTML();
        expect(html).toBe('<p><span data-custom-class="true" class="my-class">テキスト</span></p>');

        editor.destroy();
      });

      it('should update existing customClass mark', () => {
        // given: 既にcustomClassマークが適用されているテキスト
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p><span data-custom-class="true" class="old-class">テキスト</span></p>',
        });

        // when: setCustomClassコマンドで別のクラスを設定
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.setCustomClass({ class: 'new-class' });

        // then: クラスが更新される
        const html = editor.getHTML();
        expect(html).toBe(
          '<p><span data-custom-class="true" class="new-class">テキスト</span></p>',
        );

        editor.destroy();
      });
    });

    describe('unsetCustomClass', () => {
      it('should remove customClass mark from selected text', () => {
        // given: customClassマークが適用されているテキスト
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p><span data-custom-class="true" class="my-class">テキスト</span></p>',
        });

        // when: unsetCustomClassコマンドを実行
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.unsetCustomClass();

        // then: customClassマークが削除される
        const html = editor.getHTML();
        expect(html).toBe('<p>テキスト</p>');

        editor.destroy();
      });

      it('should do nothing if customClass mark is not present', () => {
        // given: customClassマークがないテキスト
        const editor = new Editor({
          extensions: [StarterKit, CustomClass],
          content: '<p>テキスト</p>',
        });

        // when: unsetCustomClassコマンドを実行
        editor.commands.setTextSelection({ from: 1, to: 5 });
        editor.commands.unsetCustomClass();

        // then: 何も変わらない
        const html = editor.getHTML();
        expect(html).toBe('<p>テキスト</p>');

        editor.destroy();
      });
    });
  });

  describe('options', () => {
    it('should merge HTMLAttributes from options', () => {
      // given: HTMLAttributesオプションを持つCustomClass
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

      // when: HTMLを出力
      const html = editor.getHTML();

      // then: デフォルトのdata-custom-class属性とオプションの属性とclass属性がマージされる
      expect(html).toBe(
        '<p><span data-custom-class="true" data-custom="true" class="my-class">テキスト</span></p>',
      );

      editor.destroy();
    });
  });
});
