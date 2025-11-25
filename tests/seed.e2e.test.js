const { runSeed } = require("./helpers/seedData");

describe("Seed data setup", () => {
  test("creates baseline fixtures via API", async () => {
    const payload = await runSeed();
    expect(payload?.users?.admin?.token).toBeTruthy();
    expect(payload?.exam?.id).toBeTruthy();
    expect(payload?.lesson?.id).toBeTruthy();
  });
});
