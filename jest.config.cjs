module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./jest.setup.js'],
  collectCoverage: false,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/config/jest/cssTransform.cjs',
    '\\.(svg(\\?react)?|png)$': '<rootDir>/config/jest/fileTransform.cjs',
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'es2022',
        target: 'es2022',
        jsx: 'react-jsx',
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};
