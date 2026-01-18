const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.test" });

describe("🧪 Smoke Test – Jest & DB (self-contained)", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
      dbName: process.env.DB_TEST_NAME || "silat_test",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("MongoDB is connected", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
