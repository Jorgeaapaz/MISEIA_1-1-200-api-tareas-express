const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';

  if (process.env.MONGODB_URI) {
    // CI: use the pre-set service container URI
    await mongoose.connect(process.env.MONGODB_URI);
  } else {
    // Local: spin up an in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});
