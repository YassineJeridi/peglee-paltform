module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupAfterEnv.js'],
  testTimeout: 30000,
};
