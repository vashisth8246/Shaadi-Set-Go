const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  app = require('../index');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Vendor endpoints (smoke)', () => {
  test('Register vendor requires auth', async () => {
    const res = await request(app)
      .post('/api/vendors/register')
      .send({ businessName: 'NoAuth Vendor' })
      .expect(401);

    expect(res.body).toHaveProperty('message');
  });
});
