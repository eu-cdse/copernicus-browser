module.exports = {
  collectCoverage: false,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/config/jest/cssTransform.js',
    '\\.(svg(\\?react)?|png)$': '<rootDir>/config/jest/fileTransform.js',
  },
};
