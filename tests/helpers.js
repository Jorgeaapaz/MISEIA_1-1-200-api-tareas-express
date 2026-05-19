const request = require('supertest');
const User = require('../src/models/User');

const createUser = async (username = 'testuser', password = 'password123') => {
  return User.create({ username, password });
};

const getToken = async (app, username = 'testuser', password = 'password123') => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password });
  return res.body.token;
};

const createTask = async (app, token, overrides = {}) => {
  const payload = { title: 'Test Task', status: 'pending', priority: 'medium', ...overrides };
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
  return res.body.data;
};

module.exports = { createUser, getToken, createTask };
