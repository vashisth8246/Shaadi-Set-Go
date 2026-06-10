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

describe('Auth endpoints (smoke)', () => {
  test('Register and login flow', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Test User', email: 'testuser@example.com', password: 'Password1', confirmPassword: 'Password1' })
      .expect(201);

    expect(registerRes.body).toHaveProperty('token');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'Password1' })
      .expect(200);

    expect(loginRes.body).toHaveProperty('token');
  });

  test('Forgot password returns success message', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'doesnotexist@example.com' })
      .expect(200);

    expect(res.body).toHaveProperty('message');
  });
});
