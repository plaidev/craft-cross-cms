/**
 * Regular expression pattern for class name validation
 *
 * Rules:
 * - Must start with a lowercase letter
 * - Allowed characters: lowercase alphanumeric, hyphens, underscores, spaces
 * - Must not end with a space
 * - Consecutive spaces are not allowed
 *
 * Examples:
 * - Valid: "my-class", "my class", "class-1"
 * - Invalid: "1-class" (starts with digit), "my-class " (trailing space), "my  class" (consecutive spaces)
 */
export const CLASS_NAME_PATTERN = /^[a-z]([a-z0-9_-]| [a-z0-9_-])*$/;

/**
 * Validates if a string is a valid CSS class name.
 * Allows lowercase alphanumeric characters, hyphens, underscores, and spaces.
 * Multiple classes can be specified separated by spaces.
 */
export const isValidClassName = (className: string): boolean => {
  return CLASS_NAME_PATTERN.test(className);
};
