import { loadTestEnv } from "@hawkzone_labs/testkit/env.js";

describe("loadTestEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("loads .env.test successfully", () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_TEST_URI =
      "mongodb+srv://admin:P%40%24%24w0rd%40M%40zen%402025@cluster0.dvvixke.mongodb.net/silat_test?retryWrites=true&w=majority";

    expect(() => loadTestEnv()).not.toThrow();
  });

  it("throws if NODE_ENV is not test", () => {
    process.env.NODE_ENV = "development";
    process.env.MONGO_TEST_URI =
      "mongodb+srv://admin:P%40%24%24w0rd%40M%40zen%402025@cluster0.dvvixke.mongodb.net/silat_test?retryWrites=true&w=majority";

    expect(() => loadTestEnv()).toThrow(/NODE_ENV=test/);
  });

  it("throws if MONGO_URI_TEST is missing", () => {
    process.env.NODE_ENV = "test";
    delete process.env.MONGO_TEST_URI;

    expect(() => loadTestEnv()).toThrow(/MONGO_TEST_URI/);
  });
});
