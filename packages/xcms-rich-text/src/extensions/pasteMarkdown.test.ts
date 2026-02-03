import { describe, expect, it } from 'vitest';
import { looksLikeMarkdown } from './pasteMarkdown.js';

describe('pasteMarkdown', () => {
  describe('looksLikeMarkdown', () => {
    describe('should return true for Markdown patterns', () => {
      it('should detect heading pattern', () => {
        expect(looksLikeMarkdown('# Heading')).toBe(true);
        expect(looksLikeMarkdown('## Heading 2')).toBe(true);
        expect(looksLikeMarkdown('### Heading 3')).toBe(true);
        expect(looksLikeMarkdown('###### Heading 6')).toBe(true);
      });

      it('should detect unordered list pattern', () => {
        expect(looksLikeMarkdown('- item')).toBe(true);
        expect(looksLikeMarkdown('* item')).toBe(true);
        expect(looksLikeMarkdown('+ item')).toBe(true);
      });

      it('should detect ordered list pattern', () => {
        expect(looksLikeMarkdown('1. first item')).toBe(true);
        expect(looksLikeMarkdown('10. tenth item')).toBe(true);
      });

      it('should detect blockquote pattern', () => {
        expect(looksLikeMarkdown('> quoted text')).toBe(true);
      });

      it('should detect code block pattern', () => {
        expect(looksLikeMarkdown('```javascript\ncode\n```')).toBe(true);
        expect(looksLikeMarkdown('```\ncode\n```')).toBe(true);
      });

      it('should detect bold pattern', () => {
        expect(looksLikeMarkdown('This is **bold** text')).toBe(true);
      });

      it('should detect italic pattern', () => {
        expect(looksLikeMarkdown('This is *italic* text')).toBe(true);
      });

      it('should detect link pattern', () => {
        expect(looksLikeMarkdown('[link text](https://example.com)')).toBe(true);
        expect(looksLikeMarkdown('Check out [this link](http://example.com)')).toBe(true);
      });

      it('should detect horizontal rule pattern', () => {
        expect(looksLikeMarkdown('---')).toBe(true);
        expect(looksLikeMarkdown('----')).toBe(true);
        expect(looksLikeMarkdown('Some text\n---\nMore text')).toBe(true);
      });

      it('should detect table pattern', () => {
        expect(looksLikeMarkdown('| cell | cell |')).toBe(true);
        expect(looksLikeMarkdown('| header1 | header2 |\n|---|---|')).toBe(true);
      });
    });

    describe('should return false for non-Markdown text', () => {
      it('should not detect plain text', () => {
        expect(looksLikeMarkdown('Just some plain text')).toBe(false);
      });

      it('should not detect text with hash but no space', () => {
        expect(looksLikeMarkdown('#hashtag')).toBe(false);
      });

      it('should not detect text with single asterisk at word boundary', () => {
        expect(looksLikeMarkdown('5*3=15')).toBe(false);
      });

      it('should not detect empty string', () => {
        expect(looksLikeMarkdown('')).toBe(false);
      });

      it('should not detect text that looks like a hyphenated word', () => {
        expect(looksLikeMarkdown('self-contained')).toBe(false);
      });
    });
  });
});
