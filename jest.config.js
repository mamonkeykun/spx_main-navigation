module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/src/__mocks__/styleMock.ts',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts'],
  coverageThresholds: {
    global: { lines: 60 },
    './src/extensions/topNavigation/hooks/': { lines: 80 },
  },
};
