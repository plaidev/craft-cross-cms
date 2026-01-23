import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['turbo.json'],
      project: ['**/*.{js,ts}'],
    },
    'packages/*': {
      entry: ['src/index.ts'],
      project: ['src/**/*.{js,ts}'],
    },
  },
  ignore: ['**/dist/**', '**/.turbo/**'],
  ignoreDependencies: [],
  ignoreExportsUsedInFile: true,
};

export default config;
