import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['turbo.json'],
      project: ['**/*.{js,ts}'],
    },
    'packages/*': {
      project: ['src/**/*.{js,ts}'],
    },
  },
  ignore: ['**/dist/**', '**/.turbo/**'],
  ignoreDependencies: [
    // Used in .secretlintrc.json which knip doesn't parse
    '@secretlint/secretlint-rule-preset-recommend',
  ],
  ignoreExportsUsedInFile: true,
};

export default config;
