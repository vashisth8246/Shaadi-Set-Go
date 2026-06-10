const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const JWT_SECRET = process.env.JWT_SECRET || 'shaddisetgo-secret-key';

let app;
let mongoServer;

const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET);

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

afterEach(async () => {
  await Promise.all([
    User.deleteMany({ email: { $ne: 'admin@gmail.com' } }),
    Vendor.deleteMany({}),
    mongoose.connection.collection('bookings').deleteMany({})
  ]);
});

describe('Booking request flow', () => {
  test('customer can create an open request and matching vendor can confirm it', async () => {
    const customer = await User.create({
      fullName: 'Customer One',
      email: 'customer@example.com',
      password: 'Password1',
      role: 'user'
    });

    const vendorUser = await User.create({
      fullName: 'Vendor One',
      email: 'vendor@example.com',
      password: 'Password1',
      role: 'vendor'
    });

    await Vendor.create({
      userId: vendorUser._id,
      businessName: 'Grand Venue',
      businessType: 'venue',
      description: 'A test venue',
      address: { city: 'Mumbai', state: 'MH' },
      contact: { email: 'grandvenue@example.com', phone: '9999999999' },
      pricing: { startingPrice: 50000, pricingType: 'per day' },
      images: ['https://example.com/venue.jpg'],
      approval: { status: 'approved', message: 'Approved' }
    });

    const customerToken = createToken(customer._id.toString());
    const vendorToken = createToken(vendorUser._id.toString());

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fullName: 'Customer One',
        email: 'customer@example.com',
        phone: '8888888888',
        weddingDate: '2026-12-10',
        serviceType: 'Venue',
        guests: 250,
        location: 'Mumbai',
        budget: 300000
      })
      .expect(201);

    expect(createRes.body.booking.status).toBe('open');
    expect(createRes.body.booking.vendorId).toBeNull();

    const vendorInboxRes = await request(app)
      .get('/api/bookings/vendor/my')
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(vendorInboxRes.body).toHaveLength(1);

    const bookingId = createRes.body.booking._id;

    const confirmRes = await request(app)
      .patch(`/api/bookings/${bookingId}/vendor-status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(confirmRes.body.booking.status).toBe('confirmed');
    expect(confirmRes.body.booking.vendorId.businessName).toBe('Grand Venue');

    await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(400);
  });
});
