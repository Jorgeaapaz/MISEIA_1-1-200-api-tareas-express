const request = require('supertest');
const app = require('../src/server');
const { createUser } = require('./helpers');

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createUser('testuser', 'password123');
  });

  test('1 - valid credentials returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('expiresIn');
    expect(typeof res.body.token).toBe('string');
  });

  test('2 - wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('3 - unknown username returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('4 - missing username returns 422', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details.errors.some(e => e.field === 'username')).toBe(true);
  });

  test('5 - missing password returns 422', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details.errors.some(e => e.field === 'password')).toBe(true);
  });

  test('6 - empty body returns 422 with two errors', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details.errors).toHaveLength(2);
  });
});
