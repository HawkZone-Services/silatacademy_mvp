import { connectTestDb } from "@hawkzone_labs/testkit/db.js";

describe("Safety guards", () => {
  it("refuses to connect to non-test database", async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_TEST_URI =
      "mongodb+srv://admin:P%40%24%24w0rd%40M%40zen%402025@cluster0.dvvixke.mongodb.net/silat_test?retryWrites=true&w=majority";
    process.env.DB_TEST_NAME = "production_db"; // ❌ خطر

    await expect(connectTestDb()).rejects.toThrow(
      /Refusing to connect to non-test database/
    );
  });
});
