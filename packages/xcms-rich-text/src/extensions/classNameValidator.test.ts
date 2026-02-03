import { describe, expect, it } from 'vitest';
import { CLASS_NAME_PATTERN, isValidClassName } from './classNameValidator.js';

describe('classNameValidator', () => {
  describe('CLASS_NAME_PATTERN', () => {
    describe('valid class names', () => {
      it('should match single lowercase letter', () => {
        expect(CLASS_NAME_PATTERN.test('a')).toBe(true);
      });

      it('should match lowercase word', () => {
        expect(CLASS_NAME_PATTERN.test('myclass')).toBe(true);
      });

      it('should match hyphenated class name', () => {
        expect(CLASS_NAME_PATTERN.test('my-class')).toBe(true);
      });

      it('should match underscored class name', () => {
        expect(CLASS_NAME_PATTERN.test('my_class')).toBe(true);
      });

      it('should match class name with number', () => {
        expect(CLASS_NAME_PATTERN.test('class1')).toBe(true);
      });

      it('should match multiple classes separated by space', () => {
        expect(CLASS_NAME_PATTERN.test('my-class another-class')).toBe(true);
      });
    });

    describe('invalid class names', () => {
      it('should not match empty string', () => {
        expect(CLASS_NAME_PATTERN.test('')).toBe(false);
      });

      it('should not match class name starting with number', () => {
        expect(CLASS_NAME_PATTERN.test('1class')).toBe(false);
      });

      it('should not match class name starting with hyphen', () => {
        expect(CLASS_NAME_PATTERN.test('-class')).toBe(false);
      });

      it('should not match class name with uppercase letters', () => {
        expect(CLASS_NAME_PATTERN.test('MyClass')).toBe(false);
      });

      it('should not match class name with leading space', () => {
        expect(CLASS_NAME_PATTERN.test(' myclass')).toBe(false);
      });

      it('should not match class name with trailing space', () => {
        expect(CLASS_NAME_PATTERN.test('myclass ')).toBe(false);
      });

      it('should not match class name with consecutive spaces', () => {
        expect(CLASS_NAME_PATTERN.test('my  class')).toBe(false);
      });

      it('should not match class name with special characters', () => {
        expect(CLASS_NAME_PATTERN.test('my@class')).toBe(false);
      });
    });
  });

  describe('isValidClassName', () => {
    it('should return true for valid class names', () => {
      expect(isValidClassName('my-class')).toBe(true);
      expect(isValidClassName('my_class')).toBe(true);
      expect(isValidClassName('class1')).toBe(true);
      expect(isValidClassName('a')).toBe(true);
    });

    it('should return false for invalid class names', () => {
      expect(isValidClassName('')).toBe(false);
      expect(isValidClassName('1class')).toBe(false);
      expect(isValidClassName('MyClass')).toBe(false);
      expect(isValidClassName(' myclass')).toBe(false);
    });
  });
});
