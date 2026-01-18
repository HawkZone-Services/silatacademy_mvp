const mongoose = require("mongoose");

import {
  connectTestDb,
  clearTestDb,
  closeTestDb,
} from "@hawkzone_labs/testkit/db.js";

describe("Test DB lifecycle", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_TEST_URI =
      "mongodb+srv://admin:P%40%24%24w0rd%40M%40zen%402025@cluster0.dvvixke.mongodb.net/silat_test?retryWrites=true&w=majority";
    process.env.DB_TEST_NAME = "silat_test";

    await connectTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("connects to MongoDB", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("clears collections safely", async () => {
    const TestModel = mongoose.model(
      "Tmp",
      new mongoose.Schema({ name: String })
    );

    await TestModel.create({ name: "test" });
    expect(await TestModel.countDocuments()).toBe(1);

    await clearTestDb();
    expect(await TestModel.countDocuments()).toBe(0);
  });

  it("closes the database connection", async () => {
    await closeTestDb();
    expect(mongoose.connection.readyState).toBe(0);
  });
});
