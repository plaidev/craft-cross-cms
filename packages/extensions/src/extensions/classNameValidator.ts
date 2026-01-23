/**
 * クラス名バリデーション用の正規表現パターン
 *
 * ルール:
 * - 先頭: アルファベット（小文字）必須
 * - 使用可能文字: 英数字（小文字）、ハイフン、アンダースコア、スペース
 * - 末尾: スペース以外
 * - 連続スペース: 不可
 *
 * 例:
 * - OK: "my-class", "my class", "class-1"
 * - NG: "1-class" (数字始まり), "my-class " (末尾スペース), "my  class" (連続スペース)
 */
export const CLASS_NAME_PATTERN = /^[a-z]([a-z0-9_-]| [a-z0-9_-])*$/;

/**
 * CSSクラス名として有効な文字列かを検証
 * 英数字（小文字）、ハイフン、アンダースコア、スペースを許可
 * スペース区切りで複数クラス指定可能
 */
export const isValidClassName = (className: string): boolean => {
  return CLASS_NAME_PATTERN.test(className);
};
