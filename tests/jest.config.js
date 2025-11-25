module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 30000,
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
};
