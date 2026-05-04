/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  restoreMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(jose)/)']
};
