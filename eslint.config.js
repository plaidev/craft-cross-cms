import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/dist/**', '**/coverage/**', '**/*.tsbuildinfo', '.turbo/**', '**/*.md']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
);
