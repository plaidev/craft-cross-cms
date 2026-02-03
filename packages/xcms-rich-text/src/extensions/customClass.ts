import { Mark, mergeAttributes } from '@tiptap/core';
import { isValidClassName } from './classNameValidator.js';

export interface CustomClassOptions {
  /**
   * HTML attributes to add to the span element.
   * @default { 'data-custom-class': 'true' }
   * @example { 'data-custom': 'true' }
   */
  HTMLAttributes: Record<string, string | number | boolean | undefined>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customClass: {
      /**
       * Set a custom class mark
       * @param attributes The class attributes
       * @example editor.commands.setCustomClass({ class: 'my-class' })
       */
      setCustomClass: (attributes: { class: string }) => ReturnType;
      /**
       * Unset a custom class mark
       * @example editor.commands.unsetCustomClass()
       */
      unsetCustomClass: () => ReturnType;
    };
  }
}

/**
 * This extension allows you to add custom CSS classes to text.
 */
export const CustomClass = Mark.create<CustomClassOptions>({
  name: 'customClass',
  // Same priority as TextStyleKit (101). Processed at the same level as basic text
  // decorations like Bold/Italic and can coexist with them.
  priority: 101,

  addOptions() {
    return {
      HTMLAttributes: {
        'data-custom-class': 'true',
      },
    };
  },

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes: { class: string | null }) => {
          if (!attributes.class || !isValidClassName(attributes.class)) {
            return {};
          }

          return {
            class: attributes.class,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[class]',
        // Lower priority than TextStyle (101). This ensures `<span style="...">`
        // is parsed as TextStyle first, and only class-only spans are handled
        // by this extension.
        priority: 51,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCustomClass:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetCustomClass:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
