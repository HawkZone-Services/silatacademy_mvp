import mongoose from "mongoose";

export const connectTestDb = async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
};

export const clearTestDb = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const closeTestDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
