export default {
  testEnvironment: "node",

  globalSetup: "@hawkzone_labs/testkit/jest/globalSetup",
  globalTeardown: "@hawkzone_labs/testkit/jest/globalTeardown",

  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
